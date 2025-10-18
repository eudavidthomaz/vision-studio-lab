import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { CORE_PRINCIPLES } from '../_shared/prompt-principles.ts';
import { 
  checkRateLimit, 
  logSecurityEvent,
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
    await checkRateLimit(supabaseClient, userId, 'generate-ideon-challenge');

    console.log('Generating Ide.On challenge...');

    const systemPrompt = `${CORE_PRINCIPLES}

ATENÇÃO ESPECIAL:
- Consentimento de imagem: Sempre lembrar que gravações em público ou com outras pessoas requerem autorização
- Segurança: Evitar desafios que exponham crianças, adolescentes ou pessoas em situação de vulnerabilidade
- Dignidade: Desafios devem ser autênticos, nunca constrangedores

Você é Ide.On, um mentor criativo que desenvolve desafios evangelísticos em vídeo.
Seu objetivo é criar desafios que inspirem pessoas a compartilhar sua fé de forma criativa e autêntica.

IMPORTANTE: Responda APENAS com um JSON válido, sem texto adicional. O JSON deve conter:

{
  "roteiro": "Roteiro completo do desafio com começo, meio e fim (3-4 parágrafos)",
  "dicas_de_foto": ["array com 5-7 dicas técnicas de fotografia e enquadramento"],
  "o_que_captar": ["array com 5-7 elementos/momentos importantes a registrar"],
  "como_captar": ["array com 5-7 instruções práticas de como filmar"],
  "proposito": "Explicação do propósito evangelístico do desafio (2-3 parágrafas)",
  "consideracoes_eticas": "Avisos sobre consentimento, proteção de menores ou outros cuidados éticos necessários"
}`;

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
          { role: 'user', content: 'Crie um novo desafio Ide.On criativo e impactante para evangelismo através de vídeos.' }
        ],
        max_completion_tokens: 1000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      const errorMsg = `OpenAI API error: ${response.status}`;
      await logSecurityEvent(supabaseClient, userId, 'challenge_failed', 'generate-ideon-challenge', false, errorMsg);
      throw new Error(errorMsg);
    }

    const result = await response.json();
    const challenge = JSON.parse(result.choices[0]?.message?.content || '{}');

    // Log success
    await logSecurityEvent(supabaseClient, userId, 'challenge_success', 'generate-ideon-challenge', true);

    const duration = Date.now() - startTime;
    console.log(`Ide.On challenge generated in ${duration}ms`);

    return new Response(
      JSON.stringify(challenge),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-ideon-challenge:', error);

    // Log error
    if (supabaseClient && userId) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await logSecurityEvent(supabaseClient, userId, 'challenge_error', 'generate-ideon-challenge', false, errorMsg);
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
