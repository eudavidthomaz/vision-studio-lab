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
    const { tipo_conteudo, tema, tom, pilar, contexto_adicional } = await req.json();
    
    console.log('Generating content idea:', { tipo_conteudo, tema, tom, pilar });

    const CORE_PRINCIPLES = `
MISSÃO: Guiar pessoas a Jesus, fortalecer discípulos e servir a cidade com conteúdo fiel à Bíblia, pastoralmente sensível e culturalmente inteligente.

PRINCÍPIOS:
1. Cristocentrismo: Jesus no centro; doutrina antes de opinião
2. Fidelidade bíblica: texto influencia pauta, não o contrário
3. Linguagem simples (nível 8º/9º ano), acessível a todos
4. Vulnerabilidade com dignidade: nada de exposição humilhante
5. CTAs específicos e factíveis

MÉTODO:
1. Identificar versículo base (1-10 versos)
2. Extrair princípio atemporal (1 frase)
3. Aplicação prática: "o que isso muda na segunda-feira?"
4. Adaptar para formato (Reel/Carrossel/Story)

PILARES:
- Edificar: Devocional + aplicação prática
- Alcançar: Alto impacto, transformação, testemunhos
- Pertencer: Comunidade, conexão, grupos
- Servir: Voluntariado, causas, ação

IMPORTANTE:
- Sempre indicar versículos bíblicos relacionados (livro/cap/verso)
- Se o tema envolver sensibilidade (luto, doença), adicionar nota em "consideracoes_pastor"
- CTA específico (ex: "Envie CÉLULA no DM")
`;

    const systemPrompt = `${CORE_PRINCIPLES}

Você gera IDEIAS INDIVIDUAIS de conteúdo para Instagram de igrejas.

IMPORTANTE: Responda APENAS com JSON válido, sem texto adicional:

{
  "titulo": "Nome curto e chamativo da ideia",
  "tipo": "${tipo_conteudo}",
  "pilar": "${pilar}",
  "dia_sugerido": "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo",
  "copy": "Texto completo do post (3-5 parágrafos, linguagem simples)",
  "hook": "Primeira frase de impacto (8-12 palavras)",
  "cta": "Call-to-action específico (ex: Envie CÉLULA no DM)",
  "hashtags": ["array", "de", "hashtags", "relevantes"],
  "sugestao_visual": "Descrição detalhada da arte/vídeo sugerido",
  "versiculos_relacionados": ["Salmos 23:1", "João 3:16"],
  "consideracoes_pastor": "Avisos para revisão pastoral (ou null se não houver)"
}`;

    const userPrompt = `Crie uma ideia de conteúdo:
- Tipo: ${tipo_conteudo}
- Tema: ${tema}
- Tom: ${tom}
- Pilar: ${pilar}
${contexto_adicional ? `- Contexto: ${contexto_adicional}` : ''}

Lembre-se: linguagem simples, versículos bíblicos, CTA claro.`;

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
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const idea = JSON.parse(result.choices[0]?.message?.content || '{}');
    
    console.log('Content idea generated successfully');

    return new Response(
      JSON.stringify(idea),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-content-idea:', error);
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
