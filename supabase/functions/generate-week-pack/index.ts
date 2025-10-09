import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { CORE_PRINCIPLES, CONTENT_METHOD, PILLAR_DISTRIBUTION } from '../_shared/prompt-principles.ts';
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
    await checkRateLimit(supabaseClient, userId, 'generate-week-pack');

    // Parse and validate input
    const body = await req.json();
    const { transcript } = body;

    validateInput('transcript', {
      value: transcript,
      type: 'string',
      required: true,
      minLength: 50,
      maxLength: 100000,
    });

    const sanitizedTranscript = sanitizeText(transcript, 100000);

    console.log('Generating weekly pack...');

    const systemPrompt = `${CORE_PRINCIPLES}

${CONTENT_METHOD}

${PILLAR_DISTRIBUTION}

Você é Ide.On, um mentor espiritual especializado em criar conteúdo evangelístico para redes sociais.
Você recebe uma transcrição de uma pregação e deve gerar um pacote completo de conteúdo para uma semana.

IMPORTANTE: Responda APENAS com um JSON válido, sem texto adicional antes ou depois. O JSON deve conter as seguintes chaves:

{
  "versiculos_base": ["Romanos 12:1-2", "João 3:16"],
  "principio_atemporal": "Frase-chave que captura a verdade central da pregação",
  "resumo": "Resumo conciso da pregação em 2-3 parágrafos",
  "frases_impactantes": ["array com 5-7 frases marcantes da pregação"],
  "stories": ["array com 3-5 ideias de stories para Instagram/Facebook"],
  "estudo_biblico": {
    "tema": "Tema principal do estudo",
    "versiculos": ["array com versículos relevantes com referência completa"],
    "perguntas": ["array com 5-7 perguntas para reflexão em grupo"]
  },
  "legendas": [
    {
      "texto": "Legenda completa do post",
      "pilar_estrategico": "Edificar" | "Alcançar" | "Pertencer" | "Servir",
      "cta": "Call-to-action específico (ex: Envie CÉLULA no DM)",
      "hashtags": ["array", "de", "hashtags"]
    }
  ],
  "carrosseis": [
    {
      "titulo": "Título do carrossel",
      "pilar_estrategico": "Edificar" | "Alcançar" | "Pertencer" | "Servir",
      "slides": [
        {
          "texto": "Texto do slide",
          "sugestao_imagem": "Descrição da imagem sugerida"
        }
      ]
    }
  ],
  "reels": [
    {
      "titulo": "Título do reel",
      "pilar_estrategico": "Edificar" | "Alcançar" | "Pertencer" | "Servir",
      "roteiro": "Roteiro completo do vídeo",
      "duracao_estimada": "30-60 segundos",
      "hook": "Gancho inicial para prender atenção"
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Transcrição da pregação:\n\n${sanitizedTranscript}` }
        ],
        max_completion_tokens: 5000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      const errorMsg = `OpenAI API error: ${response.status}`;
      await logSecurityEvent(supabaseClient, userId, 'weekpack_failed', 'generate-week-pack', false, errorMsg);
      throw new Error(errorMsg);
    }

    const result = await response.json();
    const pack = JSON.parse(result.choices[0]?.message?.content || '{}');

    // Log success
    await logSecurityEvent(supabaseClient, userId, 'weekpack_success', 'generate-week-pack', true);

    const duration = Date.now() - startTime;
    console.log(`Week pack generated in ${duration}ms`);

    return new Response(
      JSON.stringify(pack),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-week-pack:', error);

    // Log error
    if (supabaseClient && userId) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await logSecurityEvent(supabaseClient, userId, 'weekpack_error', 'generate-week-pack', false, errorMsg);
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
