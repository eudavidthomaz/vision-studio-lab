import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { CORE_PRINCIPLES, CONTENT_METHOD, PILLAR_DISTRIBUTION } from '../_shared/prompt-principles.ts';

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
