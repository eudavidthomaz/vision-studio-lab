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

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 10) {
      return new Response(JSON.stringify({ 
        error: 'Prompt inválido. Por favor, descreva o que você quer criar.' 
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

Você é um assistente especializado em criar conteúdo cristão para redes sociais.
Analise o pedido do usuário e gere um conteúdo COMPLETO em formato JSON com a seguinte estrutura EXATA:

{
  "fundamento_biblico": {
    "versiculos": ["Versículo 1 completo com referência", "Versículo 2..."],
    "contexto": "Contexto histórico e literário em 2-3 linhas",
    "principio": "O princípio atemporal em uma frase clara"
  },
  "conteudo": {
    "tipo": "carrossel | reel | post | story",
    "legenda": "Legenda completa, emocional, pastoral, com quebras de linha e emojis contextuais",
    "pilar": "ALCANÇAR | EDIFICAR | PERTENCER | SERVIR"
  },
  "estrutura_visual": {
    "cards": [
      {
        "titulo": "Título do card 1",
        "texto": "Texto do card 1"
      }
    ],
    "roteiro": "Se for vídeo/reel, o roteiro completo"
  },
  "dica_producao": {
    "formato": "Ex: Carrossel 1080x1350px, 5 slides",
    "estilo": "Ex: Minimalista com tipografia destacada e cores suaves",
    "horario": "Ex: Manhã (7-9h) para devocionais | Tarde (15-17h) para reflexões",
    "hashtags": ["#hashtag1", "#hashtag2", "...8-12 hashtags estratégicas"]
  }
}

REGRAS IMPORTANTES:
1. SEMPRE inclua versículos bíblicos completos e relevantes
2. O contexto deve ser breve mas informativo
3. A legenda deve ser pastoral, calorosa e prática
4. Se for carrossel, inclua 3-7 cards
5. Se for vídeo/reel, inclua roteiro com timing
6. Hashtags devem ser relevantes para público cristão brasileiro
7. Escolha o pilar mais adequado ao tema
8. Retorne APENAS o JSON, sem texto adicional`;

    console.log('Calling Lovable AI with prompt:', prompt.substring(0, 100));

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
          { role: 'user', content: prompt }
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
    console.log('AI response received');

    const generatedContent = JSON.parse(aiData.choices[0].message.content);

    // Salvar na tabela content_planners
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const { data: savedContent, error: saveError } = await supabase
      .from('content_planners')
      .insert({
        user_id: user.id,
        week_start_date: weekStart.toISOString().split('T')[0],
        content: [
          {
            ...generatedContent,
            prompt_original: prompt,
            created_at: new Date().toISOString(),
            tipo: 'ai-generated'
          }
        ]
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving content:', saveError);
      throw saveError;
    }

    console.log('Content saved successfully with id:', savedContent.id);

    return new Response(JSON.stringify({ 
      success: true,
      content_id: savedContent.id,
      content: generatedContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-ai-content:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
