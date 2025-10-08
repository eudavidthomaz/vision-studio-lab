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

const ALLOWED_TIPOS = ['post', 'story', 'reel', 'carrossel'];
const ALLOWED_TONS = ['inspirador', 'reflexivo', 'convite', 'celebrativo', 'educativo'];
const ALLOWED_PILARES = ['comunidade', 'ensino', 'adoracao', 'missao'];

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
    await checkRateLimit(supabaseClient, userId, 'generate-content-idea');

    // Parse and validate input
    const body = await req.json();
    const { tipo_conteudo, tema, tom, pilar, contexto_adicional } = body;

    validateInput('tipo_conteudo', {
      value: tipo_conteudo,
      type: 'string',
      required: true,
      allowedValues: ALLOWED_TIPOS,
    });

    validateInput('tema', {
      value: tema,
      type: 'string',
      required: true,
      minLength: 3,
      maxLength: 200,
    });

    validateInput('tom', {
      value: tom,
      type: 'string',
      required: true,
      allowedValues: ALLOWED_TONS,
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
      maxLength: 1000,
    });

    const sanitizedTema = sanitizeText(tema, 200);
    const sanitizedContexto = contexto_adicional ? sanitizeText(contexto_adicional, 1000) : '';

    console.log('Generating content idea...');

    const CORE_PRINCIPLES = `
Você é um especialista em comunicação cristã nas redes sociais.
Crie conteúdo autêntico, relevante e engajador para igrejas.
`;

    const systemPrompt = `${CORE_PRINCIPLES}

Você é um especialista em criar ideias de conteúdo para redes sociais de igrejas.
Baseado nos parâmetros fornecidos, crie uma ideia completa e acionável.

IMPORTANTE: Responda APENAS com um JSON válido, sem texto adicional. O JSON deve conter:

{
  "titulo": "Título atrativo do conteúdo",
  "copy": "Texto completo do post/story/reel",
  "cta": "Call-to-action específico",
  "hashtags": ["array", "de", "hashtags"],
  "sugestao_visual": "Descrição da imagem ou vídeo sugerido"
}`;

    const userPrompt = `
Gerar ideia de conteúdo:
- Tipo: ${tipo_conteudo}
- Tema: ${sanitizedTema}
- Tom: ${tom}
- Pilar: ${pilar}
${sanitizedContexto ? `- Contexto adicional: ${sanitizedContexto}` : ''}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 800,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      const errorMsg = `OpenAI API error: ${response.status}`;
      await logSecurityEvent(supabaseClient, userId, 'content_idea_failed', 'generate-content-idea', false, errorMsg);
      throw new Error(errorMsg);
    }

    const result = await response.json();
    const idea = JSON.parse(result.choices[0]?.message?.content || '{}');

    // Log success
    await logSecurityEvent(supabaseClient, userId, 'content_idea_success', 'generate-content-idea', true);

    const duration = Date.now() - startTime;
    console.log(`Content idea generated in ${duration}ms`);

    return new Response(
      JSON.stringify(idea),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-content-idea:', error);

    // Log error
    if (supabaseClient && userId) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await logSecurityEvent(supabaseClient, userId, 'content_idea_error', 'generate-content-idea', false, errorMsg);
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
