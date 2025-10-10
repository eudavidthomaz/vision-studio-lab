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

    // Detectar se é uma transcrição longa (provável áudio de pregação)
    const isLongTranscript = prompt.length > 5000;
    console.log(`Processing prompt (${prompt.length} chars), isLongTranscript: ${isLongTranscript}`);
    
    // Truncar prompts muito longos para evitar erros
    let processedPrompt = prompt;
    if (isLongTranscript && prompt.length > 20000) {
      console.log('Prompt too long, truncating to 20000 chars');
      processedPrompt = prompt.substring(0, 20000) + '\n\n[Transcrição truncada por exceder limite]';
    }

  // Detectar tipo de conteúdo solicitado
  let detectedType = 'post'; // default

  // PRIORIDADE 1: Verificar se há marcador explícito
  const explicitTypeMatch = processedPrompt.match(/^TIPO_SOLICITADO:\s*(\w+)/i);
  if (explicitTypeMatch) {
    detectedType = explicitTypeMatch[1].toLowerCase();
    console.log(`Explicit type detected: ${detectedType}`);
  } else {
    // PRIORIDADE 2: Detecção por regex (formatos específicos primeiro)
    const contentTypeDetection = {
      // PRIORIDADE 1: Formatos específicos
      carrossel: /carrossel|slides|cards/i,
      reel: /reel|vídeo|roteiro|script/i,
      stories: /stories|story|storys/i,
      estudo: /estudo|estudo bíblico|análise bíblica|exegese/i,
      resumo: /resumo|resumir|sintetize|principais pontos|síntese/i,
      devocional: /devocional|meditação|reflexão diária/i,
      perguntas: /perguntas|questões|discussão|célula/i,
      post: /post|publicação|legenda/i,
      
      // PRIORIDADE 2: Ideia estratégica (apenas se nenhum formato foi detectado)
      ideia_estrategica: /ideia|viral|campanha|estratégia|plano de conteúdo|série/i
    };

    // Apenas analisar os primeiros 2000 caracteres para evitar falsos positivos
    const promptStart = processedPrompt.substring(0, 2000);
    
    for (const [type, regex] of Object.entries(contentTypeDetection)) {
      if (regex.test(promptStart)) {
        detectedType = type;
        break;
      }
    }
  }

  console.log(`Final detected content type: ${detectedType}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Prompt do Mentor de Mídias (David Thomaz)
    const MENTOR_IDENTITY = `
Você é o **Mentor de Mídias para Igrejas**, moldado pela mente e missão de David Thomaz. Sua função é **orientar equipes de mídia (de 1 a 100 pessoas)** com uma abordagem que une **teologia, marketing, filosofia, design e tecnologia** para servir à igreja com verdade, beleza e utilidade.

[MISSÃO]
Transformar o ministério de mídia em uma expressão de serviço que honra a presença de Deus, protege a dignidade das pessoas e comunica a fé com excelência, verdade e simplicidade.  
**Mídia como serviço. Não espetáculo.**

[BASE TEOLÓGICA]
- **Cristocêntrico e pastoral** (orientado à edificação e não à vaidade).
- **Valorização da dignidade humana** (Gênesis 1:26–27 – Imago Dei).
- **Boas obras visíveis** (Mateus 5:16 – que vejam e glorifiquem).
- **Comunicação com graça e verdade** (Colossenses 4:6).
- **Intimidade não se explora** (Eclesiastes 3:7 – há tempo de calar).
- **Serviço com excelência** (Romanos 12 – cada dom, com zelo e humildade).

[BASE ACADÊMICA]
- **Marketing**: Kotler (4.0/6.0), Seth Godin, Cialdini, Byron Sharp, Aaker.
- **Branding & Cultura**: Primal Branding, Douglas Rushkoff, Berger (Contagious).
- **Filosofia**: Agostinho, Arendt, Kierkegaard, Charles Taylor.
- **Comunicação & Design**: McLuhan, Stuart Hall, Don Norman, Duarte, Tufte.
- **Neurociência aplicada**: Kahneman, Ariely, Thaler.

[TOM E ESTILO]
Pastoral, direto, didático e estratégico. Nunca usa jargão sem explicar. Ensina com propósito, não com vaidade. Prefere um post verdadeiro a um viral vazio.
`;

    // Estruturas JSON dinâmicas por tipo de conteúdo
    const structureByType: Record<string, string> = {
      ideia_estrategica: `{
  "fundamento_biblico": {
    "versiculos": ["Referência completa - texto"],
    "contexto": "Contexto histórico e cultural",
    "principio_atemporal": "Verdade que transcende época"
  },
  "ideia_estrategica": {
    "titulo": "Nome atrativo da ideia",
    "problema_real": "Qual dor/necessidade essa ideia resolve",
    "proposta": "Descrição clara da ideia (2-3 parágrafos)",
    "hook_psicologico": "Por que isso prende atenção (Cialdini/Kahneman)",
    "pilar_editorial": "Alcançar | Edificar | Pertencer | Servir",
    "base_academica": ["Kotler: princípio X", "Godin: conceito Y"],
    "implementacao": {
      "equipe_solo": "Como fazer com 1 pessoa",
      "equipe_pequena": "Como fazer com 2-5 pessoas",
      "equipe_estruturada": "Como fazer com 10+ pessoas"
    },
    "passos_praticos": [
      "1. Ação específica",
      "2. Próximo passo",
      "3. Etc"
    ],
    "metricas_de_fruto": "Como medir impacto além de views",
    "filtro_etico": "Cuidados teológicos e éticos importantes",
    "exemplo_pratico": "Caso real ou hipotético de aplicação"
  }
}`,
      
      estudo: `{
  "fundamento_biblico": {
    "versiculos": ["Versículo 1 com referência completa", "Versículo 2"],
    "contexto": "Contexto histórico, cultural e teológico detalhado",
    "principio": "Princípio atemporal extraído"
  },
  "estudo_biblico": {
    "tema": "Tema central do estudo",
    "introducao": "Introdução contextual em 2-3 parágrafos",
    "desenvolvimento": [
      {
        "ponto": "Ponto de ensino 1",
        "explicacao": "Explicação detalhada com base bíblica",
        "aplicacao": "Como aplicar esse ponto na vida prática"
      }
    ],
    "perguntas": [
      "Pergunta reflexiva 1",
      "Pergunta reflexiva 2"
    ],
    "conclusao": "Conclusão prática e inspiradora",
    "desafio": "Desafio semanal para aplicação"
  }
}`,
      
      resumo: `{
  "fundamento_biblico": {
    "versiculos": ["Versículo principal 1", "Versículo principal 2"],
    "contexto": "Contexto da pregação",
    "principio": "Princípio central ensinado"
  },
  "resumo_pregacao": {
    "titulo": "Título da mensagem",
    "introducao": "Como a pregação começou e contexto inicial",
    "pontos_principais": [
      {
        "numero": 1,
        "titulo": "Título do ponto",
        "conteudo": "Resumo do que foi ensinado neste ponto"
      }
    ],
    "ilustracoes": ["Ilustração ou história marcante 1"],
    "conclusao": "Conclusão e chamado final da pregação",
    "aplicacao_pratica": "Como aplicar os ensinamentos no dia a dia"
  },
  "frases_impactantes": ["Frase marcante 1", "Frase marcante 2"]
}`,

      perguntas: `{
  "fundamento_biblico": {
    "versiculos": ["Versículo base 1", "Versículo base 2"],
    "contexto": "Contexto bíblico",
    "principio": "Princípio para discussão"
  },
  "perguntas_celula": {
    "tema": "Tema da reunião de célula",
    "quebra_gelo": "Pergunta inicial leve para iniciar",
    "perguntas_reflexao": [
      {
        "numero": 1,
        "pergunta": "Pergunta profunda para discussão",
        "objetivo": "O que essa pergunta busca explorar"
      }
    ],
    "aplicacao_pratica": "Como aplicar essa semana",
    "momento_oracao": "Direcionamento para encerrar em oração"
  }
}`,

      devocional: `{
  "fundamento_biblico": {
    "versiculos": ["Versículo do dia"],
    "contexto": "Contexto do versículo",
    "principio": "Princípio para meditar"
  },
  "devocional": {
    "titulo": "Título do devocional",
    "reflexao": "Texto reflexivo em 3-4 parágrafos conectando a Palavra com a vida",
    "perguntas_pessoais": [
      "Como isso se aplica à minha vida hoje?",
      "O que Deus está me ensinando?"
    ],
    "oracao": "Oração sugerida relacionada ao tema",
    "desafio_do_dia": "Desafio prático para colocar em prática hoje"
  }
}`,

      post: `{
  "fundamento_biblico": {
    "versiculos": ["Versículo 1", "Versículo 2"],
    "contexto": "Contexto histórico e cultural",
    "principio": "Princípio atemporal"
  },
  "conteudo": {
    "tipo": "post",
    "legenda": "Legenda completa do post com quebras e emojis",
    "pilar": "ALCANÇAR | EDIFICAR | PERTENCER | SERVIR"
  },
  "dica_producao": {
    "formato": "1080x1080px",
    "estilo": "Estilo visual recomendado",
    "horario": "Melhor horário",
    "hashtags": ["#hashtag1", "#hashtag2"]
  }
}`,

      carrossel: `{
  "fundamento_biblico": {
    "versiculos": ["Versículo 1", "Versículo 2"],
    "contexto": "Contexto da passagem",
    "principio": "Princípio ensinado"
  },
  "conteudo": {
    "tipo": "carrossel",
    "legenda": "Legenda completa",
    "pilar": "ALCANÇAR | EDIFICAR | PERTENCER | SERVIR"
  },
  "estrutura_visual": {
    "cards": [
      {"titulo": "Card 1", "texto": "Texto do card 1"},
      {"titulo": "Card 2", "texto": "Texto do card 2"}
    ]
  },
  "dica_producao": {
    "formato": "1080x1080px",
    "estilo": "Minimalista e clean",
    "horario": "18h-20h",
    "hashtags": ["#fe", "#biblia"]
  }
}`,

      reel: `{
  "fundamento_biblico": {
    "versiculos": ["Versículo principal"],
    "contexto": "Contexto",
    "principio": "Princípio para o vídeo"
  },
  "conteudo": {
    "tipo": "reel",
    "legenda": "Legenda do reel",
    "pilar": "ALCANÇAR | EDIFICAR | PERTENCER | SERVIR"
  },
  "estrutura_visual": {
    "roteiro": "0-3s: Abertura impactante\n3-8s: Desenvolvimento\n8-15s: Conclusão e call to action",
    "duracao_total": "15-30s",
    "audio_sugerido": "Tipo de áudio recomendado"
  },
  "dica_producao": {
    "formato": "1080x1920px vertical",
    "estilo": "Dinâmico com cortes rápidos",
    "horario": "19h-21h",
    "hashtags": ["#reels", "#fe"]
  }
}`,

      stories: `{
  "fundamento_biblico": {
    "versiculos": ["Versículo tema"],
    "contexto": "Contexto semanal",
    "principio": "Princípio da semana"
  },
  "stories": [
    {
      "dia": "Segunda",
      "texto": "Mensagem inspiradora curta",
      "versiculo": "Versículo do dia",
      "call_to_action": "O que fazer hoje"
    }
  ],
  "dica_producao": {
    "formato": "1080x1920px",
    "estilo": "Clean e legível",
    "horario": "Manhã (7h-9h) ou noite (20h-22h)",
    "hashtags": []
  }
}`
    };

    const selectedStructure = structureByType[detectedType] || structureByType.post;

    // Construir o system prompt dinâmico baseado no tipo detectado
    const systemPrompt = `${detectedType === 'ideia_estrategica' ? MENTOR_IDENTITY : ''}

${CORE_PRINCIPLES}

${CONTENT_METHOD}

${PILLAR_DISTRIBUTION}

${detectedType === 'ideia_estrategica' ? `
Você está operando como **MENTOR DE MÍDIAS** com expertise em:
- Teologia aplicada ao ministério de comunicação
- Marketing estratégico (Kotler, Godin, Cialdini)
- Design e narrativa visual
- Gestão de equipes de mídia

Sua resposta deve ser PASTORAL + ESTRATÉGICA + PRÁTICA.
` : 'Você é um assistente especializado em criar conteúdo cristão.'}

Analise o pedido do usuário e identifique o tipo de conteúdo solicitado.

TIPO DETECTADO: ${detectedType}

REGRAS IMPORTANTES:
1. SEMPRE inclua fundamento_biblico (versículos com referências completas, contexto histórico/cultural, princípio atemporal)
2. Retorne APENAS os campos necessários para o tipo de conteúdo solicitado
3. NÃO inclua campos desnecessários (ex: se é um estudo, não gere hashtags ou legendas para redes sociais)
4. Seja pastoral, prático e biblicamente fundamentado
5. Retorne APENAS JSON válido, sem texto adicional antes ou depois

Use esta estrutura JSON como guia:

${selectedStructure}

${isLongTranscript ? `
ATENÇÃO: Esta é uma transcrição longa de pregação. 
- Identifique os principais pontos teológicos
- Extraia versículos-chave mencionados
- Seja completo e detalhado na análise
` : ''}

Retorne APENAS o JSON válido.`;

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
          { role: 'user', content: processedPrompt }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 4000,
        temperature: 0.7
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    let generatedContent;
    try {
      const rawContent = aiData.choices[0].message.content;
      console.log('Raw AI response (first 500 chars):', rawContent.substring(0, 500));
      console.log('Response length:', rawContent.length);
      
      // Extrair apenas o JSON (regex pega primeiro objeto JSON encontrado)
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Full raw response:', rawContent);
        throw new Error('Nenhum JSON válido encontrado na resposta da IA');
      }
      
      generatedContent = JSON.parse(jsonMatch[0]);
      
    // Validação básica de estrutura - fundamento_biblico é obrigatório sempre
    if (!generatedContent.fundamento_biblico) {
      console.error('Invalid structure:', generatedContent);
      throw new Error('IA retornou estrutura incompleta - falta fundamento_biblico');
    }

    // Validar se retornou o tipo correto
    const hasCorrectStructure = 
      (detectedType === 'ideia_estrategica' && generatedContent.ideia_estrategica) ||
      (detectedType === 'estudo' && generatedContent.estudo_biblico) ||
      (detectedType === 'resumo' && generatedContent.resumo_pregacao) ||
      (detectedType === 'perguntas' && generatedContent.perguntas_celula) ||
      (detectedType === 'devocional' && generatedContent.devocional) ||
      (detectedType === 'stories' && generatedContent.stories) ||
      (['post', 'carrossel', 'reel'].includes(detectedType) && generatedContent.conteudo);

    if (!hasCorrectStructure) {
      console.error(`Expected ${detectedType} structure, got:`, Object.keys(generatedContent));
      throw new Error(`IA retornou estrutura errada - esperava ${detectedType}`);
    }
    
    // Adicionar tipo detectado ao conteúdo para o frontend saber como renderizar
    generatedContent.content_type = detectedType;
      
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw AI response:', aiData.choices[0].message.content);
      
      return new Response(JSON.stringify({ 
        error: 'A IA retornou uma resposta inválida. Tente novamente com um prompt mais específico ou curto.',
        debug: parseError instanceof Error ? parseError.message : 'Unknown error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
