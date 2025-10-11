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

    // ============================================
    // FASE 4: VALIDAÇÃO ÉTICA - POLÍTICA DE RECUSA
    // ============================================
    const ethicalValidation = (text: string): { allowed: boolean; reason?: string } => {
      const lowerText = text.toLowerCase();
      
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
          pattern: /(político|eleição|candidato|partido|voto em)/i,
          reason: 'Proselitismo político-partidário (contra princípios do mentor).'
        },
        {
          pattern: /(baixar|download|piratear|usar).*(música|imagem|vídeo).*(sem|gratuito|de graça)/i,
          reason: 'Violação de direitos autorais (antiplágio e Lei 9610).'
        }
      ];
      
      for (const flag of redFlags) {
        if (flag.pattern.test(text)) {
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
      // COMANDOS ESPECIAIS (prioridade máxima)
      treino_voluntario: /\/treino-voluntário|treino de voluntário|onboarding mídia/i,
      campanha_tematica: /\/campanha-temática|série de conteúdo|planejamento série/i,
      roteiro_reels: /\/roteiro-reels|script reels|roteiro curto/i,
      checklist_culto: /\/checklist-culto|checklist culto|pré culto/i,
      kit_basico: /\/kit-básico|mídia com celular|setup mínimo/i,
      manual_etica: /\/manual-ética|guia ética|proteção imagem/i,
      estrategia_social: /\/estratégia-social|plano instagram|estratégia redes/i,
      
      // Resumo breve (for sermon summaries)
      resumo_breve: /resumo_breve|resumo breve/i,
      // FORMATOS DE CONTEÚDO (PRIORIDADE ALTA)
      carrossel: /carrossel|slides|cards/i,
      reel: /reel|vídeo(?!\s+para)|roteiro|script/i,
      stories: /stories|story|storys/i,
      // Organizational formats
      calendario: /calendário|cronograma|planejamento|plano editorial|grade de posts/i,
      aviso: /aviso|comunicado|lembrete|atenção/i,
      guia: /guia|manual|passo a passo|tutorial/i,
      esboco: /esboço|outline|tópicos|estrutura/i,
      versiculos_citados: /versículos citados|referências bíblicas|passagens mencionadas/i,
      trilha_oracao: /trilha de oração|roteiro de oração|guia de intercessão/i,
      qa_estruturado: /perguntas e respostas|q&a|dúvidas frequentes|faq/i,
      convite_grupos: /convite para grupo|chamado para célula|junte-se ao|entre no grupo/i,
      discipulado: /discipulado|mentoria|acompanhamento espiritual/i,
      // Biblical/creative formats
      desafio_semanal: /desafio|challenge|compromisso semanal|missão|jornada/i,
      estudo: /estudo|estudo bíblico|análise bíblica|exegese/i,
      resumo: /resumo|resumir|sintetize|principais pontos|síntese/i,
      devocional: /devocional|meditação|reflexão diária/i,
      perguntas: /perguntas|questões|discussão|célula/i,
      post: /post|publicação|legenda/i,
      ideia_estrategica: /ideia|viral|campanha|estratégia|plano de conteúdo|série/i,
      // TIPOS DE EVENTO (PRIORIDADE BAIXA - verificar por último)
      convite: /\b(convite|convidar|chamado para|venha para)\b(?!\s+para\s+grupo)/i
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
}`
    };

    const selectedStructure = structureByType[detectedType] || structureByType.post;

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
      'estudo', 'resumo', 'devocional', 'desafio_semanal',
      'perguntas', 'esboco', 'trilha_oracao', 'qa_estruturado', 'discipulado'
    ];
    
    // Define which types are for social media (need production tips)
    const socialMediaTypes = ['post', 'carrossel', 'reel', 'stories'];

    // ============================================
    // FASE 2: CONSTRUIR SYSTEM PROMPT DINÂMICO
    // ============================================
    
    const systemPrompt = `${mentorContext}

${CORE_PRINCIPLES}

${CONTENT_METHOD}

${PILLAR_DISTRIBUTION}

${requiresBiblicalFoundation.includes(detectedType) ? STUDY_BASE : ''}

${denominationalPrefs ? `
ADAPTAÇÃO DENOMINACIONAL:
- Ênfase teológica: ${denominationalPrefs.enfase || 'genérica evangélica'}
- Tradução bíblica: ${denominationalPrefs.traducao || 'NVI'}
- Calendário litúrgico: ${denominationalPrefs.calendario_liturgico ? 'Sim (Advento, Páscoa)' : 'Não'}
` : ''}

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
- Crie EXATAMENTE 8-10 slides com progressão lógica
- Cada slide deve ter: titulo_slide, conteudo, imagem_sugerida, chamada_para_acao
- Slide 1: Hook poderoso
- Slides 2-8: Desenvolvimento progressivo
- Último slide: CTA claro e direto
- dica_producao deve incluir: copywriting (como escrever legenda engajante), cta (call-to-action específico), hashtags
` : ''}

${['reel', 'stories', 'post'].includes(detectedType) ? `
INSTRUÇÕES PARA REDES SOCIAIS:
- dica_producao OBRIGATÓRIA com:
  * copywriting: Dicas de como escrever legenda envolvente
  * hashtags: Lista de hashtags relevantes
  * melhor_horario: Melhor horário para postar
  * cta: Call-to-action específico e claro
` : ''}

ESTRUTURA JSON OBRIGATÓRIA para tipo "${detectedType}":
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
      
    // Validate structure based on content type
    const operationalTypesValidation = [
      'calendario', 'convite', 'aviso', 'guia', 'convite_grupos', 'versiculos_citados', 'ideia_estrategica',
      'treino_voluntario', 'campanha_tematica', 'roteiro_reels', 'checklist_culto', 'kit_basico', 'manual_etica', 'estrategia_social'
    ];
    const requiresBiblicalFoundationValidation = !operationalTypesValidation.includes(detectedType);
    
    // Only require fundamento_biblico for biblical/spiritual content
    if (requiresBiblicalFoundationValidation && !generatedContent.fundamento_biblico) {
      console.error('Invalid structure:', generatedContent);
      throw new Error('IA retornou estrutura incompleta - falta fundamento_biblico');
    }

    // Validate structure based on type
    const hasCorrectStructure = 
      (detectedType === 'calendario' && generatedContent.calendario_editorial) ||
      (detectedType === 'convite' && generatedContent.convite) ||
      (detectedType === 'aviso' && generatedContent.aviso) ||
      (detectedType === 'guia' && generatedContent.guia) ||
      (detectedType === 'convite_grupos' && generatedContent.convite_grupos) ||
      (detectedType === 'versiculos_citados' && generatedContent.versiculos_citados) ||
      (detectedType === 'esboco' && generatedContent.fundamento_biblico && generatedContent.esboco) ||
      (detectedType === 'trilha_oracao' && generatedContent.fundamento_biblico && generatedContent.trilha_oracao) ||
      (detectedType === 'qa_estruturado' && generatedContent.fundamento_biblico && generatedContent.perguntas_respostas) ||
      (detectedType === 'discipulado' && generatedContent.fundamento_biblico && generatedContent.plano_discipulado) ||
      (detectedType === 'desafio_semanal' && generatedContent.fundamento_biblico && generatedContent.desafio_semanal?.dias?.length === 7) ||
      (detectedType === 'ideia_estrategica' && generatedContent.ideia_estrategica) ||
      (detectedType === 'estudo' && generatedContent.estudo_biblico) ||
      (detectedType === 'resumo' && generatedContent.resumo_pregacao) ||
      (detectedType === 'perguntas' && generatedContent.perguntas_celula) ||
      (detectedType === 'devocional' && generatedContent.devocional) ||
      (detectedType === 'stories' && generatedContent.stories) ||
      (detectedType === 'treino_voluntario' && generatedContent.treino) ||
      (detectedType === 'campanha_tematica' && generatedContent.campanha) ||
      (detectedType === 'roteiro_reels' && generatedContent.roteiro) ||
      (detectedType === 'checklist_culto' && generatedContent.checklist) ||
      (detectedType === 'kit_basico' && generatedContent.kit) ||
      (detectedType === 'manual_etica' && generatedContent.manual) ||
      (detectedType === 'estrategia_social' && generatedContent.estrategia) ||
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

    // Salvar na tabela unificada: content_library
    const { data: savedContent, error: saveError } = await supabase
      .from('content_library')
      .insert({
        user_id: user.id,
        source_type: 'ai-creator',
        content_type: detectedType, // tipo de conteúdo (estudo, post, etc)
        pilar: 'EDIFICAR', // Uppercase para consistência com constraints
        prompt_original: prompt.replace(/^TIPO_SOLICITADO:\s*\w+\s*/i, '').trim(),
        title: generatedContent.title || 'Conteúdo Gerado',
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
