import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { CORE_PRINCIPLES, CONTENT_METHOD, PILLAR_DISTRIBUTION } from "../_shared/prompt-principles.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { transcript, sermon_id } = await req.json();

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 50) {
      return new Response(JSON.stringify({ 
        error: 'Transcrição inválida ou muito curta.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `${CORE_PRINCIPLES}

${CONTENT_METHOD}

${PILLAR_DISTRIBUTION}

Você é um assistente especializado em transformar pregações em conteúdo cristão estratégico para redes sociais.

Analise a transcrição da pregação fornecida e gere um pacote COMPLETO de conteúdo em formato JSON com a seguinte estrutura EXATA:

{
  "source_type": "transcript",
  "fundamento_biblico": {
    "versiculos": ["Versículo 1 completo da pregação", "Versículo 2..."],
    "contexto": "Contexto histórico do texto pregado",
    "principio": "Princípio central da mensagem"
  },
  "conteudo": {
    "resumo_pregacao": "Resumo da pregação em 2-3 parágrafos destacando: tema, mensagem principal e aplicação prática",
    "frases_impactantes": ["5-7 frases marcantes extraídas da pregação"],
    "pilar": "EDIFICAR | ALCANÇAR | PERTENCER | SERVIR"
  },
  "estrutura_visual": {
    "stories": [
      "Ideia 1 para story",
      "Ideia 2 para story",
      "Ideia 3 para story"
    ],
    "carrosseis": [
      {
        "titulo": "Título do carrossel",
        "slides": [
          { "texto": "Slide 1", "sugestao_imagem": "descrição visual" },
          { "texto": "Slide 2", "sugestao_imagem": "descrição visual" },
          { "texto": "Slide 3", "sugestao_imagem": "descrição visual" }
        ]
      }
    ],
    "reels": [
      {
        "titulo": "Título do reel",
        "roteiro": "Roteiro completo com introdução, desenvolvimento e fechamento",
        "hook": "Gancho inicial cativante",
        "duracao": "30-60s"
      }
    ],
    "legendas": [
      {
        "texto": "Legenda completa com emojis e quebras de linha",
        "pilar": "EDIFICAR",
        "cta": "Call to action claro",
        "hashtags": ["#hashtag1", "#hashtag2"]
      }
    ]
  },
  "dica_producao": {
    "estudo_biblico_detalhado": {
      "tema": "Tema central da pregação",
      "versiculos_principais": ["Versículos chave com referências"],
      "perguntas_reflexao": ["5-7 perguntas profundas para células/grupos pequenos"],
      "plano_devocional": {
        "duracao": "5 dias",
        "dias": [
          {
            "dia": 1,
            "tema": "Tema do dia",
            "leitura_biblica": "Passagens para leitura",
            "reflexao": "Pensamento guia",
            "oracao_sugerida": "Direcionamento de oração"
          }
        ]
      },
      "livros_recomendados": [
        {
          "titulo": "Nome do livro cristão",
          "autor": "Autor",
          "tema_relacionado": "Como se relaciona com a pregação",
          "para_quem": "público-alvo"
        }
      ]
    },
    "formato": "Orientações de formato visual",
    "estilo": "Orientações de estilo",
    "hashtags": ["10-15 hashtags estratégicas"]
  }
}

INSTRUÇÕES CRÍTICAS:
1. Extraia os VERSÍCULOS REAIS mencionados na pregação
2. Resumo deve capturar a ESSÊNCIA da mensagem pregada
3. Frases impactantes devem ser DIRETAS e MEMORÁVEIS
4. Carrosséis: 3-5 slides por carrossel, focados no tema principal
5. Reels: roteiro prático com timing (introdução 5s, desenvolvimento 40s, fechamento 15s)
6. Legendas adaptadas para cada tipo de post (feed, carrossel, reel)
7. Devocional: 5 dias, cada dia com tema progressivo baseado na pregação
8. Livros: 2-3 livros CRISTÃOS específicos que complementem o tema
9. Perguntas de reflexão: profundas, aplicáveis a células/grupos
10. Retorne APENAS o JSON, sem texto adicional`;

    console.log('Processing transcript with Lovable AI, length:', transcript.length);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Transcrição da pregação:\n\n${transcript}` }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received for transcript');

    const generatedContent = JSON.parse(aiData.choices[0].message.content);

    // Adicionar metadata
    const enrichedContent = {
      ...generatedContent,
      source_type: 'transcript',
      source_metadata: {
        sermon_id,
        transcription_date: new Date().toISOString(),
        transcript_length: transcript.length
      },
      created_at: new Date().toISOString()
    };

    // Salvar na tabela content_planners
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const { data: savedContent, error: saveError } = await supabase
      .from('content_planners')
      .insert({
        user_id: user.id,
        week_start_date: weekStart.toISOString().split('T')[0],
        content: [enrichedContent]
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving content:', saveError);
      throw saveError;
    }

    console.log('Transcript content saved successfully with id:', savedContent.id);

    return new Response(JSON.stringify({ 
      success: true,
      content_id: savedContent.id,
      content: enrichedContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content-from-transcript:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
