import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import {
  MENTOR_IDENTITY,
  MENTOR_IDENTITY_SIMPLIFIED,
  THEOLOGICAL_BASE,
  ACADEMIC_BASE,
  STUDY_BASE,
  CORE_PRINCIPLES,
  CONTENT_METHOD,
  PILLAR_DISTRIBUTION
} from "../_shared/prompt-principles.ts";
import { 
  detectContentTypes, 
  isContentType,
  getDefaultPillar,
  typeRequiresBiblicalFoundation,
  getTypeDefinition,
  interpretSemanticType,
  CONTENT_TYPE_DEFINITIONS,
  type ContentType
} from "../_shared/detectContentTypes.ts";

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

    const { prompt, denominationalPrefs } = await req.json();

    // Validação robusta de entrada
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ 
        error: 'Prompt inválido. Por favor, descreva o que você quer criar.',
        code: 'INVALID_PROMPT_TYPE'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length < 20) {
      return new Response(JSON.stringify({ 
        error: 'Prompt muito curto. Descreva com mais detalhes o conteúdo que deseja criar (mínimo 20 caracteres).',
        code: 'PROMPT_TOO_SHORT'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Verificar se é apenas whitespace ou caracteres repetidos
    if (/^(.)\1*$/.test(trimmedPrompt) || !/\w{3,}/.test(trimmedPrompt)) {
      return new Response(JSON.stringify({ 
        error: 'Prompt inválido. Por favor, descreva o conteúdo de forma clara.',
        code: 'INVALID_PROMPT_CONTENT'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Processar prompt sem truncamento
    const processedPrompt = prompt;
    console.log(`Processing prompt (${prompt.length} chars)`);

    // ============================================
    // FASE 4: VALIDAÇÃO ÉTICA - POLÍTICA DE RECUSA
    // ============================================
    const ethicalValidation = (text: string): { allowed: boolean; reason?: string } => {
      // Exceções contextuais - referências acadêmicas/históricas são permitidas
      const contextualExceptions = [
        /contexto\s+(político|histórico)/i,
        /situação\s+política/i,
        /implicações?\s+políticas?/i,
        /romano.*polític/i,
        /polític.*romano/i,
        /polític.*império/i,
        /império.*polític/i,
        /governo\s+(romano|de\s+roma|da\s+época)/i,
        /autoridades?\s+(romana|da\s+época)/i,
        /cenário\s+(político|histórico)/i,
        /realidade\s+política/i,
        /ambiente\s+político/i,
      ];
      
      // Se o texto contém uma exceção contextual (referência acadêmica/histórica), permitir
      const hasContextualException = contextualExceptions.some(ex => ex.test(text));
      if (hasContextualException) {
        console.log('✅ Ethical validation: contextual exception found (academic/historical reference)');
        return { allowed: true };
      }
      
      const redFlags = [
        {
          pattern: /(crianças?|menores?|bebês?).*(foto|vídeo|imagem|gravar)/i,
          reason: 'Conteúdo envolve menores sem menção explícita de autorização dos responsáveis (ECA).'
        },
        {
          pattern: /(choro|sofrimento|luto|funeral).*(postar|publicar|gravar)/i,
          reason: 'Exploração de vulnerabilidade emocional para engajamento (não edificante).'
        },
        {
          // Mais específico: apenas proselitismo eleitoral real, não referências históricas/acadêmicas
          pattern: /(vote\s+(em|no|na)\s+\w+|candidato\s+(a\s+)?(prefeito|vereador|deputado|presidente|governador|senador)|apoie\s+(o\s+)?(candidato|partido)|propaganda\s+eleitoral|campanha\s+(eleitoral|partidária)|elei[çc][ãõa]o\s+(de\s+)?\d{4}|urna\s+eletr[oô]nica)/i,
          reason: 'Proselitismo político-partidário eleitoral não é permitido.'
        },
        {
          pattern: /(baixar|download|piratear|usar).*(música|imagem|vídeo).*(sem|gratuito|de graça)/i,
          reason: 'Violação de direitos autorais (antiplágio e Lei 9610).'
        }
      ];
      
      for (const flag of redFlags) {
        const match = text.match(flag.pattern);
        if (match) {
          console.warn(`⛔ Ethical validation failed: ${flag.reason} | Trigger: "${match[0]}"`);
          return { allowed: false, reason: flag.reason };
        }
      }
      
      return { allowed: true };
    };

    // Aplicar validação ética
    const validation = ethicalValidation(processedPrompt);
    if (!validation.allowed) {
      console.warn('Ethical validation failed:', validation.reason);
      
      return new Response(JSON.stringify({ 
        error: 'Pedido recusado por questões éticas',
        message: `Prefiro proteger a verdade e a dignidade do que buscar um conteúdo viral. ${validation.reason} Vamos fazer do jeito certo?`,
        code: 'ETHICAL_VIOLATION'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  // Extrair especificações do usuário do prompt
  const extractUserSpecs = (text: string) => {
    const specs: any = {};
    
    const quantMatch = text.match(/QUANTIDADE_OBRIGATÓRIA:\s*(\d+)/i);
    if (quantMatch) specs.quantidade = parseInt(quantMatch[1]);
    
    const tomMatch = text.match(/TOM_OBRIGATÓRIO:\s*(\w+)/i);
    if (tomMatch) specs.tom = tomMatch[1];
    
    const duracaoMatch = text.match(/DURAÇÃO:\s*([\d\w]+)/i);
    if (duracaoMatch) specs.duracao = duracaoMatch[1];
    
    const publicoMatch = text.match(/PÚBLICO_ALVO:\s*(\w+)/i);
    if (publicoMatch) specs.publico = publicoMatch[1];
    
    return specs;
  };

  const userSpecs = extractUserSpecs(processedPrompt);
  console.log('📋 User specifications extracted:', userSpecs);

  // Detectar tipo de conteúdo solicitado - captura até newline ou fim
  const explicitTypeMatch = processedPrompt.match(/TIPO_SOLICITADO:\s*([a-z_]+)/i);

  const explicitTypes: ContentType[] = explicitTypeMatch
    ? [explicitTypeMatch[1].trim().toLowerCase()]
        .filter(isContentType) as ContentType[]
    : [];

  console.log(`📌 Explicit type from prompt: ${explicitTypes.length > 0 ? explicitTypes.join(", ") : 'none'}`);

  // Se tipo explícito foi encontrado, usar apenas ele (prioridade máxima)
  const detectedTypes = explicitTypes.length > 0
    ? explicitTypes
    : detectContentTypes(processedPrompt.substring(0, 2000));

  const detectedType: ContentType = detectedTypes[0] || "post";
  const wasTypeInferred = explicitTypes.length === 0 && detectedTypes[0] === "post";

  console.log(`✅ Detected type(s): ${detectedTypes.join(", ")}${wasTypeInferred ? ' (fallback)' : ''}`);
  console.log(`Final detected content type: ${detectedType}`);
  
  // Detectar pilar baseado no tipo e contexto do prompt - usa configuração unificada
  const detectPilar = (type: string, promptText: string): string => {
    const lowerPrompt = promptText.toLowerCase();
    
    // Primeiro, tentar obter o pilar padrão do tipo
    const defaultTypePillar = getDefaultPillar(type);
    
    // Verificar contexto do prompt para sobrescrever se necessário
    if (/evangel|alcan[çc]ar|perdido|n[ãa]o.?crente|mundo|testemunho/i.test(lowerPrompt)) {
      return 'ALCANÇAR';
    }
    
    if (/comunidade|família|grupo|c[ée]lula|pertencer|integra[çc]/i.test(lowerPrompt)) {
      return 'PERTENCER';
    }
    
    if (/servir|volunt[áa]rio|equipe|minist[ée]rio|trein/i.test(lowerPrompt)) {
      return 'SERVIR';
    }
    
    if (/adorar|louvar|exaltar|glor/i.test(lowerPrompt)) {
      return 'EXALTAR';
    }
    
    if (/enviar|miss[aã]o|missionário|desafio/i.test(lowerPrompt)) {
      return 'ENVIAR';
    }
    
    // Usar pilar padrão do tipo
    return defaultTypePillar;
  };
  
  const detectedPilar = detectPilar(detectedType, processedPrompt);

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

      resumo_breve: `{
  "resumo": "Resumo conciso e impactante da pregação em até 500 palavras. Deve incluir: tema central (1 linha), mensagem principal (2-3 parágrafos), e aplicação prática (1 parágrafo). Estilo claro, inspirador e fiel ao conteúdo original."
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

      devocional_semanal: `{
  "fundamento_biblico": {
    "versiculos": ["Versículo base da semana"],
    "contexto": "Contexto geral da série devocional",
    "principio": "Princípio central que percorre todos os dias"
  },
  "devocional_semanal": {
    "titulo": "Série Devocional - [Tema Central]",
    "objetivo_semanal": "Transformação espiritual esperada ao final dos 7 dias",
    "dias": [
      {
        "dia": 1,
        "titulo": "Título do Dia 1 - [Subtema]",
        "versiculo_base": "Referência completa - texto do versículo",
        "reflexao": "Reflexão pastoral profunda em 3-4 parágrafos conectando a Palavra com a vida diária. Deve ser substancial, pessoal e aplicável.",
        "perguntas_pessoais": [
          "Pergunta reflexiva 1 para autoexame",
          "Pergunta reflexiva 2 para aplicação prática"
        ],
        "oracao": "Oração sugerida para este dia, personalizada ao tema",
        "desafio_do_dia": "Desafio prático específico para colocar em ação hoje"
      },
      {
        "dia": 2,
        "titulo": "Título do Dia 2",
        "versiculo_base": "Versículo diferente do dia 1",
        "reflexao": "Reflexão que avança no tema",
        "perguntas_pessoais": ["Pergunta 1", "Pergunta 2"],
        "oracao": "Oração do dia 2",
        "desafio_do_dia": "Desafio progressivo"
      }
    ],
    "conclusao_semanal": "Reflexão final conectando todos os dias e propondo próximos passos de crescimento espiritual"
  }
}`,

    calendario: `{
  "calendario_editorial": {
    "periodo": "Semana de DD/MM a DD/MM ou Mês de MMM/AAAA",
    "objetivo": "Objetivo estratégico deste período",
    "postagens": [
      {
        "dia": "Segunda-feira DD/MM",
        "horario_sugerido": "19h",
        "formato": "Carrossel | Post | Reel | Stories",
        "tema": "Tema do post",
        "pilar": "ALCANÇAR | EDIFICAR | PERTENCER | SERVIR",
        "versiculo_base": "Referência bíblica (opcional)",
        "objetivo_do_post": "O que queremos comunicar"
      }
    ],
    "observacoes": "Dicas estratégicas para o período"
  }
}`,
    convite: `{
  "convite": {
    "titulo_evento": "Nome do evento",
    "data": "DD/MM/AAAA",
    "horario": "HH:MM",
    "local": "Nome do local ou link online",
    "descricao": "Descrição atrativa do evento (2-3 parágrafos)",
    "publico_alvo": "Para quem é este evento",
    "como_participar": "Instruções de inscrição/presença",
    "contato": "WhatsApp ou email para dúvidas",
    "chamado_acao": "Frase final motivadora"
  }
}`,
    aviso: `{
  "aviso": {
    "tipo": "Urgente | Importante | Informativo",
    "titulo": "Título do aviso",
    "mensagem": "Texto completo do aviso (claro e direto)",
    "data_vigencia": "Até quando vale este aviso",
    "responsavel": "Quem procurar para mais informações",
    "chamado_acao": "O que a pessoa deve fazer"
  }
}`,
    guia: `{
  "guia": {
    "titulo": "Nome do guia",
    "introducao": "Para que serve este guia",
    "passos": [
      {
        "numero": 1,
        "titulo": "Título do passo",
        "descricao": "Explicação detalhada",
        "dica": "Dica prática opcional"
      }
    ],
    "recursos_necessarios": ["Item 1", "Item 2"],
    "conclusao": "Encorajamento final"
  }
}`,
    esboco: `{
  "fundamento_biblico": {
    "versiculos": ["Versículo 1 com referência completa"],
    "contexto": "Contexto histórico e cultural",
    "principio_atemporal": "Princípio aplicável hoje"
  },
  "esboco": {
    "titulo": "Título do esboço/sermão",
    "introducao": "Contexto e gancho inicial",
    "topicos": [
      {
        "numero": "I",
        "titulo": "Título do tópico principal",
        "subtopicos": ["A. Subtópico 1", "B. Subtópico 2"],
        "versiculo_base": "Referência bíblica"
      }
    ],
    "conclusao": "Conclusão e aplicação prática"
  }
}`,
    versiculos_citados: `{
  "versiculos_citados": {
    "origem": "Pregação/Estudo de DD/MM/AAAA",
    "versiculos": [
      {
        "referencia": "João 3:16",
        "texto_completo": "Porque Deus amou o mundo de tal maneira...",
        "contexto_uso": "Como foi usado na mensagem"
      }
    ]
  }
}`,
    trilha_oracao: `{
  "fundamento_biblico": {
    "versiculos": ["Versículos sobre oração"],
    "contexto": "Contexto bíblico da oração",
    "principio_atemporal": "Princípios de intercessão"
  },
  "trilha_oracao": {
    "titulo": "Nome da trilha de oração",
    "duracao_estimada": "15-30 minutos",
    "introducao": "Como começar este momento de oração",
    "etapas": [
      {
        "numero": 1,
        "nome": "Adoração | Confissão | Súplica | Intercessão | Gratidão",
        "orientacao": "O que fazer nesta etapa",
        "versiculo_guia": "Referência - texto completo",
        "tempo_sugerido": "5 minutos"
      }
    ],
    "encerramento": "Como encerrar a oração"
  }
}`,
    qa_estruturado: `{
  "fundamento_biblico": {
    "versiculos": ["Versículos relacionados ao tema"],
    "contexto": "Contexto das perguntas",
    "principio_atemporal": "Princípio bíblico central"
  },
  "perguntas_respostas": {
    "tema": "Tema do Q&A",
    "introducao": "Contexto geral das perguntas",
    "questoes": [
      {
        "numero": 1,
        "pergunta": "Pergunta completa",
        "resposta": "Resposta detalhada e pastoral",
        "versiculo_relacionado": "Referência bíblica"
      }
    ]
  }
}`,
    convite_grupos: `{
  "convite_grupos": {
    "tipo_grupo": "Célula | Discipulado | Grupo de Estudo | Ministério",
    "nome_grupo": "Nome do grupo",
    "descricao": "O que fazemos no grupo (2-3 parágrafos)",
    "publico": "Para quem é este grupo",
    "quando": "Dia e horário dos encontros",
    "onde": "Local físico ou link online",
    "como_entrar": "Instruções para participar",
    "contato": "Nome e contato do líder",
    "chamado_acao": "Frase motivadora final"
  }
}`,
      discipulado: `{
  "fundamento_biblico": {
    "versiculos": ["Versículos sobre discipulado"],
    "contexto": "Base bíblica do discipulado",
    "principio_atemporal": "Princípios de crescimento espiritual"
  },
  "plano_discipulado": {
    "titulo": "Nome do plano de discipulado",
    "objetivo": "O que se espera alcançar espiritualmente",
    "duracao": "Quantidade de semanas/meses",
    "encontros": [
      {
        "numero": 1,
        "tema": "Tema do encontro",
        "objetivos": ["Objetivo 1", "Objetivo 2"],
        "versiculo_base": "Referência e texto",
        "atividades": ["Atividade 1", "Atividade 2"],
        "tarefa_casa": "O que fazer até o próximo encontro"
      }
    ],
    "recursos": ["Livro recomendado", "Material de apoio"]
  }
}`,
    desafio_semanal: `{
  "fundamento_biblico": {
    "versiculos": ["Versículo 1 com referência completa", "Versículo 2"],
    "contexto": "Contexto bíblico e teológico do desafio",
    "principio_atemporal": "Princípio que fundamenta o desafio"
  },
  "desafio_semanal": {
    "titulo": "Nome impactante do desafio (ex: #7DiasDeGratidão)",
    "objetivo_espiritual": "Transformação espiritual esperada ao completar o desafio",
    "objetivo_pratico": "Resultado tangível e mensurável na vida da pessoa",
    "como_funciona": "Explicação clara em 2-3 frases de como participar",
    "dias": [
      {
        "dia": 1,
        "acao": "Ação específica e mensurável para fazer hoje",
        "versiculo_do_dia": "Referência completa - texto do versículo",
        "reflexao": "Pergunta ou frase curta para meditar durante o dia",
        "exemplo_pratico": "Exemplo concreto de como aplicar isso no cotidiano"
      },
      {
        "dia": 2,
        "acao": "Segunda ação progressiva",
        "versiculo_do_dia": "Referência - texto",
        "reflexao": "Reflexão do dia 2",
        "exemplo_pratico": "Exemplo prático do dia 2"
      },
      {
        "dia": 3,
        "acao": "Terceira ação",
        "versiculo_do_dia": "Referência - texto",
        "reflexao": "Reflexão do dia 3",
        "exemplo_pratico": "Exemplo prático do dia 3"
      },
      {
        "dia": 4,
        "acao": "Ponto de virada - desafio mais profundo",
        "versiculo_do_dia": "Referência - texto",
        "reflexao": "Reflexão desafiadora",
        "exemplo_pratico": "Exemplo que exige mais comprometimento"
      },
      {
        "dia": 5,
        "acao": "Quinta ação",
        "versiculo_do_dia": "Referência - texto",
        "reflexao": "Reflexão do dia 5",
        "exemplo_pratico": "Exemplo prático do dia 5"
      },
      {
        "dia": 6,
        "acao": "Sexta ação",
        "versiculo_do_dia": "Referência - texto",
        "reflexao": "Reflexão do dia 6",
        "exemplo_pratico": "Exemplo prático do dia 6"
      },
      {
        "dia": 7,
        "acao": "Conclusão - ação de compromisso futuro",
        "versiculo_do_dia": "Referência - texto inspirador",
        "reflexao": "O que você vai levar daqui pra frente?",
        "exemplo_pratico": "Como continuar praticando após o desafio"
      }
    ],
    "como_compartilhar": {
      "sugestao_post": "Texto curto para a pessoa postar o progresso diário",
      "hashtag": "#NomeDoDesafio",
      "formato": "stories, feed ou grupo de WhatsApp"
    },
    "metricas_de_impacto": {
      "individual": "Como a pessoa mede o próprio progresso (ex: marcar dias no papel)",
      "comunitario": "Como a igreja acompanha participação (ex: contador de stories com a hashtag)"
    }
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
    "versiculos": ["Versículo 1 com referência completa", "Versículo 2"],
    "contexto": "Contexto histórico, cultural e teológico da passagem",
    "principio": "Princípio atemporal ensinado nos versículos"
  },
  "conteudo": {
    "tipo": "carrossel",
    "titulo": "Título principal do carrossel (chamativo e claro)",
    "legenda": "Legenda completa e engajante para o post no Instagram (com emojis e quebras de linha)",
    "pilar": "ALCANÇAR | EDIFICAR | PERTENCER | SERVIR"
  },
  "estrutura_visual": {
    "slides": [
      {
        "numero": 1,
        "titulo_slide": "Título impactante do primeiro slide",
        "conteudo": "Texto principal do slide (claro, direto e visualmente organizado)",
        "imagem_sugerida": "Descrição da imagem ou visual sugerido para este slide",
        "chamada_para_acao": "CTA específico deste slide (opcional)"
      },
      {
        "numero": 2,
        "titulo_slide": "Título do segundo slide",
        "conteudo": "Desenvolvimento do tema com aplicação prática",
        "imagem_sugerida": "Sugestão visual para slide 2",
        "chamada_para_acao": "CTA do slide 2"
      }
      // Gerar 8-10 slides com progressão lógica
    ]
  },
  "dica_producao": {
    "formato": "1080x1080px (carrossel de até 10 slides)",
    "estilo": "Design clean e moderno, fonte legível, cores harmônicas",
    "horario": "18h-20h (melhor horário de engajamento)",
    "hashtags": ["#fe", "#biblia", "#igreja", "#devocional"]
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
    "versiculos": [{"referencia": "João 1:1", "texto": "...", "aplicacao": "..."}],
    "contexto": "Contexto semanal dos stories",
    "reflexao": "Reflexão geral"
  },
  "stories": {
    "slides": [
      {
        "numero": 1,
        "titulo": "Título do Story",
        "texto": "Mensagem principal (50-100 palavras)",
        "versiculo": "Referência bíblica",
        "call_to_action": "Pergunta ou desafio",
        "timing": "5s",
        "sugestao_visual": "Descrição visual"
      }
    ]
  },
  "dica_producao": {
    "estilo": "Clean e legível",
    "formato": "1080x1920px",
    "horario": "Manhã (7h-9h) ou noite (20h-22h)",
    "hashtags": ["#fe", "#devocional"]
  }
}`,

      // ============================================
      // FASE 3: COMANDOS EXTRAS (FEATURE)
      // ============================================
      
      treino_voluntario: `{
  "treino": {
    "titulo": "Onboarding de Voluntário - Mídia",
    "objetivo": "Capacitar um novo voluntário em X horas",
    "modulos": [
      {
        "numero": 1,
        "nome": "Fundamentos",
        "duracao": "30min",
        "conteudo": "O que ensinar primeiro",
        "pratica": "Exercício prático para fixar"
      }
    ],
    "checklist": ["Item 1", "Item 2"],
    "recursos": ["Template 1", "Vídeo tutorial 2"]
  }
}`,

      campanha_tematica: `{
  "campanha": {
    "tema": "Tema da série (ex: Páscoa, Advento, Família)",
    "duracao": "4 semanas",
    "objetivo_geral": "O que queremos alcançar",
    "semanas": [
      {
        "numero": 1,
        "titulo": "Semana 1: Introdução",
        "posts": [
          {
            "dia": "Segunda",
            "formato": "Carrossel",
            "pilar": "ALCANÇAR",
            "ideia": "Ideia do post",
            "versiculo": "Versículo base"
          }
        ]
      }
    ],
    "assets_necessarios": ["Foto X", "Vídeo Y"]
  }
}`,

      roteiro_reels: `{
  "roteiro": {
    "hook": "Primeira frase impactante (0-3s)",
    "desenvolvimento": "Corpo do reel (3-10s)",
    "cta": "Chamada pra ação final (10-15s)",
    "duracao_total": "15 segundos",
    "texto_tela": ["Frase 1", "Frase 2", "Frase 3"],
    "audio_sugerido": "Tipo de áudio que combina"
  }
}`,

      checklist_culto: `{
  "checklist": {
    "pre_culto": [
      "Item de preparação 1",
      "Item de preparação 2"
    ],
    "durante_culto": [
      "O que capturar",
      "Quem filmar (com consentimento)"
    ],
    "pos_culto": [
      "Upload onde",
      "Edições necessárias"
    ],
    "avisos_eticos": [
      "Verificar autorizações de imagem",
      "Não expor momentos íntimos sem consentimento"
    ]
  }
}`,

      kit_basico: `{
  "kit": {
    "equipamento_minimo": [
      "Celular com câmera razoável",
      "Tripé improvisado ou apoio"
    ],
    "apps_gratuitos": [
      "Canva (design)",
      "CapCut (edição)",
      "InShot (vídeos)"
    ],
    "primeiros_passos": [
      "1. Configurar perfil da igreja",
      "2. Definir identidade visual básica",
      "3. Criar calendário simples"
    ]
  }
}`,

      manual_etica: `{
  "manual": {
    "protecao_imagem": [
      "Termo de autorização de uso de imagem",
      "Especial atenção com menores (ECA)",
      "Nunca postar momentos vulneráveis sem consentimento"
    ],
    "direitos_autorais": [
      "Usar apenas músicas licenciadas ou royalty-free",
      "Citar fontes de textos e imagens",
      "Atenção com marcas e logos"
    ],
    "lgpd": [
      "Coletar apenas dados necessários",
      "Informar claramente o uso",
      "Permitir exclusão a qualquer momento"
    ]
  }
}`,

      estrategia_social: `{
  "estrategia": {
    "objetivo": "Objetivo principal (ex: aumentar engajamento, alcançar novos)",
    "metricas": ["Métrica 1 a acompanhar", "Métrica 2"],
    "plano_semanal": [
      {
        "dia": "Segunda",
        "formato": "Post",
        "pilar": "EDIFICAR",
        "objetivo": "Inspirar a semana"
      }
    ],
    "crescimento": "Como mensurar crescimento além de números",
    "ajustes": "Quando e como ajustar estratégia"
  }
}`,

      // ============================================
      // TIPO GENÉRICO ESTRUTURADO (FALLBACK INTELIGENTE)
      // ============================================
      conteudo_generico_estruturado: `{
  "conteudo_generico_estruturado": {
    "titulo": "Título claro e descritivo do conteúdo",
    "objetivo": "Objetivo principal deste conteúdo - o que ele pretende comunicar ou ensinar",
    "blocos": [
      {
        "tipo": "introducao",
        "titulo": "Introdução ao Tema",
        "conteudo": "Parágrafo introdutório contextualizando o assunto de forma envolvente"
      },
      {
        "tipo": "desenvolvimento",
        "titulo": "Ponto Principal 1",
        "conteudo": "Desenvolvimento do primeiro ponto com exemplos e aplicações"
      },
      {
        "tipo": "desenvolvimento",
        "titulo": "Ponto Principal 2",
        "conteudo": "Desenvolvimento do segundo ponto"
      },
      {
        "tipo": "aplicacao",
        "titulo": "Aplicação Prática",
        "conteudo": "Como aplicar esse conteúdo na vida cotidiana"
      },
      {
        "tipo": "conclusao",
        "titulo": "Conclusão",
        "conteudo": "Fechamento inspirador com chamada à ação"
      }
    ],
    "versiculos_relacionados": ["Referência bíblica 1", "Referência bíblica 2"],
    "palavras_chave": ["palavra1", "palavra2", "palavra3"],
    "observacoes_sistema": "Este conteúdo foi gerado no formato estruturado genérico. Para resultados mais específicos, experimente pedir explicitamente: carrossel, devocional, estudo bíblico, stories, reel, etc."
  }
}`,

      foto_post: `{
  "foto_post": {
    "titulo": "Título do post com foto",
    "descricao_imagem": "Descrição detalhada da imagem sugerida - cores, elementos, composição",
    "legenda": "Legenda completa e engajante para o post no Instagram",
    "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
    "chamada_para_acao": "CTA específico para o público"
  },
  "dica_producao": {
    "formato": "1080x1080px (quadrado) ou 1080x1350px (retrato)",
    "estilo": "Estilo visual recomendado",
    "horario": "Melhor horário para postar com justificativa"
  }
}`,

      roteiro_video_completo: `{
  "ideia_estrategica": {
    "titulo": "Título do conteúdo de vídeo",
    "objetivo": "Objetivo estratégico do vídeo",
    "publico_alvo": "Para quem é este vídeo",
    "promessa": "O que o espectador vai ganhar",
    "chamada_para_acao": "Próximo passo esperado",
    "tom": "Tom de comunicação",
    "formato_prioritario": "Reel/Short/Vídeo longo",
    "proximos_passos": "O que fazer após gravar"
  },
  "fundamento_biblico": {
    "versiculos": ["Versículo 1 com referência", "Versículo 2"],
    "contexto": "Contexto bíblico e teológico",
    "principio_atemporal": "Princípio aplicável à vida moderna"
  },
  "roteiro_video_completo": {
    "titulo": "Título do vídeo",
    "duracao_estimada": "60-90 segundos",
    "formato": "Reel/Short/Vídeo completo",
    "proposta_estrategica": {
      "problema_real": "Qual dor/necessidade o vídeo resolve",
      "solucao_proposta": "Como o vídeo resolve isso",
      "hook_psicologico": "Gatilho que prende atenção nos primeiros 3s",
      "publico_alvo": "Para quem é este vídeo"
    },
    "roteiro": {
      "hook": {
        "duracao": "0-3s",
        "texto": "Primeira frase impactante",
        "visual": "Descrição visual da cena"
      },
      "desenvolvimento": [
        {
          "cena": 1,
          "duracao": "3-15s",
          "texto_fala": "O que falar",
          "visual": "O que mostrar",
          "texto_tela": "Texto overlay (opcional)"
        },
        {
          "cena": 2,
          "duracao": "15-30s",
          "texto_fala": "Continuação",
          "visual": "Visual da cena",
          "texto_tela": "Texto overlay"
        }
      ],
      "cta": {
        "duracao": "últimos 5s",
        "texto": "Chamada para ação",
        "visual": "Descrição visual"
      }
    },
    "implementacao": {
      "equipe_solo": "Como fazer sozinho com celular",
      "equipe_pequena": "Como fazer com 2-3 pessoas",
      "equipe_estruturada": "Versão profissional"
    },
    "passos_praticos": [
      "1. Preparar ambiente de gravação",
      "2. Gravar hook primeiro",
      "3. Gravar desenvolvimento em takes separados",
      "4. Editar com cortes dinâmicos",
      "5. Adicionar texto e música"
    ],
    "metricas_de_fruto": {
      "indicadores": ["Views", "Compartilhamentos", "Salvamentos"],
      "meta_sugerida": "Meta realista para 7 dias",
      "como_medir": "Onde acompanhar essas métricas"
    },
    "filtro_etico_teologico": {
      "aprovado": true,
      "consideracoes": "Observações sobre ética e teologia",
      "cuidados": ["Não usar música secular com letra inadequada"]
    },
    "dicas_producao": {
      "iluminacao": "Dica de luz",
      "audio": "Dica de áudio",
      "edicao": "Estilo de edição recomendado",
      "musica_sugerida": "Estilo de áudio/música",
      "hashtags": ["#hashtag1", "#hashtag2"],
      "melhor_horario": "Horário ideal para postar"
    }
  }
}`
    };

    const selectedStructure = structureByType[detectedType] || structureByType.conteudo_generico_estruturado;

    // ============================================
    // FASE 2: LÓGICA CONDICIONAL DE IDENTIDADE
    // ============================================
    
    // Tipos que DEVEM receber MENTOR_IDENTITY completo
    const strategicTypes = [
      'ideia_estrategica',
      'calendario',
      'guia',
      'campanha_tematica',
      'estrategia_social'
    ];
    
    // Tipos que recebem IDENTIDADE SIMPLIFICADA
    const contentTypes = [
      'carrossel', 'reel', 'stories', 'post',
      'estudo', 'devocional', 'resumo', 'esboco',
      'desafio_semanal', 'trilha_oracao'
    ];
    
    // Tipos OPERACIONAIS que NÃO precisam de identidade
    const operationalTypes = [
      'convite', 'aviso', 'convite_grupos', 'versiculos_citados'
    ];

    // Construir identidade dinamicamente
    let mentorContext = '';
    
    if (strategicTypes.includes(detectedType)) {
      mentorContext = MENTOR_IDENTITY + '\n\n' + THEOLOGICAL_BASE + '\n\n' + ACADEMIC_BASE;
    } else if (contentTypes.includes(detectedType)) {
      mentorContext = MENTOR_IDENTITY_SIMPLIFIED;
    } else if (operationalTypes.includes(detectedType)) {
      mentorContext = '';
    } else {
      // Default para comandos especiais
      mentorContext = MENTOR_IDENTITY_SIMPLIFIED;
    }

    // Define which types require biblical foundation
    const requiresBiblicalFoundation = [
      'post', 'carrossel', 'reel', 'stories',
      'estudo', 'resumo', 'devocional', 'devocional_semanal', 'desafio_semanal',
      'perguntas', 'esboco', 'trilha_oracao', 'qa_estruturado', 'discipulado'
    ];
    
    // Define which types are for social media (need production tips)
    const socialMediaTypes = ['post', 'carrossel', 'reel', 'stories'];

    // ============================================
    // FASE 2: CONSTRUIR SYSTEM PROMPT OTIMIZADO (HIERÁRQUICO)
    // ============================================
    
    // ============================================
    // SYSTEM PROMPT MINIMALISTA + LAYERED
    // ============================================
    
    // LAYER 1: CORE IDENTITY (sempre - ~800 chars)
    let systemPrompt = `Você é um especialista em criação de conteúdo pastoral para redes sociais.

PRINCÍPIOS INEGOCIÁVEIS:
- Cristocentrismo e fidelidade bíblica
- Linguagem clara e acessível (8º ano)
- Respeito à dignidade humana (sem exploração)
- Conteúdo prático e aplicável
- NUNCA invente dados falsos, endereços, telefones, horários ou informações específicas

🚫 PROIBIDO ABSOLUTAMENTE:
- Inventar endereços (ex: "Rua da Fé, 123")
- Inventar telefones (ex: "(XX) 9XXXX-XXXX" ou números genéricos)
- Inventar horários específicos sem contexto (ex: "19h00" sem ser solicitado)
- Inventar frequências falsas (ex: "Todo domingo" sem confirmação)
- Dados genéricos ou placeholders

✅ PERMITIDO:
- Deixar campos como [INSERIR ENDEREÇO] quando não souber
- Sugerir que o usuário preencha informações específicas
- Criar conteúdo estratégico SEM dados factuais inventados

🧠 PENSAMENTO ESTRATÉGICO:
- "3 pontos principais" = UM conteúdo destacando 3 pontos (NÃO 3 posts separados)
- "5 dicas" = UM post listando 5 dicas (NÃO 5 posts)
- "carrossel com 3 pontos" = UM carrossel com múltiplos cards sobre os 3 temas
- Pense na INTENÇÃO do usuário, não interprete literalmente
- Formate o conteúdo apropriadamente para o tipo solicitado

FORMATO DE RESPOSTA:
- Retorne APENAS JSON válido
- Sem texto antes ou depois do JSON
- Siga EXATAMENTE a estrutura solicitada
`;

    // LAYER 2: TYPE-SPECIFIC INSTRUCTIONS (só o essencial)
    const typeInstructions: Record<string, string> = {
      carrossel: `
INSTRUÇÕES CARROSSEL (CRITICAL - READ CAREFULLY):
1. Create 5-8 separate cards/slides for Instagram carousel
2. Each card text = ONE SHORT phrase (10-20 words MAX - NO paragraphs!)
3. Card titles = SHORT and impactful (3-5 words MAX)
4. NO invented data (addresses, phones, times, dates, frequencies)
5. Each card must be visual-ready content (concise, creative, strategic)
6. Use creative Christian messaging
7. Structure: Card 1 = Hook → Cards 2-6 = Key points → Last card = CTA
8. Think INSTAGRAM VISUAL: people scroll fast, text must be SHORT and impactful
9. When user says "3 main points", create ONE carousel with 8+ cards highlighting those 3 points (NOT 3 separate carousels!)

EXAMPLES OF GOOD CARD TEXTS (SHORT - ALWAYS do this):
✅ "Sua fé não depende das circunstâncias"
✅ "Deus tem um plano maior do que você imagina"  
✅ "A tempestade passa, mas Sua presença permanece"
✅ "Você foi criado com propósito divino"

EXAMPLES OF BAD CARD TEXTS (TOO LONG - DON'T DO THIS):
❌ "A dor é inevitável. Perdas, desilusões, doenças... Elas nos atingem e nos deixam sem chão. Você não está sozinho nessa jornada de angústia."
❌ "Jesus nos ensina através de suas ações que devemos sempre buscar a Deus em primeiro lugar"

Each slide MUST have:
- numero_slide: Sequential number
- titulo_slide: Short impactful title (3-5 words)
- conteudo: ONE short phrase (10-20 words MAX)
- imagem_sugerida: Visual description (internal use, NOT shown to user)
- chamada_para_acao: CTA if applicable

PROGRESSION:
- Slide 1: Hook (question or surprising fact)
- Middle slides: Key points with SHORT phrases
- Last slide: Clear CTA

TONE: ${userSpecs.tom ? userSpecs.tom.toUpperCase() : 'Adapt to context'}

🚫 NEVER INVENT: addresses, phones, times, factual data
   - If you need specific info, use [INSERT INFO]

EXAMPLE PERFECT SLIDE:
{
  "numero_slide": 1,
  "titulo_slide": "Você se sente invisível?",
  "conteudo": "Deus te vê. Ele enxerga além das aparências.",
  "imagem_sugerida": "Pessoa sozinha olhando horizonte, luz suave",
  "chamada_para_acao": "Deslize →"
}
`,

      convite: `
INSTRUÇÕES CONVITE (different from CAROUSEL):
1. Invitation is a SINGLE POST format (not a carousel unless user explicitly says "carrossel de convite")
2. ABSOLUTELY NO INVENTED DATA
   - NO fake addresses (❌ "Rua das Flores, 123")
   - NO fake phone numbers (❌ "(11) 98765-4321")
   - NO fake times (❌ "19h")
   - NO fake dates (❌ "Todo domingo")
   - NO fake names (❌ "Pastor João")
3. Use ONLY generic placeholders: [DATA], [HORÁRIO], [LOCAL], [CONTATO], [NOME DO EVENTO]
4. If user provides specific details, use ONLY those exact details
5. Create warm, welcoming, engaging copy
6. Focus on the MESSAGE and FEELING, not on inventing logistics

STRUCTURE:
{
  "convite": {
    "titulo_evento": "Event title (if provided by user) or [NOME DO EVENTO]",
    "data": "[DATA]" unless user specified,
    "horario": "[HORÁRIO]" unless user specified,
    "local": "[LOCAL]" unless user specified,
    "descricao": "Welcoming invitation text focusing on message, not fake data",
    "publico_alvo": "Target audience",
    "como_participar": "How to participate",
    "contato": "[CONTATO]" unless user specified
  }
}
`,

      calendario: `
INSTRUÇÕES CALENDÁRIO (Strategic Weekly Planner):
1. Create a STRATEGIC planner with posts distributed across days
2. NEVER leave calendar empty - ALWAYS generate posts for ALL days
3. For EACH post, specify:
   - Day of week
   - Format (Specific: Reel/Carrossel/Post/Stories)
   - SPECIFIC DETAILED theme (not generic)
   - Strategic pillar (ALCANÇAR, EDIFICAR, PERTENCER, SERVIR)
   - Suggested posting time with justification
   - Post objective
   - DETAILED description explaining EXACTLY what content to create

4. BE EXTREMELY SPECIFIC:
   ❌ BAD: "Segunda: Post sobre oração"
   ✅ GOOD: "Segunda: Carrossel - '5 Verdades sobre Oração que Transformam' - Criar 8 cards com frases curtas destacando: 1) Deus sempre ouve (Salmos 34:17), 2) Oração muda circunstâncias, 3) Persistência é essencial (Lucas 18:1-8), 4) Não há horário errado, 5) Transparência é bem-vinda. Último card com CTA: 'Qual dessas verdades te impacta mais?'"

5. Vary formats and pillars strategically across the week
6. Each post must have clear purpose
7. If based on sermon/theme, create complementary content for each day

EXAMPLE:
{
  "calendario_editorial": {
    "periodo": "Semana de [data] a [data]",
    "objetivo": "Strategic objective for the period",
    "postagens": [
      {
        "dia": "Segunda-feira",
        "horario_sugerido": "18h (hora de pico de engajamento)",
        "formato": "Carrossel",
        "tema": "5 passos para oração eficaz",
        "pilar": "EDIFICAR",
        "versiculo_base": "Mateus 6:5-15",
        "objetivo_do_post": "Ensinar método prático de oração baseado no Pai Nosso, com passo a passo aplicável. Criar 8 cards com instruções claras: 1) Encontre lugar tranquilo, 2) Comece adorando, 3) Confesse pecados, 4) Interceda por outros, 5) Termine em gratidão. Cada card com frase curta e visual atraente."
      }
    ],
    "observacoes": "Strategic observations for the week"
  }
}
`,

      reel: `
INSTRUÇÕES REEL:
1. Crie roteiro DETALHADO com 3-5 cenas${userSpecs.duracao ? ` (total: ${userSpecs.duracao})` : ''}
2. Cada cena DEVE ter:
   - numero: Ordem sequencial
   - duracao: Tempo exato (ex: "0-3s", "3-8s")
   - visual: Descrição específica do que filmar/mostrar
   - audio: Script palavra-por-palavra do que falar
   - texto_overlay: Texto exato para aparecer na tela

3. ESTRUTURA OBRIGATÓRIA:
   - Cena 1 (0-3s): HOOK impactante (pergunta/fato/problema)
   - Cenas 2-4: Desenvolvimento (solução, ensino, exemplo)
   - Última cena: CTA claro (comentar, salvar, compartilhar)

4. LEGENDA: Deve complementar (não repetir) o vídeo

EXEMPLO CENA:
{
  "numero": 1,
  "duracao": "0-3s",
  "visual": "Close no rosto falando direto pra câmera, fundo desfocado",
  "audio": "Você sabia que 78% das pessoas se sentem sozinhas mesmo estando acompanhadas?",
  "texto_overlay": "78% SE SENTEM SOZINHAS"
}
`,

      estudo: `
INSTRUÇÕES ESTUDO BÍBLICO:
1. Contexto histórico/cultural DETALHADO (mínimo 200 caracteres)
2. Mínimo de 3 aplicações práticas CONCRETAS com exemplos reais
3. Perguntas reflexivas profundas (não genéricas)
4. Linguagem pastoral mas acessível

APLICAÇÃO PRÁTICA BOA:
❌ Ruim: "Ore mais esta semana"
✅ Boa: "Escolha um momento fixo (ex: 7h ou 22h) e converse com Deus por 10min sobre uma decisão específica. Anote o que sentiu."
`,

      devocional_semanal: `
INSTRUÇÕES DEVOCIONAL DE 7 DIAS (CRITICAL):
1. Crie EXATAMENTE 7 devocionais completos (um para cada dia da semana)
2. Cada dia DEVE ter TODOS os campos:
   - dia: número sequencial (1-7)
   - titulo: título único e atraente para o dia
   - versiculo_base: versículo completo com referência
   - reflexao: reflexão pastoral PROFUNDA (mínimo 300 caracteres, 3-4 parágrafos)
   - perguntas_pessoais: array com 2-3 perguntas reflexivas
   - oracao: oração sugerida personalizada ao tema do dia
   - desafio_do_dia: desafio prático específico para colocar em ação

3. PROGRESSÃO TEMÁTICA OBRIGATÓRIA:
   - Dia 1: Introdução suave ao tema (contextualização)
   - Dias 2-3: Desenvolvimento inicial (base bíblica)
   - Dias 4-5: Aprofundamento (desafios maiores)
   - Dia 6: Aplicação intensa (transformação)
   - Dia 7: Conclusão com compromisso de transformação contínua

4. VERSÍCULOS: Use versículos DIFERENTES a cada dia (não repita)
5. LINGUAGEM: Pastoral, acessível e pessoal (como um mentor falando)
6. REFLEXÕES: Devem conectar a Palavra com situações reais do dia a dia

ESTRUTURA OBRIGATÓRIA:
{
  "fundamento_biblico": {...},
  "devocional_semanal": {
    "titulo": "Série completa",
    "objetivo_semanal": "Transformação esperada",
    "dias": [7 dias completos],
    "conclusao_semanal": "Fechamento e próximos passos"
  }
}
`,

      conteudo_generico_estruturado: `
INSTRUÇÕES CONTEÚDO GENÉRICO ESTRUTURADO:
1. Este tipo é usado quando o pedido do usuário não corresponde a um formato específico
2. Estruture o conteúdo em blocos claros: introdução, desenvolvimento, aplicação, conclusão
3. Cada bloco deve ter tipo, título e conteúdo substancial
4. Inclua versículos relacionados se o tema for espiritual/bíblico
5. Adicione observacoes_sistema explicando que formatos específicos estão disponíveis
6. Seja completo e útil, mesmo não sendo um formato específico
`
    };
    
    systemPrompt += `\n\n${typeInstructions[detectedType] || typeInstructions.conteudo_generico_estruturado || ''}`;
    
    // LAYER 3: BASE DE ESTUDOS (só para conteúdo bíblico profundo)
    if (['estudo', 'devocional', 'devocional_semanal', 'esboco', 'discipulado'].includes(detectedType)) {
      systemPrompt += `\n\n${STUDY_BASE}`;
    }
    
    systemPrompt += `\n\n`;

    // NÍVEL 6: PREFERÊNCIAS DENOMINACIONAIS (opcional)
    if (denominationalPrefs) {
      systemPrompt += `
ADAPTAÇÃO DENOMINACIONAL:
- Ênfase teológica: ${denominationalPrefs.enfase || 'genérica evangélica'}
- Tradução bíblica: ${denominationalPrefs.traducao || 'NVI'}
- Calendário litúrgico: ${denominationalPrefs.calendario_liturgico ? 'Sim (Advento, Páscoa)' : 'Não'}
`;
    }
    
    systemPrompt += `

TIPO DETECTADO: ${detectedType}

REGRAS IMPORTANTES PARA TIPO "${detectedType}":
1. ${requiresBiblicalFoundation.includes(detectedType)
    ? 'SEMPRE inclua fundamento_biblico completo (versículos com referências, contexto histórico/cultural, princípio atemporal)'
    : 'NÃO inclua fundamento_biblico (este é um formato operacional/estratégico)'}

2. Retorne APENAS os campos necessários para o tipo de conteúdo solicitado

3. ${socialMediaTypes.includes(detectedType)
    ? 'Inclua dica_producao com copywriting, hashtags, melhor_horario e cta específico'
    : 'NÃO inclua dica_producao, hashtags ou orientações de redes sociais'}

4. Seja ${operationalTypes.includes(detectedType) 
    ? 'prático, direto e focado na organização/comunicação' 
    : 'pastoral, prático e biblicamente fundamentado'}

5. Retorne APENAS JSON válido, sem texto adicional antes ou depois

${detectedType === 'resumo_breve' ? `
INSTRUÇÕES ESPECÍFICAS PARA RESUMO BREVE:
- Crie um resumo conciso e impactante com MÁXIMO 500 palavras
- Estrutura: Tema central (1 linha), Mensagem principal (2-3 parágrafos), Aplicação prática (1 parágrafo)
- Estilo: Claro, inspirador, fiel ao conteúdo original
- Foco: Capturar a ESSÊNCIA da pregação, não reescrever tudo
- Tom: Pastoral mas acessível - como se estivesse contando para alguém que não ouviu
` : ''}

${detectedType === 'desafio_semanal' ? `
INSTRUÇÕES ESPECÍFICAS PARA DESAFIO SEMANAL:
- Crie EXATAMENTE 7 dias (Segunda a Domingo)
- Cada ação deve ser específica, mensurável e realista (15-30 minutos máximo)
- Versículos devem progredir em profundidade ao longo da semana
- Dia 1: Introdução leve e motivadora
- Dia 4: Ponto de virada - desafio mais profundo
- Dia 7: Conclusão poderosa com compromisso futuro
- Use linguagem pastoral mas empolgante
- Pense em algo que funcione para todas as idades
` : ''}

${detectedType === 'calendario' ? `
INSTRUÇÕES ESPECÍFICAS PARA CALENDÁRIO:
- Distribua posts ao longo da semana/mês de forma estratégica
- Varie os formatos (carrossel, reel, stories, post)
- Balance os 4 pilares: ALCANÇAR, EDIFICAR, PERTENCER, SERVIR
- Sugira horários baseados em engajamento típico
- Seja específico nos temas, não genérico
` : ''}

${detectedType === 'carrossel' ? `
INSTRUÇÕES ESPECÍFICAS PARA CARROSSEL:
${userSpecs.quantidade ? `- GERE EXATAMENTE ${userSpecs.quantidade} SLIDES. NEM MAIS, NEM MENOS. ISSO É OBRIGATÓRIO.` : '- Crie entre 5-8 slides com progressão lógica'}
- Cada slide deve ter: titulo_slide, conteudo (frase curta de 10-20 palavras MAX - impactante e estratégica), imagem_sugerida, chamada_para_acao
- Slide 1: Hook poderoso que gera curiosidade
- Slides intermediários: Desenvolvimento progressivo com frases CURTAS e DIRETAS
- Último slide: CTA claro e direto
- dica_producao deve incluir: copywriting (como escrever legenda engajante), cta (call-to-action específico), hashtags
- IMPORTANTE: O conteúdo de cada slide será usado para gerar imagens. Textos longos NÃO cabem em imagens. Máximo 20 palavras por slide.

EXEMPLO DE SLIDE (Hook):
{
  "numero_slide": 1,
  "titulo_slide": "Você se sente invisível?",
  "conteudo": "Deus te vê. Ele te escolheu antes de você nascer.",
  "imagem_sugerida": "Pessoa sozinha olhando para o horizonte, luz suave ao entardecer",
  "chamada_para_acao": "Deslize para descobrir →"
}

EXEMPLO DE ÚLTIMO SLIDE (CTA):
{
  "numero_slide": ${userSpecs.quantidade || 8},
  "titulo_slide": "Seu próximo passo",
  "conteudo": "Ore 5 minutos hoje. Deus já te escolheu.",
  "imagem_sugerida": "Mãos abertas ao céu, luz dourada, ambiente esperançoso",
  "chamada_para_acao": "Comente 🙏 se você vai orar hoje"
}
` : ''}

${detectedType === 'estudo' ? `
INSTRUÇÕES ESPECÍFICAS PARA ESTUDO BÍBLICO:
- Contexto histórico/cultural DETALHADO (mínimo 200 caracteres)
- Mínimo de 3 aplicações práticas CONCRETAS (não genéricas)
- Cada ponto de desenvolvimento deve ter: explicação + aplicação + exemplo real
- Linguagem pastoral, não acadêmica demais
- Perguntas reflexivas profundas, não superficiais

EXEMPLO DE APLICAÇÃO PRÁTICA BOA:
"Em vez de apenas 'ore mais', diga: 'Esta semana, escolha um momento fixo (ex: 7h da manhã ou 22h) e converse com Deus por 10 minutos sobre uma decisão específica que você precisa tomar. Anote o que você sentiu.'"
` : ''}

${detectedType === 'devocional' ? `
INSTRUÇÕES ESPECÍFICAS PARA DEVOCIONAL:
- Reflexão em 3-4 parágrafos CONECTANDO Escritura com vida cotidiana
- Use linguagem humana e pastoral (como conversa entre amigos)
- Desafio do dia deve ser ESPECÍFICO e realizável em 15-30 minutos
- Oração sugerida deve ser genuína, não formulaica

EXEMPLO DE REFLEXÃO BOA:
"Você já acordou com aquela sensação de que o dia vai ser pesado demais? Davi também conhecia essa sensação. No Salmo 42, ele fala de uma sede tão profunda que parece que sua alma vai secar. Mas repare: mesmo na angústia, ele não abandona a conversa com Deus. Ele questiona, reclama, mas continua ali..."
` : ''}

${detectedType === 'campanha_tematica' ? `
INSTRUÇÕES ESPECÍFICAS PARA CAMPANHA TEMÁTICA:
- Mínimo de 4 semanas completas com progressão narrativa
- Cada semana deve ter objetivos específicos e formatos variados
- Incluir métricas de acompanhamento para cada fase
- Tom inspirador mas prático - evite jargões
- Forneça exemplos concretos de posts para cada semana
` : ''}

${detectedType === 'treino_voluntario' ? `
INSTRUÇÕES ESPECÍFICAS PARA TREINO DE VOLUNTÁRIO:
- Estrutura modular com teoria + prática
- Exercícios práticos para cada módulo
- Checklist de competências ao final
- Linguagem acessível para iniciantes
- Incluir casos reais e simulações
` : ''}

${['reel', 'stories', 'post'].includes(detectedType) ? `
INSTRUÇÕES PARA REDES SOCIAIS:
- dica_producao OBRIGATÓRIA com:
  * copywriting: Dicas de como escrever legenda envolvente (2-3 frases específicas)
  * hashtags: Lista de 8-12 hashtags relevantes (mix de popular + nicho)
  * melhor_horario: Melhor horário para postar com justificativa
  * cta: Call-to-action específico e claro (não genérico tipo "comente")
` : ''}

ESTRUTURA JSON OBRIGATÓRIA para tipo "${detectedType}":
${selectedStructure}

${prompt.length > 5000 ? `
ATENÇÃO: Esta é uma transcrição longa de pregação. 
- Identifique os principais pontos teológicos
- Extraia versículos-chave mencionados
- Seja completo e detalhado na análise
` : ''}

Retorne APENAS o JSON válido.`;

    console.log('Calling Lovable AI with prompt:', prompt.substring(0, 100));

    // ============================================
    // FASE 1: TOKENS E TEMPERATURA DINÂMICOS
    // ============================================
    
    // Tipos complexos precisam de mais tokens
    const complexTypes = ['campanha_tematica', 'treino_voluntario', 'manual_etica', 'estrategia_social'];
    const deepBiblicalTypes = ['estudo', 'esboco', 'discipulado', 'qa_estruturado'];
    const extendedBiblicalTypes = ['devocional_semanal']; // Tipos que precisam de MUITOS tokens (7 dias)
    const operationalTypesTemp = ['aviso', 'convite', 'versiculos_citados', 'checklist_culto'];
    
    // Ajustar max_tokens baseado em quantidade especificada
    let maxTokens = extendedBiblicalTypes.includes(detectedType)
      ? 12000 // Devocional semanal (7 dias extensos com reflexões longas)
      : complexTypes.includes(detectedType) 
      ? 8000  // Conteúdo complexo/estratégico
      : deepBiblicalTypes.includes(detectedType)
      ? 6000  // Conteúdo bíblico profundo
      : 4000; // Outros tipos
    
    // Se usuário especificou quantidade grande, aumentar tokens
    if (detectedType === 'carrossel' && userSpecs.quantidade && userSpecs.quantidade > 8) {
      maxTokens = 10000;
    }
    
    // ✅ Temperature ajustada para seguir instruções precisas
    const temperature = ['carrossel', 'reel', 'stories', 'calendario'].includes(detectedType)
      ? 0.4   // ✅ Estruturado - segue instruções precisas
      : ['estudo', 'devocional', 'resumo'].includes(detectedType)
      ? 0.6   // ✅ Pastoral - equilibrado
      : operationalTypesTemp.includes(detectedType)
      ? 0.3   // ✅ Operacional - muito preciso
      : 0.5;  // ✅ Default conservador

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
        max_tokens: maxTokens,
        temperature: temperature
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    // Variáveis para tracking de qualidade (declaradas aqui para serem acessíveis no final)
    let depthOk = true;
    let retryCount = 0;

    let generatedContent: Record<string, any>;
    try {
      const rawContent = aiData.choices[0].message.content;
      console.log('Raw AI response (first 500 chars):', rawContent.substring(0, 500));
      console.log('Response length:', rawContent.length);
      
      // Extrair JSON (arrays OU objetos - importante para devocional_semanal que pode retornar array)
      const jsonMatch = rawContent.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (!jsonMatch) {
        console.error('Full raw response:', rawContent);
        throw new Error('Nenhum JSON válido encontrado na resposta da IA');
      }
      
      generatedContent = JSON.parse(jsonMatch[0]);
      
    // ============================================
    // FASE 4: VALIDAÇÃO DE PROFUNDIDADE + RETRY AUTOMÁTICO
    // ============================================
    const contentDepthCheck = (content: any, type: string, specs: any): boolean => {
      // Carrossel: validações completas
      if (type === 'carrossel') {
        const slides = content.carrossel?.slides || content.estrutura_visual?.slides || [];
        
        // ✅ VALIDAÇÃO 1: Quantidade exata se especificado
        if (specs.quantidade && slides.length !== specs.quantidade) {
          console.warn(`❌ Carrossel: esperado ${specs.quantidade} slides, gerado ${slides.length}`);
          return false;
        }
        
        // ✅ VALIDAÇÃO 2: Mínimo 4 slides se não especificado (usuários podem pedir carrosseis curtos)
        if (!specs.quantidade && slides.length < 4) {
          console.warn('❌ Carrossel: menos de 4 slides');
          return false;
        }
        
        // ✅ VALIDAÇÃO 3: Conteúdo no range ideal (agora mais curto para carrosséis visuais: 50-150 chars)
        for (const slide of slides) {
          const conteudoLength = (slide.conteudo || '').length;
          if (conteudoLength < 50 || conteudoLength > 200) {
            console.warn(`❌ Slide ${slide.numero_slide} fora do padrão: ${conteudoLength} chars (ideal: 50-150 para frases curtas)`);
            return false;
          }
        }
        
        // ✅ VALIDAÇÃO 4: Semântica - primeiro slide deve ser hook
        const primeiroSlide = slides[0]?.conteudo || '';
        const isHook = /\?|você|sabia|imagine|já|pense/i.test(primeiroSlide);
        if (!isHook) {
          console.warn('❌ Primeiro slide não é um hook forte');
          return false;
        }
        
        // ✅ VALIDAÇÃO 5: Último slide deve ter CTA
        const ultimoSlide = slides[slides.length - 1];
        if (!ultimoSlide.chamada_para_acao) {
          console.warn('❌ Último slide sem CTA');
          return false;
        }
      }
      
      // Reel: validação de script detalhado
      if (type === 'reel') {
        const cenas = content.roteiro?.cenas || content.estrutura_visual?.cenas || [];
        
        // ✅ Cada cena deve ter script específico
        for (const cena of cenas) {
          if (!cena.audio || cena.audio.length < 30) {
            console.warn(`❌ Cena ${cena.numero} sem script detalhado`);
            return false;
          }
          if (!cena.visual || cena.visual.includes('genérico') || cena.visual.length < 20) {
            console.warn(`❌ Cena ${cena.numero} sem visual específico`);
            return false;
          }
        }
      }
      
      // Estudo: contexto e aplicações com profundidade
      if (type === 'estudo') {
        const contexto = content.fundamento_biblico?.contexto || '';
        const aplicacoes = content.estudo_biblico?.desenvolvimento || [];
        if (contexto.length < 200) {
          console.warn('Estudo raso: contexto < 200 chars');
          return false;
        }
        if (aplicacoes.length < 3) {
          console.warn('Estudo raso: menos de 3 pontos de desenvolvimento');
          return false;
        }
      }
      
      // Campanha: deve ter 4 semanas completas
      if (type === 'campanha_tematica') {
        const semanas = content.campanha?.semanas || [];
        if (semanas.length < 4) {
          console.warn('Campanha rasa: menos de 4 semanas');
          return false;
        }
      }
      
      // Devocional: reflexão substancial
      if (type === 'devocional') {
        const reflexao = content.devocional?.reflexao || '';
        if (reflexao.length < 300) {
          console.warn('Devocional raso: reflexão < 300 chars');
          return false;
        }
      }
      
      // Devocional Semanal: deve ter 7 dias completos
      if (type === 'devocional_semanal') {
        const dias = content.devocional_semanal?.dias || [];
        if (dias.length < 7) {
          console.warn(`❌ Devocional semanal: esperado 7 dias, gerado ${dias.length}`);
          return false;
        }
        // Verificar se cada dia tem reflexão substancial
        for (const dia of dias) {
          if (!dia.reflexao || dia.reflexao.length < 200) {
            console.warn(`❌ Dia ${dia.dia} com reflexão insuficiente (< 200 chars)`);
            return false;
          }
          if (!dia.versiculo_base) {
            console.warn(`❌ Dia ${dia.dia} sem versículo base`);
            return false;
          }
        }
      }
      
      // Treino Voluntário: deve ter mínimo 4 módulos com exercícios práticos
      if (type === 'treino_voluntario') {
        const modulos = content.treino?.modulos || [];
        if (modulos.length < 4) {
          console.warn('Treino raso: menos de 4 módulos');
          return false;
        }
        const hasExercises = modulos.every((m: any) => m.exercicios && m.exercicios.length > 0);
        if (!hasExercises) {
          console.warn('Treino raso: módulos sem exercícios práticos');
          return false;
        }
      }
      
      // Resumo Breve: mensagem principal deve ser substancial
      if (type === 'resumo_breve') {
        const resumo = content.resumo || '';
        if (resumo.length < 200) {
          console.warn('Resumo raso: menos de 200 chars');
          return false;
        }
      }
      
      // Reel: deve ter estrutura completa (hook + desenvolvimento + cta)
      if (type === 'reel') {
        const estrutura = content.estrutura_visual || {};
        if (!estrutura.hook || !estrutura.desenvolvimento || !estrutura.cta) {
          console.warn('Reel raso: estrutura incompleta');
          return false;
        }
      }
      
      return true; // Passou nos checks
    };

    depthOk = contentDepthCheck(generatedContent, detectedType, userSpecs);
    
    // Se conteúdo raso E tipo que deveria ser profundo, fazer retry
    const typesRequiringDepth = [
      'carrossel', 'estudo', 'campanha_tematica', 'devocional', 'devocional_semanal',
      'treino_voluntario', 'resumo_breve', 'reel', 'esboco'
    ];
    
    // ✅ RETRY INTELIGENTE COM FEEDBACK ESPECÍFICO
    const MAX_RETRIES = 2;
    
    const buildRetryFeedback = (content: any, type: string, specs: any) => {
      const problemas = [];
      
      if (type === 'carrossel') {
        const slides = content.carrossel?.slides || content.estrutura_visual?.slides || [];
        
        if (specs.quantidade && slides.length !== specs.quantidade) {
          problemas.push(`ERRO CRÍTICO: Você gerou ${slides.length} slides, mas eu pedi EXATAMENTE ${specs.quantidade}.`);
        }
        
        const slidesLongos = slides.filter((s: any) => (s.conteudo || '').length > 200);
        if (slidesLongos.length > 0) {
          problemas.push(`ERRO: ${slidesLongos.length} slides têm texto muito longo. Máximo 150 caracteres por slide.`);
        }
        
        const slidesCurtos = slides.filter((s: any) => (s.conteudo || '').length < 80);
        if (slidesCurtos.length > 0) {
          problemas.push(`ERRO: ${slidesCurtos.length} slides têm texto muito curto. Mínimo 80 caracteres por slide.`);
        }
        
        if (!slides[slides.length - 1]?.chamada_para_acao) {
          problemas.push(`ERRO: Último slide DEVE ter "chamada_para_acao" específica.`);
        }
        
        const primeiroSlide = slides[0]?.conteudo || '';
        const isHook = /\?|você|sabia|imagine|já|pense/i.test(primeiroSlide);
        if (!isHook) {
          problemas.push(`ERRO: Primeiro slide deve ser um HOOK (pergunta, fato surpreendente, desafio).`);
        }
      }
      
      if (type === 'reel') {
        const cenas = content.roteiro?.cenas || [];
        const cenasProblematicas = cenas.filter((c: any) => !c.audio || c.audio.length < 30);
        if (cenasProblematicas.length > 0) {
          problemas.push(`ERRO: ${cenasProblematicas.length} cenas sem script detalhado. Cada cena precisa de áudio específico (palavra por palavra).`);
        }
      }
      
      if (problemas.length === 0) {
        return 'Refaça o conteúdo seguindo EXATAMENTE as instruções especificadas com mais profundidade e qualidade.';
      }
      
      return `O conteúdo anterior NÃO atende aos requisitos:\n\n${problemas.join('\n')}\n\nREGERE o JSON corrigindo TODOS esses erros. Siga as especificações À RISCA.`;
    };
    
    if (!depthOk && typesRequiringDepth.includes(detectedType) && retryCount < MAX_RETRIES) {
      console.warn(`⚠️ Content too shallow for type ${detectedType}, retrying with specific feedback...`);
      retryCount++;
      
      const feedbackPrompt = buildRetryFeedback(generatedContent, detectedType, userSpecs);
      console.log('📝 Retry feedback:', feedbackPrompt);
      
      const retryResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: processedPrompt },
            { role: 'assistant', content: JSON.stringify(generatedContent) },
            { role: 'user', content: feedbackPrompt }
          ],
          response_format: { type: 'json_object' },
          max_tokens: maxTokens,
          temperature: temperature - 0.1  // ✅ Reduz criatividade no retry
        }),
      });
      
      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        const retryContent = retryData.choices[0].message.content;
        const retryJsonMatch = retryContent.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
        if (retryJsonMatch) {
          const retryGeneratedContent = JSON.parse(retryJsonMatch[0]);
          const retryDepthOk = contentDepthCheck(retryGeneratedContent, detectedType, userSpecs);
          if (retryDepthOk) {
            console.log('✅ Retry successful - content depth improved!');
            generatedContent = retryGeneratedContent;
            depthOk = true;
          } else {
            console.warn('⚠️ Retry still shallow, using original content');
          }
        } else {
          console.error('❌ Retry failed - invalid JSON in response');
        }
      } else {
        console.error('❌ Retry API call failed:', retryResponse.status);
      }
    }

    // ✅ POST-RETRY: Truncar slides excedentes se quantidade foi especificada
    if (detectedType === 'carrossel' && userSpecs.quantidade) {
      const slides = generatedContent.carrossel?.slides || generatedContent.estrutura_visual?.slides || generatedContent.conteudo?.estrutura_visual?.slides || [];
      if (slides.length > userSpecs.quantidade) {
        console.log(`✂️ Truncando carrossel de ${slides.length} para ${userSpecs.quantidade} slides`);
        const truncatedSlides = slides.slice(0, userSpecs.quantidade);
        if (generatedContent.carrossel?.slides) {
          generatedContent.carrossel.slides = truncatedSlides;
        } else if (generatedContent.estrutura_visual?.slides) {
          generatedContent.estrutura_visual.slides = truncatedSlides;
        } else if (generatedContent.conteudo?.estrutura_visual?.slides) {
          generatedContent.conteudo.estrutura_visual.slides = truncatedSlides;
        }
      }
    }
      
    // Validate structure based on content type
    const operationalTypesValidation = [
      'calendario', 'convite', 'aviso', 'guia', 'convite_grupos', 'versiculos_citados', 'ideia_estrategica',
      'treino_voluntario', 'campanha_tematica', 'roteiro_reels', 'checklist_culto', 'kit_basico', 'manual_etica', 'estrategia_social',
      'conteudo_generico_estruturado', 'roteiro_video_completo'
    ];
    
    // Tipos que podem ter estrutura alternativa válida (versículos embutidos nos tópicos)
    const typesWithFlexibleBiblicalFoundation = ['estudo', 'resumo', 'resumo_breve'];
    
    const requiresBiblicalFoundationValidation = !operationalTypesValidation.includes(detectedType) && 
                                                  !typesWithFlexibleBiblicalFoundation.includes(detectedType);
    
    // Only require fundamento_biblico for content that strictly needs it
    // Para conteudo_generico_estruturado, verificar se a estrutura interna existe
    const hasBiblicalFoundation = generatedContent.fundamento_biblico || 
      generatedContent.conteudo_generico_estruturado?.versiculos_relacionados ||
      generatedContent.conteudo_generico_estruturado?.blocos;
    
    if (requiresBiblicalFoundationValidation && !hasBiblicalFoundation) {
      console.error('Invalid structure:', generatedContent);
      throw new Error('IA retornou estrutura incompleta - falta fundamento_biblico');
    }

    // Validate structure based on type - com validações flexíveis para estudo
    const validateEstudo = () => {
      // Aceita estrutura tradicional OU estrutura alternativa com tópicos
      return generatedContent.estudo_biblico || 
             (generatedContent.titulo && generatedContent.topicos_principais) ||
             (generatedContent.titulo && generatedContent.introducao && generatedContent.conclusao);
    };
    
    const hasCorrectStructure = 
      (detectedType === 'calendario' && generatedContent.calendario_editorial) ||
      (detectedType === 'convite' && generatedContent.convite) ||
      (detectedType === 'aviso' && generatedContent.aviso) ||
      (detectedType === 'guia' && generatedContent.guia) ||
      (detectedType === 'convite_grupos' && generatedContent.convite_grupos) ||
      (detectedType === 'versiculos_citados' && generatedContent.versiculos_citados) ||
      (detectedType === 'esboco' && generatedContent.esboco) ||
      (detectedType === 'trilha_oracao' && generatedContent.trilha_oracao) ||
      (detectedType === 'qa_estruturado' && generatedContent.perguntas_respostas) ||
      (detectedType === 'discipulado' && generatedContent.plano_discipulado) ||
      (detectedType === 'desafio_semanal' && (generatedContent.desafio_semanal?.dias?.length >= 5 || generatedContent.desafio)) ||
      (detectedType === 'ideia_estrategica' && generatedContent.ideia_estrategica) ||
      (detectedType === 'estudo' && validateEstudo()) ||
      (detectedType === 'resumo' && (generatedContent.resumo_pregacao || generatedContent.resumo)) ||
      (detectedType === 'resumo_breve' && generatedContent.resumo) ||
      (detectedType === 'perguntas' && generatedContent.perguntas_celula) ||
      (detectedType === 'devocional' && generatedContent.devocional) ||
      (detectedType === 'devocional_semanal' && generatedContent.devocional_semanal?.dias?.length >= 5) ||
      (detectedType === 'stories' && (generatedContent.stories?.slides || generatedContent.stories)) ||
      (detectedType === 'treino_voluntario' && generatedContent.treino) ||
      (detectedType === 'campanha_tematica' && generatedContent.campanha) ||
      (detectedType === 'roteiro_reels' && generatedContent.roteiro) ||
      (detectedType === 'checklist_culto' && generatedContent.checklist) ||
      (detectedType === 'kit_basico' && generatedContent.kit) ||
      (detectedType === 'manual_etica' && generatedContent.manual) ||
      (detectedType === 'estrategia_social' && generatedContent.estrategia) ||
      (detectedType === 'roteiro_video' && (generatedContent.roteiro_video || generatedContent.roteiro || generatedContent.conteudo?.roteiro_video)) ||
      (detectedType === 'roteiro_video_completo' && (generatedContent.roteiro_video_completo || generatedContent.roteiro_video || generatedContent.roteiro || generatedContent.ideia_estrategica || generatedContent.conteudo)) ||
      (detectedType === 'conteudo_generico_estruturado' && generatedContent.conteudo_generico_estruturado) ||
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

    // ============================================
    // GERAR TÍTULO DESCRITIVO
    // ============================================
    let generatedTitle = "Conteúdo Gerado";
    
    try {
      // Create contextual title based on content type and actual generated content
      const contentPreview = JSON.stringify(generatedContent).substring(0, 150);
      
      // Extrair tema do conteúdo gerado - com fallbacks robustos para cada tipo
      let temaExtraido = "";
      if (detectedType === 'carrossel' && generatedContent.estrutura_visual?.slides?.[0]) {
        temaExtraido = generatedContent.estrutura_visual.slides[0].titulo || "";
      } else if (detectedType === 'stories' && generatedContent.stories?.slides?.[0]) {
        temaExtraido = generatedContent.stories.slides[0].titulo || "";
      } else if (detectedType === 'devocional' && generatedContent.devocional?.titulo) {
        temaExtraido = generatedContent.devocional.titulo;
      } else if (detectedType === 'estudo') {
        // Múltiplos fallbacks para estudo
        temaExtraido = 
          generatedContent.titulo ||
          generatedContent.estudo_biblico?.titulo ||
          generatedContent.topicos_principais?.[0]?.titulo ||
          generatedContent.topicos?.[0]?.titulo ||
          generatedContent.introducao?.substring?.(0, 50) ||
          generatedContent.fundamento_biblico?.versiculos?.[0]?.referencia ||
          "";
      } else if (detectedType === 'resumo' || detectedType === 'resumo_breve') {
        temaExtraido = 
          generatedContent.titulo ||
          generatedContent.resumo?.titulo ||
          generatedContent.tema_principal ||
          "";
      } else if (generatedContent.titulo) {
        // Fallback genérico: usar título se existir
        temaExtraido = generatedContent.titulo;
      }
      
      const titlePrompt = `Create a short, descriptive title (max 50 chars) in Portuguese for this ${detectedType}:

User request: ${prompt.substring(0, 100)}
Theme extracted: ${temaExtraido}
Content preview: ${contentPreview}

Rules:
- NEVER use generic titles like "Conteúdo Gerado"
- Use the actual theme/topic from the content
- For carrossel: "Carrossel: [tema específico]"
- For stories: "Stories: [tema específico]"  
- For devocional: "Devocional: [tema]"
- For posts: "[tema] - Post"
- Be specific and descriptive
- Max 50 characters
- Return ONLY the title, no quotes

Title:`;
      
      const titleResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: titlePrompt }],
          temperature: 0.7,
          max_tokens: 60
        })
      });

      if (titleResponse.ok) {
        const titleData = await titleResponse.json();
        const rawTitle = titleData.choices[0]?.message?.content?.trim() || "";
        
        // Clean up title (remove quotes, extra text)
        generatedTitle = rawTitle
          .replace(/^["']|["']$/g, '')
          .replace(/^Título:\s*/i, '')
          .replace(/^Title:\s*/i, '')
          .substring(0, 50)
          .trim() || `${detectedType} - ${new Date().toLocaleDateString('pt-BR')}`;
      } else {
        // Fallback: create title from content type + date
        generatedTitle = `${detectedType} - ${new Date().toLocaleDateString('pt-BR')}`;
      }
      
    } catch (titleError) {
      console.error("Error generating title:", titleError);
      // Fallback: create title from content type + date
      generatedTitle = `${detectedType} - ${new Date().toLocaleDateString('pt-BR')}`;
    }

    // Salvar na tabela unificada: content_library
    const { data: savedContent, error: saveError } = await supabase
      .from('content_library')
      .insert({
        user_id: user.id,
        source_type: 'ai-creator',
        content_type: detectedType,
        pilar: detectedPilar, // Pilar detectado dinamicamente baseado no contexto
        prompt_original: prompt.replace(/^TIPO_SOLICITADO:\s*\w+\s*/i, '').trim(),
        title: generatedTitle,
        content: generatedContent,
        status: 'draft'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving content:', saveError);
      throw saveError;
    }

    console.log('Content saved successfully with id:', savedContent.id);

    // ============================================
    // FASE 5: LOGGING DE QUALIDADE
    // ============================================
    const qualityMetrics = {
      content_id: savedContent.id,
      detected_type: detectedType,
      tokens_system_estimated: Math.round(systemPrompt.length / 4),
      tokens_response_estimated: Math.round(JSON.stringify(generatedContent).length / 4),
      temperature_used: temperature,
      max_tokens_used: maxTokens,
      depth_check_passed: depthOk,
      retry_needed: retryCount > 0,
      retry_successful: retryCount > 0 && depthOk,
      prompt_length: processedPrompt.length,
      is_long_transcript: prompt.length > 5000,
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 QUALITY_METRICS:', JSON.stringify(qualityMetrics, null, 2));
    
    // Log de qualidade resumido para análise rápida
    if (!depthOk) {
      console.warn(`⚠️ SHALLOW_CONTENT: ${detectedType} - depth check failed${retryCount > 0 ? ' even after retry' : ''}`);
    } else if (retryCount > 0) {
      console.log(`✅ DEPTH_IMPROVED: ${detectedType} - retry successful`);
    }

    return new Response(JSON.stringify({ 
      success: true,
      content_id: savedContent.id,
      content: generatedContent,
      _metrics: qualityMetrics // Para debugging
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
