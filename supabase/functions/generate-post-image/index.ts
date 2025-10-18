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

    // Define dimensions based on format - Instagram optimized resolutions
    const formatoDimensoes: Record<string, { width: number; height: number }> = {
      'feed_square': { width: 1080, height: 1080 },
      'feed_portrait': { width: 1080, height: 1350 },
      'story': { width: 1080, height: 1920 },
      'reel_cover': { width: 1080, height: 1920 }
    };
    const dimensoes = formatoDimensoes[formato] || { width: 1024, height: 1024 };

    // Build intelligent prompt based on pilar and estilo
    const pilarStyles = {
      'Edificar': 'sophisticated pastel color palette, elegant serif typography with hierarchy, contemplative and serene imagery with depth, soft cinematic lighting, peaceful atmosphere, premium editorial feel',
      'Alcançar': 'vibrant energetic color scheme with contrast, bold impactful typography, dynamic and action-oriented imagery, bright studio lighting, motivational energy, modern advertising quality',
      'Pertencer': 'warm inviting color tones, friendly humanist typography, authentic community connection imagery, welcoming ambient lighting, inclusive atmosphere, lifestyle photography quality',
      'Servir': 'organic earthy color palette, clean simple typography, genuine hands-on action imagery, natural authentic lighting, purposeful feel, documentary-style quality'
    };

    const estiloDescriptions = {
      'minimalista': 'ultra-minimalist design with premium aesthetics, clean geometric lines, abundant strategic white space, sophisticated simplicity, balanced negative space, professional magazine-style layout',
      'tipografico': 'typography-driven design with premium font pairings, text as the hero element, creative typographic hierarchy, professional kerning and spacing, modern font treatments, editorial quality',
      'fotografico': 'high-end photographic style with professional lighting, cinematic composition, authentic human moments, premium photo treatment, professional color grading, magazine-quality photography',
      'ilustrativo': 'premium illustrated style with custom artwork, sophisticated graphics, professional illustration techniques, cohesive visual storytelling, modern artistic approach, gallery-quality illustrations'
    };

    const pilarStyle = pilarStyles[pilar as keyof typeof pilarStyles] || pilarStyles['Edificar'];
    const estiloDesc = estiloDescriptions[estilo as keyof typeof estiloDescriptions] || estiloDescriptions['minimalista'];

    // Truncate copy if too long
    const truncatedCopy = sanitizedCopy.length > 200 ? sanitizedCopy.substring(0, 200) + '...' : sanitizedCopy;

    // Adaptar descrições de estilo ao novo prompt
    const estiloAdaptacoes = {
      'minimalista': 'fundo liso ou leve gradiente escuro; foco total no título grande; poucos elementos gráficos; subtítulo pequeno "handwritten" sutil.',
      'tipografico': 'sem foto. Fundo sólido/texturizado (papel). Título branco em grotesk bold/condensed; use um realce de caneta (sublinhar ou oval) em 1–2 palavras-chave; assinatura manuscrita no cantinho.',
      'fotografico': 'cena cinematográfica com luz dramática (culto contemporâneo, campo de trigo, milharal, deserto ao entardecer). Profundidade de campo realista; grade tipo Kodak Portra; texto ocupando terço esquerdo/baixo com fundo limpo.',
      'ilustrativo': 'colagem/estêncil sobre papel texturizado; paleta terrosa/retrô; bordas orgânicas; ruído fino. Evitar cartoon infantil.'
    };

    const estiloAdaptacao = estiloAdaptacoes[estilo as keyof typeof estiloAdaptacoes] || estiloAdaptacoes['minimalista'];

    const prompt = `Tarefa: Gerar um pôster para redes sociais no formato ${dimensoes.width}x${dimensoes.height}px (respeite a proporção e margens de segurança), com estética editorial cristã/cinemática e acabamento profissional.

CRÍTICO - TEXTO PERMITIDO:
* Use EXCLUSIVAMENTE o texto fornecido: "${truncatedCopy}"
* NÃO invente ou adicione: placeholders como "Nome da comunidade", logos genéricos, assinaturas fictícias, códigos de cor (como #F2552B), ou qualquer texto não fornecido pelo usuário.
* Se o texto tiver apenas 1 linha, use apenas como título (sem subtítulo inventado).

Texto a renderizar (exato, em PT-BR, sem traduzir ou reescrever):
* Título: primeira linha do texto fornecido (aplique visualmente CAIXA-ALTA, grotesk bold/condensed, alinhado à esquerda, tracking levemente negativo, linhas compactas).
* Subtítulo/assinatura (opcional): linhas seguintes do texto fornecido (estilo handwritten/brush fino, podendo ter sublinhado discreto ou setas desenhadas à mão).

Diretrizes comuns (sempre):
* Composição: layout limpo, forte hierarquia, espaço negativo para respiro; grid 12 col / 24pt baseline; margens mín. 6% do lado menor.
* Legibilidade: alto contraste texto/fundo; não distorcer letras; evitar fundo poluído atrás do título.
* Tratamento de imagem: granulação de filme 6–8%, matte finish, halation suave nas altas luzes; nitidez profissional sem oversharpen.
* Cores sugeridas: paleta quente (âmbar/ocre/sépia) ou neutros elegantes (preto carvão, off-white), com possibilidade de acento em tom laranja vibrante (não renderize códigos de cor).
* Respeito: retratar pessoas de forma digna, natural, sem caricatura.

Adapte ao ESTILO "${estilo}":
${estiloAdaptacao}

${sanitizedContexto ? `Contexto adicional: ${sanitizedContexto}` : ''}

NUNCA fazer: baixa resolução, clip-art, 3D/cartoon, neon, bevel/emboss, sombras duras, textos errados/omitidos, deformações de mão/rosto, marcas d'água, molduras, excesso de elementos, texto não fornecido pelo usuário (como "Nome da comunidade", códigos hex, ou placeholders genéricos).

Entrega: imagem final pronta para social no formato ${dimensoes.width}x${dimensoes.height}px, texto nítido e legível, sem bordas, usando SOMENTE o texto fornecido pelo usuário.`;

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
        modalities: ['image', 'text'],
        quality: 'high',
        output_format: 'png',
        output_compression: 100
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
