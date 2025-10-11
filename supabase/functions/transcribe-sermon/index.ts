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

    // Parse and validate input
    const body = await req.json();
    const { audio_base64 } = body;

    validateInput('audio_base64', {
      value: audio_base64,
      type: 'string',
      required: true,
      minLength: 100,
      maxLength: 50000000, // ~37MB base64
    });

    console.log('Starting transcription...');

    // Decode base64 to binary
    const binaryString = atob(audio_base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create form data for OpenAI
    const formData = new FormData();
    const blob = new Blob([bytes], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');

    // Call OpenAI Whisper API
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
      await logSecurityEvent(supabaseClient, userId, 'transcribe_failed', 'transcribe-sermon', false, errorMsg);
      throw new Error(errorMsg);
    }

    const result = await response.json();
    
    // Sanitize transcription output
    const sanitizedText = sanitizeText(result.text, 100000);

    // Log success
    await logSecurityEvent(supabaseClient, userId, 'transcribe_success', 'transcribe-sermon', true);

    // Save transcript to database
    const { data: sermon, error: saveError } = await supabaseClient
      .from('sermons')
      .insert({
        user_id: userId,
        transcript: sanitizedText,
        status: 'completed'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving sermon:', saveError);
      await logSecurityEvent(supabaseClient, userId, 'sermon_save_failed', 'transcribe-sermon', false, saveError.message);
    }

    const duration = Date.now() - startTime;
    console.log(`Transcription completed in ${duration}ms, sermon_id: ${sermon?.id}`);

    return new Response(
      JSON.stringify({ 
        transcript: sanitizedText,
        sermon_id: sermon?.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Error in transcribe-sermon:', error);

    // Log error
    if (supabaseClient && userId) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await logSecurityEvent(
        supabaseClient, 
        userId, 
        'transcribe_error', 
        'transcribe-sermon', 
        false, 
        errorMsg
      );
    }

    // Handle specific error types
    if (error instanceof ValidationError) {
      return new Response(
        JSON.stringify({ error: error.message, type: 'validation_error' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
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
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(error.retryAfter))
          },
          status: 429,
        },
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
