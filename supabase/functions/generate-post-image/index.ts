import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
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

const ALLOWED_FORMATOS = ['feed_square', 'feed_portrait', 'story', 'reel_cover'];
const ALLOWED_ESTILOS = ['minimalista', 'tipografico', 'fotografico', 'ilustrativo'];
const ALLOWED_PILARES = ['Edificar', 'Alcançar', 'Pertencer', 'Servir'];

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
    await checkRateLimit(supabaseClient, userId, 'generate-post-image');

    // Parse and validate input
    const body = await req.json();
    const { formato, copy, estilo, pilar, contexto_adicional } = body;

    validateInput('formato', {
      value: formato,
      type: 'string',
      required: true,
      allowedValues: ALLOWED_FORMATOS,
    });

    validateInput('copy', {
      value: copy,
      type: 'string',
      required: true,
      minLength: 3,
      maxLength: 500,
    });

    validateInput('estilo', {
      value: estilo,
      type: 'string',
      required: true,
      allowedValues: ALLOWED_ESTILOS,
    });

    validateInput('pilar', {
      value: pilar,
      type: 'string',
      required: true,
      allowedValues: ALLOWED_PILARES,
    });

    validateInput('contexto_adicional', {
      value: contexto_adicional,
      type: 'string',
      required: false,
      maxLength: 500,
    });

    const sanitizedCopy = sanitizeText(copy, 500);
    const sanitizedContexto = contexto_adicional ? sanitizeText(contexto_adicional, 500) : '';

    console.log('Generating image with params:', { formato, estilo, pilar });

    // Define dimensions based on format
    const formatoDimensoes: Record<string, { width: number; height: number }> = {
      'feed_square': { width: 1024, height: 1024 },
      'feed_portrait': { width: 1024, height: 1536 },
      'story': { width: 1024, height: 1536 },
      'reel_cover': { width: 1024, height: 1536 }
    };
    const dimensoes = formatoDimensoes[formato] || { width: 1024, height: 1024 };

    // Build intelligent prompt based on pilar and estilo
    const pilarStyles = {
      'Edificar': 'pastel tones, serif typography, contemplative and peaceful imagery, soft lighting',
      'Alcançar': 'vibrant colors, bold typography, dynamic and energetic imagery, bright lighting',
      'Pertencer': 'warm tones, humanist typography, community and connection imagery, welcoming atmosphere',
      'Servir': 'earthy tones, simple typography, action and hands-on imagery, authentic feel'
    };

    const estiloDescriptions = {
      'minimalista': 'minimalist design, clean lines, lots of white space, simple composition',
      'tipografico': 'typography-focused, text as main visual element, creative font usage',
      'fotografico': 'photographic style, realistic imagery, human-centered',
      'ilustrativo': 'illustrated style, artistic, creative graphics and drawings'
    };

    const pilarStyle = pilarStyles[pilar as keyof typeof pilarStyles] || pilarStyles['Edificar'];
    const estiloDesc = estiloDescriptions[estilo as keyof typeof estiloDescriptions] || estiloDescriptions['minimalista'];

    // Truncate copy if too long
    const truncatedCopy = sanitizedCopy.length > 200 ? sanitizedCopy.substring(0, 200) + '...' : sanitizedCopy;

    const prompt = `Create a professional Instagram post image for a church social media.
Style: ${estiloDesc}
Visual theme: ${pilarStyle}
Text content to feature: "${truncatedCopy}"
${sanitizedContexto ? `Additional context: ${sanitizedContexto}` : ''}
The image should be suitable for Christian content, inspiring, and visually appealing.
Aspect ratio: ${dimensoes.width}x${dimensoes.height}px
High quality, professional design.`;

    console.log('Calling Lovable AI...');

    // Call Lovable AI - Gemini 2.5 Flash Image Preview
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      const errorMsg = `Image generation failed: ${response.status}`;
      await logSecurityEvent(supabaseClient, userId, 'image_gen_failed', 'generate-post-image', false, errorMsg);
      
      if (response.status === 429) {
        throw new RateLimitError('Limite de taxa excedido. Tente novamente mais tarde.', 60);
      }
      
      if (response.status === 402) {
        throw new ValidationError('Créditos insuficientes. Adicione créditos ao seu workspace.');
      }

      throw new Error(errorMsg);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      throw new Error('No image URL in response');
    }

    // Upload image to Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const storageClient = createClient(supabaseUrl, supabaseServiceKey);

    // Convert base64 to blob
    const base64Data = imageUrl.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/png' });

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${userId}/${timestamp}_${formato}_${estilo}.png`;

    console.log('Uploading to storage:', filename);

    // Upload to storage
    const { data: uploadData, error: uploadError } = await storageClient.storage
      .from('post-images')
      .upload(filename, blob, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      await logSecurityEvent(supabaseClient, userId, 'image_upload_failed', 'generate-post-image', false, uploadError.message);
      // Fallback to returning base64 if storage fails
      return new Response(
        JSON.stringify({ 
          image_url: imageUrl,
          prompt_usado: prompt,
          dimensoes,
          storage_error: uploadError.message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = storageClient.storage
      .from('post-images')
      .getPublicUrl(filename);

    // Log success
    await logSecurityEvent(supabaseClient, userId, 'image_gen_success', 'generate-post-image', true);

    const duration = Date.now() - startTime;
    console.log(`Image generated and uploaded in ${duration}ms`);

    return new Response(
      JSON.stringify({ 
        image_url: publicUrl,
        prompt_usado: prompt,
        dimensoes
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-post-image:', error);

    // Log error
    if (supabaseClient && userId) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await logSecurityEvent(supabaseClient, userId, 'image_gen_error', 'generate-post-image', false, errorMsg);
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
