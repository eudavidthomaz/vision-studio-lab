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
    const { transcript } = await req.json();
    
    if (!transcript) {
      throw new Error('No transcript provided');
    }

    console.log('Generating weekly pack...');

    const systemPrompt = `Você é Ide.On, um mentor espiritual especializado em criar conteúdo evangelístico para redes sociais.
Você recebe uma transcrição de uma pregação e deve gerar um pacote completo de conteúdo para uma semana.

IMPORTANTE: Responda APENAS com um JSON válido, sem texto adicional antes ou depois. O JSON deve conter as seguintes chaves:

{
  "resumo": "Resumo conciso da pregação em 2-3 parágrafos",
  "frases_impactantes": ["array com 5-7 frases marcantes da pregação"],
  "stories": ["array com 3-5 ideias de stories para Instagram/Facebook"],
  "estudo_biblico": {
    "tema": "Tema principal do estudo",
    "versiculos": ["array com versículos relevantes"],
    "perguntas": ["array com 5-7 perguntas para reflexão em grupo"]
  },
  "legendas": ["array com 3-5 legendas prontas para posts"],
  "carrosseis": [
    {
      "titulo": "Título do carrossel",
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
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Transcrição da pregação:\n\n${transcript}` }
        ],
        max_completion_tokens: 2000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const pack = JSON.parse(result.choices[0]?.message?.content || '{}');
    
    console.log('Weekly pack generated successfully');

    return new Response(
      JSON.stringify(pack),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-week-pack:', error);
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
