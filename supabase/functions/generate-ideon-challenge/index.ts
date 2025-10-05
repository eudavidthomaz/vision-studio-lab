import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating Ide.On challenge...');

    const systemPrompt = `Você é Ide.On, um mentor criativo que desenvolve desafios evangelísticos em vídeo.
Seu objetivo é criar desafios que inspirem pessoas a compartilhar sua fé de forma criativa e autêntica.

IMPORTANTE: Responda APENAS com um JSON válido, sem texto adicional. O JSON deve conter:

{
  "roteiro": "Roteiro completo do desafio com começo, meio e fim (3-4 parágrafos)",
  "dicas_de_foto": ["array com 5-7 dicas técnicas de fotografia e enquadramento"],
  "o_que_captar": ["array com 5-7 elementos/momentos importantes a registrar"],
  "como_captar": ["array com 5-7 instruções práticas de como filmar"],
  "proposito": "Explicação do propósito evangelístico do desafio (2-3 parágrafas)"
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
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const challenge = JSON.parse(result.choices[0]?.message?.content || '{}');
    
    console.log('Ide.On challenge generated successfully');

    return new Response(
      JSON.stringify(challenge),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-ideon-challenge:', error);
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
