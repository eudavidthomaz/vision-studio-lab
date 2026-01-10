import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  validateInput, 
  checkRateLimit, 
  logSecurityEvent,
  sanitizeText,
  createAuthenticatedClient,
  ValidationError,
  RateLimitError
} from "../_shared/security.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extract file extension from audio URL for Groq API compatibility
function getFileExtension(audioUrl: string): string {
  const supportedExtensions = ['.flac', '.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.ogg', '.opus', '.wav', '.webm'];
  const lowerUrl = audioUrl.toLowerCase();
  
  for (const ext of supportedExtensions) {
    if (lowerUrl.endsWith(ext)) {
      return ext;
    }
  }
  
  // Default to .mp3 if extension not recognized
  return '.mp3';
}

// Cleanup audio from storage after processing
async function cleanupAudio(supabaseClient: any, audioPath: string) {
  try {
    await supabaseClient.storage.from('sermons').remove([audioPath]);
    console.log(`Cleaned up audio: ${audioPath}`);
  } catch (err) {
    console.warn('Failed to cleanup audio:', err);
  }
}

// Asynchronous transcription processing for large files
async function processTranscriptionAsync(
  supabaseClient: any,
  audioUrl: string,
  sermonId: string
) {
  try {
    console.log(`Starting async transcription for sermon ${sermonId}`);
    
    // Download audio from storage
    const { data: audioBlob, error: downloadError } = await supabaseClient.storage
      .from('sermons')
      .download(audioUrl);

    if (downloadError || !audioBlob) {
      throw new Error(`Failed to download audio: ${downloadError?.message}`);
    }

    const formData = new FormData();
    const fileExtension = getFileExtension(audioUrl);
    formData.append('file', audioBlob, `audio${fileExtension}`);
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', 'pt');
    formData.append('response_format', 'text');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const transcriptText = await response.text();
    const sanitizedTranscript = sanitizeText(transcriptText, 50000);

    // Update sermon with completed transcription
    const { error: updateError } = await supabaseClient
      .from('sermons')
      .update({
        transcript: sanitizedTranscript,
        status: 'completed',
      })
      .eq('id', sermonId);

    if (updateError) {
      console.error('Error updating sermon:', updateError);
      throw updateError;
    }

    // Cleanup audio from storage
    await cleanupAudio(supabaseClient, audioUrl);

    console.log(`Async transcription completed for sermon ${sermonId}`);
    
  } catch (error) {
    console.error('Error in async transcription:', error);
    
    // Update sermon with error status
    await supabaseClient
      .from('sermons')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', sermonId);
  }
}

