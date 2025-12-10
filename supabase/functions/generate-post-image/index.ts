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
    const { formato, copy, estilo, pilar, contexto_adicional, referenceImage } = body;

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
      maxLength: 2000,
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
    });

    validateInput('contexto_adicional', {
      value: contexto_adicional,
      type: 'string',
      required: false,
      maxLength: 500,
    });

    const sanitizedCopy = sanitizeText(copy, 500);
    const sanitizedContexto = contexto_adicional ? sanitizeText(contexto_adicional, 500) : '';
    const hasReferenceImage = !!referenceImage;

    console.log('Generating image with Lovable AI:', { formato, estilo, pilar, hasReferenceImage });

    // Map formats to dimensions for reference
    const formatoDimensoes: Record<string, { width: number; height: number }> = {
      'feed_square': { width: 1024, height: 1024 },
      'feed_portrait': { width: 1024, height: 1536 },
      'story': { width: 1024, height: 1536 },
      'reel_cover': { width: 1024, height: 1536 }
    };
    const dimensaoConfig = formatoDimensoes[formato] || { width: 1024, height: 1024 };

    // Build intelligent prompt based on pilar and estilo
    const pilarStyles = {
      'Edificar': 'sophisticated pastel color palette, elegant serif typography with hierarchy, contemplative and serene imagery with depth, soft cinematic lighting, peaceful atmosphere, premium editorial feel',
      'Alcançar': 'vibrant energetic color scheme with contrast, bold impactful typography, dynamic and action-oriented imagery, bright studio lighting, motivational energy, modern advertising quality',
      'Pertencer': 'warm inviting color tones, friendly humanist typography, authentic community connection imagery, welcoming ambient lighting, inclusive atmosphere, lifestyle photography quality',
      'Servir': 'organic earthy color palette, clean simple typography, genuine hands-on action imagery, natural authentic lighting, purposeful feel, documentary-style quality'
    };

    // Adaptar descrições de estilo ao prompt
    const estiloAdaptacoes = {
      'minimalista': 'fundo liso ou leve gradiente escuro; foco total no título grande; poucos elementos gráficos; subtítulo pequeno "handwritten" sutil.',
      'tipografico': 'sem foto. Fundo sólido/texturizado (papel). Título branco em grotesk bold/condensed; use um realce de caneta (sublinhar ou oval) em 1–2 palavras-chave; assinatura manuscrita no cantinho.',
      'fotografico': 'cena cinematográfica com luz dramática (culto contemporâneo, campo de trigo, milharal, deserto ao entardecer). Profundidade de campo realista; grade tipo Kodak Portra; texto ocupando terço esquerdo/baixo com fundo limpo.',
      'ilustrativo': 'colagem/estêncil sobre papel texturizado; paleta terrosa/retrô; bordas orgânicas; ruído fino. Evitar cartoon infantil.'
    };

    const pilarStyle = pilarStyles[pilar as keyof typeof pilarStyles] || pilarStyles['Edificar'];
    const estiloAdaptacao = estiloAdaptacoes[estilo as keyof typeof estiloAdaptacoes] || estiloAdaptacoes['minimalista'];

    // Truncate copy if too long
    const truncatedCopy = sanitizedCopy.length > 200 ? sanitizedCopy.substring(0, 200) + '...' : sanitizedCopy;

    // Build prompt for image generation
    const aspectRatio = dimensaoConfig.width === dimensaoConfig.height ? '1:1 square' : '2:3 portrait';
    
    const prompt = hasReferenceImage
      ? `Edit this image following these instructions: ${truncatedCopy}

Apply style ${estilo}: ${estiloAdaptacao}

Keep the general composition but:
- Apply color palette: ${pilarStyle.split(',')[0]}
- Improve visual quality with professional finish
- Add image treatment: film grain 6-8%, matte finish
${sanitizedContexto ? `- Additional context: ${sanitizedContexto}` : ''}

NEVER: distort faces/hands, add unsolicited text, completely change the original image.`
      : `Generate a ${aspectRatio} social media poster with Christian/cinematic editorial aesthetic and professional finish.

Text to render (exact, do not translate or rewrite):
* Title: "${truncatedCopy.split('\n')[0]}" (apply visually UPPERCASE, grotesk bold/condensed, left-aligned, slightly negative tracking, compact lines).
* Subtitle/signature (optional): following lines from input (handwritten/brush fine style).

Common guidelines (always):
* Composition: clean layout, strong hierarchy, negative space for breathing; 12 col grid / 24pt baseline; min margins 6% of shorter side.
* Legibility: high contrast text/background; don't distort letters; avoid busy background behind title.
* Image treatment: film grain 6-8%, matte finish, soft halation in highlights; professional sharpness without oversharpen.
* Suggested colors: warm palette (amber/ochre/sepia) or elegant neutrals (charcoal black, off-white), with possible orange #F2552B accent.
* Respect: portray people with dignity, naturally, without caricature.

Adapt to selected STYLE (${estilo}):
${estiloAdaptacao}

${sanitizedContexto ? `Additional context: ${sanitizedContexto}` : ''}

NEVER: low resolution, clip-art, 3D/cartoon, neon, bevel/emboss, hard shadows, wrong/omitted text, hand/face deformations, watermarks, frames, excess elements.

Delivery: final image ready for social at ${aspectRatio} format, sharp legible text, no borders.`;

    // Use Lovable AI Gateway with Gemini Flash Image
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Calling Lovable AI Gateway with Gemini Flash Image...');

    // Build messages array
    const messages: any[] = [];
    
    if (hasReferenceImage) {
      // For editing, include the reference image in the message
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: referenceImage } }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        content: prompt
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: messages,
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      
      const errorMsg = `Image generation failed: ${response.status}`;
      await logSecurityEvent(supabaseClient, userId, 'image_gen_failed', 'generate-post-image', false, errorMsg);
      
      if (response.status === 429) {
        throw new RateLimitError('Limite de requisições excedido. Tente novamente mais tarde.', 60);
      }
      
      if (response.status === 402) {
        throw new ValidationError('Créditos Lovable AI insuficientes. Adicione créditos no workspace em Settings → Workspace → Usage.');
      }

      if (response.status === 400) {
        let errorDetail = 'Erro na requisição';
        try {
          const errorJson = JSON.parse(errorText);
          errorDetail = errorJson.error?.message || errorDetail;
        } catch {}
        throw new ValidationError(`Erro de conteúdo: ${errorDetail}`);
      }

      throw new Error(errorMsg);
    }

    const data = await response.json();
    console.log('Lovable AI response received');

    // Extract image from Lovable AI response
    // Format: data.choices[0].message.images[0].image_url.url = "data:image/png;base64,..."
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error('No image in Lovable AI response:', JSON.stringify(data).substring(0, 500));
      throw new Error('Nenhuma imagem foi gerada. Tente novamente.');
    }

    // Extract base64 data from data URL
    const base64Match = imageUrl.match(/^data:image\/\w+;base64,(.+)$/);
    if (!base64Match) {
      console.error('Invalid image format from Lovable AI:', imageUrl.substring(0, 100));
      throw new Error('Formato de imagem inválido na resposta.');
    }

    const base64Data = base64Match[1];

    // Upload image to Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const storageClient = createClient(supabaseUrl, supabaseServiceKey);

    // Convert base64 to blob
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
          dimensoes: { width: dimensaoConfig.width, height: dimensaoConfig.height },
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
        dimensoes: { width: dimensaoConfig.width, height: dimensaoConfig.height }
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
