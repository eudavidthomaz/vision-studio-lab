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

const CONTENT_TYPES = [
  { type: 'post_simples', count: 3, pilar: 'EDIFICAR' },
  { type: 'stories', count: 5, pilar: 'ALCANÇAR' },
  { type: 'reel', count: 2, pilar: 'ENVIAR' },
  { type: 'carrossel', count: 1, pilar: 'EDIFICAR' },
  { type: 'devocional', count: 1, pilar: 'EXALTAR' },
];

async function generateContent(transcript: string, contentType: string, pilar: string, index: number) {
  const prompts: Record<string, string> = {
    post_simples: `Baseado nesta pregação, crie um post simples e impactante para Instagram.

Pregação:
${transcript.substring(0, 3000)}

Retorne APENAS um JSON válido neste formato:
{
  "titulo": "Título do post",
  "texto": "Texto completo do post com quebras de linha",
  "pilar": "${pilar}",
  "hashtags": ["#tag1", "#tag2", "#tag3"]
}`,

    stories: `Baseado nesta pregação, crie um story engajante para Instagram.

Pregação:
${transcript.substring(0, 2000)}

Retorne APENAS um JSON válido neste formato:
{
  "titulo": "Stories ${index + 1}",
  "texto": "Texto curto e impactante para story",
  "pilar": "${pilar}",
  "cor_fundo": "#hexcolor"
}`,

    reel: `Baseado nesta pregação, crie um roteiro de Reel/Short para Instagram/TikTok.

Pregação:
${transcript.substring(0, 3000)}

Retorne APENAS um JSON válido neste formato:
{
  "titulo": "Título do Reel",
  "hook": "Frase de abertura impactante (3-5 segundos)",
  "roteiro": "Roteiro completo do vídeo",
  "pilar": "${pilar}",
  "duracao": "30-60 segundos"
}`,

    carrossel: `Baseado nesta pregação, crie um carrossel de 5 slides para Instagram.

Pregação:
${transcript.substring(0, 4000)}

Retorne APENAS um JSON válido neste formato:
{
  "titulo": "Título do Carrossel",
  "pilar": "${pilar}",
  "slides": [
    { "numero": 1, "texto": "Slide 1", "tipo": "capa" },
    { "numero": 2, "texto": "Slide 2", "tipo": "conteudo" },
    { "numero": 3, "texto": "Slide 3", "tipo": "conteudo" },
    { "numero": 4, "texto": "Slide 4", "tipo": "conteudo" },
    { "numero": 5, "texto": "Slide 5", "tipo": "cta" }
  ]
}`,

    devocional: `Baseado nesta pregação, crie um devocional diário.

Pregação:
${transcript.substring(0, 3000)}

Retorne APENAS um JSON válido neste formato:
{
  "titulo": "Título do Devocional",
  "versiculo": "Referência bíblica",
  "texto_versiculo": "Texto completo do versículo",
  "reflexao": "Texto de reflexão",
  "oracao": "Oração sugerida",
  "pilar": "${pilar}"
}`
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em criar conteúdo cristão para redes sociais. Sempre retorne APENAS JSON válido, sem texto adicional.'
        },
        {
          role: 'user',
          content: prompts[contentType] || prompts.post_simples
        }
      ],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '{}';
  
  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON response from AI');
  }

  return JSON.parse(jsonMatch[0]);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let userId: string | null = null;
  let supabaseClient: any = null;

  try {
    // Authenticate
    const auth = createAuthenticatedClient(req);
    supabaseClient = auth.client;
    userId = auth.userId;

    if (!userId) {
      throw new ValidationError('Authentication required');
    }

    // Check rate limit
    await checkRateLimit(supabaseClient, userId, 'generate-sermon-pack');

    // Parse request
    const { sermon_id } = await req.json();

    if (!sermon_id) {
      throw new ValidationError('Missing sermon_id');
    }

    console.log(`Generating content pack for sermon ${sermon_id}`);

    // Fetch sermon
    const { data: sermon, error: sermonError } = await supabaseClient
      .from('sermons')
      .select('transcript, created_at')
      .eq('id', sermon_id)
      .eq('user_id', userId)
      .single();

    if (sermonError || !sermon) {
      throw new Error('Sermon not found');
    }

    if (!sermon.transcript) {
      throw new Error('Sermon has no transcript');
    }

    console.log('Transcript found, generating content...');

    const createdContents = [];
    const weekDate = new Date(sermon.created_at).toISOString().split('T')[0];

    // Generate each content type
    for (const contentConfig of CONTENT_TYPES) {
      for (let i = 0; i < contentConfig.count; i++) {
        try {
          const content = await generateContent(
            sermon.transcript,
            contentConfig.type,
            contentConfig.pilar,
            i
          );

          const title = content.titulo || `${contentConfig.type} - ${weekDate} (${i + 1})`;

          // Insert into content_library
          const { data: inserted, error: insertError } = await supabaseClient
            .from('content_library')
            .insert({
              user_id: userId,
              title: title,
              content_type: contentConfig.type,
              source_type: 'audio-pack',
              pilar: content.pilar || contentConfig.pilar,
              content: content,
              sermon_id: sermon_id,
              prompt_original: `Pack semanal gerado automaticamente do sermão ${sermon_id}`,
              status: 'draft',
              tags: ['pack-semanal', weekDate, contentConfig.type],
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error inserting content:', insertError);
          } else {
            createdContents.push(inserted);
            console.log(`Created ${contentConfig.type} #${i + 1}`);
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (err) {
          console.error(`Error generating ${contentConfig.type} #${i + 1}:`, err);
        }
      }
    }

    console.log(`Pack generation completed: ${createdContents.length} contents created`);

    // Log success
    await logSecurityEvent(
      supabaseClient,
      userId,
      'sermon_pack_generated',
      'generate-sermon-pack',
      true,
      undefined,
      { sermon_id, contents_count: createdContents.length }
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          sermon_id,
          contents_count: createdContents.length,
          contents: createdContents,
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-sermon-pack:', error);

    if (supabaseClient && userId) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await logSecurityEvent(supabaseClient, userId, 'pack_generation_error', 'generate-sermon-pack', false, errorMsg);
    }

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

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