serve(async (req) => {
  const startTime = Date.now();
  let userId: string | null = null;
  let supabaseClient: any = null;

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create authenticated client
    const auth = createAuthenticatedClient(req);
    supabaseClient = auth.client;
    userId = auth.userId;

    if (!userId) {
      throw new ValidationError('Authentication required');
    }

    // Check user role and quota for transcriptions
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    const userRole = roleData?.role || 'free';
    
    // Define transcription limits per role
    const transcriptionLimits: Record<string, number> = {
      free: 1,
      pro: 5,
      team: 20,
      admin: 9999
    };
    
    const limit = transcriptionLimits[userRole] || 1;

    // Check current usage
    const { data: quotaData } = await supabaseClient
      .from('usage_quotas')
      .select('transcriptions_used')
      .eq('user_id', userId)
      .single();

    const currentUsage = quotaData?.transcriptions_used || 0;
    
    if (currentUsage >= limit) {
      throw new ValidationError(`Limite de transcrições atingido (${currentUsage}/${limit}). Faça upgrade para mais transcrições.`);
    }

    // Check rate limit
    await checkRateLimit(supabaseClient, userId, 'transcribe-sermon');

    // Parse request body
    const body = await req.json();
    
    const { audio_url, metadata = {} } = body;

    // Validate audio_url
    if (!audio_url || typeof audio_url !== 'string') {
      throw new ValidationError('Missing or invalid audio_url');
    }

    console.log(`Processing audio from storage: ${audio_url}`);

    // Verify audio file exists in storage
    console.log(`Verifying audio exists in storage: ${audio_url}`);
    const pathParts = audio_url.split('/');
    const folder = pathParts.length > 1 ? pathParts[0] : '';
    const file = pathParts.length > 1 ? pathParts.slice(1).join('/') : audio_url;
    
    const { data: fileList, error: checkError } = await supabaseClient.storage
      .from('sermons')
      .list(folder || undefined, {
        search: file
      });

    if (checkError || !fileList || fileList.length === 0) {
      console.error('Audio file not found in storage:', audio_url, checkError);
      throw new ValidationError('Arquivo de áudio não encontrado no storage');
    }

    console.log('✅ Audio file verified in storage');

    // Calculate hash for deduplication (using URL to avoid downloading)
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(audio_url));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const audioHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    console.log(`Audio hash: ${audioHash}`);

    // Check for existing transcription with same hash
    const { data: existingSermon } = await supabaseClient
      .from('sermons')
      .select('id, transcript, status')
      .eq('user_id', userId)
      .eq('sermon_hash', audioHash)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingSermon && existingSermon.transcript) {
      console.log('Found existing transcription, returning cached result');
      
      // Cleanup duplicate audio
      await cleanupAudio(supabaseClient, audio_url);
      
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            transcript: existingSermon.transcript,
            sermon_id: existingSermon.id,
            cached: true,
          }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get file size from metadata
    const audioSizeInMB = (metadata.fileSize || 0) / (1024 * 1024);
    console.log(`Audio size: ${audioSizeInMB.toFixed(2)} MB`);

    // For large files (>10MB), process asynchronously
    if (audioSizeInMB > 10) {
      console.log('Large file detected, processing asynchronously');
      
      const { data: sermon, error: insertError } = await supabaseClient
        .from('sermons')
        .insert({
          user_id: userId,
          status: 'processing',
          sermon_hash: audioHash,
        })
        .select()
        .single();

      if (insertError || !sermon) {
        throw new Error(`Failed to create sermon record: ${insertError?.message}`);
      }

      // Start background processing
      processTranscriptionAsync(supabaseClient, audio_url, sermon.id).catch(err => 
        console.error('Background transcription error:', err)
      );

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            status: 'processing',
            sermon_id: sermon.id,
            message: 'Transcription started. Poll for completion.',
          }
        }),
        {
          status: 202,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // For smaller files, process synchronously
    console.log('Processing synchronously');
    const startTime = Date.now();

    // Download audio from storage
    const { data: audioBlob, error: downloadError } = await supabaseClient.storage
      .from('sermons')
      .download(audio_url);

    if (downloadError || !audioBlob) {
      throw new Error(`Failed to download audio: ${downloadError?.message}`);
    }

    // Prepare form data for Groq (Whisper Large V3)
    const formData = new FormData();
    const fileExtension = getFileExtension(audio_url);
    formData.append('file', audioBlob, `audio${fileExtension}`);
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', 'pt');
    formData.append('response_format', 'text');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const transcriptText = await response.text();
    const sanitizedTranscript = sanitizeText(transcriptText, 50000);
    const transcriptionTime = Date.now() - startTime;

    // Save transcription
    const { data: sermon, error: insertError } = await supabaseClient
      .from('sermons')
      .insert({
        user_id: userId,
        transcript: sanitizedTranscript,
        transcription_time_ms: transcriptionTime,
        status: 'completed',
        sermon_hash: audioHash,
      })
      .select()
      .single();

    if (insertError || !sermon) {
      throw new Error(`Failed to save transcription: ${insertError?.message}`);
    }

    console.log(`Transcription saved successfully. ID: ${sermon.id}, Time: ${transcriptionTime}ms`);

    // Cleanup audio from storage
    await cleanupAudio(supabaseClient, audio_url);

    // Log success
    await logSecurityEvent(
      supabaseClient,
      userId,
      'transcription_completed',
      'transcribe-sermon',
      true,
      undefined,
      { transcription_time_ms: transcriptionTime, audio_size_mb: audioSizeInMB }
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          transcript: sanitizedTranscript,
          sermon_id: sermon.id,
          transcription_time_ms: transcriptionTime,
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in transcribe-sermon:', error);

    // Log error
    if (supabaseClient && userId) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await logSecurityEvent(supabaseClient, userId, 'transcription_error', 'transcribe-sermon', false, errorMsg);
    }

    // Handle specific error types
    if (error instanceof ValidationError) {
      return new Response(
        JSON.stringify({ error: error.message, type: 'validation_error' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (error instanceof RateLimitError) {
      return new Response(
        JSON.stringify({ 
          error: error.message, 
          type: 'rate_limit_error',
          retry_after: error.retryAfter 
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(error.retryAfter))
          }
        }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
