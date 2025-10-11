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

// Detect MIME type from audio bytes
function detectAudioMimeType(bytes: Uint8Array): string {
  const header = Array.from(bytes.slice(0, 12))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  if (header.startsWith('494433') || header.startsWith('fffb')) return 'audio/mpeg'; // MP3
  if (header.startsWith('52494646')) return 'audio/wav'; // WAV
  if (header.slice(8, 16) === '66747970') return 'audio/mp4'; // M4A
  if (header.startsWith('1a45dfa3')) return 'audio/webm'; // WebM
  return 'audio/webm'; // fallback
}

// Async transcription processor
async function processTranscriptionAsync(
  supabaseClient: any,
  sermonId: string,
  audioBytes: Uint8Array,
  metadata: any,
  sermon_hash: string,
  userId: string
) {
  try {
    const startTime = Date.now();
    
    // Detect MIME and prepare audio
    const mimeType = detectAudioMimeType(audioBytes);
    const extension = mimeType.split('/')[1] || 'webm';
    const audioArray = Array.from(audioBytes); // Convert to regular array
    const blob = new Blob([new Uint8Array(audioArray)], { type: mimeType });
    
    const formData = new FormData();
    formData.append('file', new File([blob], `audio.${extension}`, { type: mimeType }));
    formData.append('model', 'gpt-4o-mini-transcribe'); // 50% cheaper than whisper-1
    formData.append('language', 'pt');
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}` },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI error: ${response.status}`);
    }
    
    const result = await response.json();
    const sanitizedTranscript = sanitizeText(result.text, 100000);
    const transcription_time_ms = Date.now() - startTime;
    
    // Update sermon with completed transcription
    await supabaseClient
      .from('sermons')
      .update({
        transcript: sanitizedTranscript,
        status: 'completed',
        transcription_time_ms,
        sermon_hash,
      })
      .eq('id', sermonId);
      
    console.log(`Async transcription completed for sermon ${sermonId} in ${transcription_time_ms}ms`);
  } catch (error) {
    console.error('Async transcription failed:', error);
    await supabaseClient
      .from('sermons')
      .update({ 
        status: 'failed', 
        error_message: error instanceof Error ? error.message : 'Unknown error' 
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

    // Check rate limit
    await checkRateLimit(supabaseClient, userId, 'transcribe-sermon');

    // Parse input (multipart or JSON)
    const contentType = req.headers.get('content-type') || '';
    let audioBytes: Uint8Array;
    let metadata: any = {};

    if (contentType.includes('multipart/form-data')) {
      // NEW: Receive multipart from frontend
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const metadataStr = formData.get('metadata') as string;
      
      if (!file) throw new ValidationError('No file provided');
      metadata = metadataStr ? JSON.parse(metadataStr) : {};
      audioBytes = new Uint8Array(await file.arrayBuffer());
      
      // Use real MIME/filename from frontend
      metadata.original_mime = metadata.original_mime || file.type;
      metadata.original_name = metadata.original_name || file.name;
    } else {
      // FALLBACK: Base64 (legacy, keep for compatibility)
      const body = await req.json();
      const { audio_base64 } = body;
      
      validateInput('audio_base64', {
        value: audio_base64,
        type: 'string',
        required: true,
        minLength: 100,
        maxLength: 50000000,
      });
      
      // Decode base64
      const binaryString = atob(audio_base64);
      audioBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        audioBytes[i] = binaryString.charCodeAt(i);
      }
    }

    // Calculate hash for deduplication
    const audioArrayForHash = Array.from(audioBytes);
    const hashBuffer = await crypto.subtle.digest('SHA-256', new Uint8Array(audioArrayForHash));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sermon_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check for duplicate (same user + same hash)
    const { data: existingSermon } = await supabaseClient
      .from('sermons')
      .select('id, transcript')
      .eq('user_id', userId)
      .eq('sermon_hash', sermon_hash)
      .maybeSingle();

    if (existingSermon && existingSermon.transcript) {
      console.log('Duplicate detected, returning cached transcript');
      await logSecurityEvent(supabaseClient, userId, 'transcription_cached', 'transcribe-sermon', true);
      return new Response(JSON.stringify({
        transcript: existingSermon.transcript,
        sermon_id: existingSermon.id,
        cached: true
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      });
    }

    // Check if audio is large (>10MB = async processing)
    const isLongAudio = audioBytes.length > 10 * 1024 * 1024;

    if (isLongAudio && contentType.includes('multipart')) {
      // Async processing for long audios
      const { data: sermon } = await supabaseClient
        .from('sermons')
        .insert({
          user_id: userId,
          status: 'processing',
          sermon_hash,
        })
        .select()
        .single();
      
      // Process in background (non-blocking)
      // Note: Deno Deploy doesn't support EdgeRuntime.waitUntil, so we'll use a Promise
      processTranscriptionAsync(
        supabaseClient, 
        sermon.id, 
        audioBytes, 
        metadata, 
        sermon_hash,
        userId
      ).catch(err => console.error('Background transcription error:', err));
      
      await logSecurityEvent(supabaseClient, userId, 'transcription_async_started', 'transcribe-sermon', true);
      
      return new Response(JSON.stringify({
        sermon_id: sermon.id,
        status: 'processing',
      }), { 
        status: 202, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Sync processing for small audios
    console.log('Processing audio synchronously...');

    // Detect MIME and prepare FormData
    const mimeType = detectAudioMimeType(audioBytes);
    const extension = mimeType.split('/')[1] || 'webm';
    const audioArrayForBlob = Array.from(audioBytes);
    const blob = new Blob([new Uint8Array(audioArrayForBlob)], { type: mimeType });
    
    const formData = new FormData();
    formData.append('file', new File([blob], `audio.${extension}`, { type: mimeType }));
    formData.append('model', 'gpt-4o-mini-transcribe'); // 50% cheaper ($0.003/min vs $0.006/min)
    formData.append('language', 'pt');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      const errorMsg = `OpenAI API error: ${response.status}`;
      await logSecurityEvent(supabaseClient, userId, 'transcription_failed', 'transcribe-sermon', false, errorMsg);
      throw new Error(errorMsg);
    }

    const result = await response.json();
    const sanitizedTranscript = sanitizeText(result.text, 100000);
    const duration = Date.now() - startTime;

    // Save completed sermon
    const { data: sermon, error: insertError } = await supabaseClient
      .from('sermons')
      .insert({
        user_id: userId,
        transcript: sanitizedTranscript,
        status: 'completed',
        sermon_hash,
        transcription_time_ms: duration,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving sermon:', insertError);
      throw new Error('Failed to save sermon');
    }

    // Log success
    await logSecurityEvent(supabaseClient, userId, 'transcription_success', 'transcribe-sermon', true);

    console.log(`Transcription completed in ${duration}ms`);

    return new Response(
      JSON.stringify({
        transcript: sanitizedTranscript,
        sermon_id: sermon.id,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
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
