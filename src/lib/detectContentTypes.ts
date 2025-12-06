/**
 * MÓDULO DE DETECÇÃO DE TIPOS DE CONTEÚDO
 * 
 * Versão simplificada e autocontida para evitar problemas de importação circular.
 * Implementa detecção de tipos sem dependências externas.
 */

// ============================================
// TIPOS
// ============================================

export type ContentType = string;

export type ContentCategory = 
  | 'social' | 'biblico' | 'engajamento' 
  | 'educacional' | 'operacional' | 'video' | 'generico';

export type ContentPillar = 'EDIFICAR' | 'ALCANÇAR' | 'PERTENCER' | 'SERVIR' | 'EXALTAR' | 'ENVIAR';

export interface ContentTypeDefinition {
  type: string;
  name: string;
  category: ContentCategory;
  defaultPillar: ContentPillar;
  synonyms: string[];
  requiresBiblicalFoundation: boolean;
  requiresProductionTips: boolean;
  description: string;
}

// ============================================
// LISTA CANÔNICA DE TIPOS (34+ tipos)
// ============================================

export const CONTENT_TYPE_DEFINITIONS: ContentTypeDefinition[] = [
// VÍDEO UNIFICADO (PRIORIDADE MÁXIMA)
  { type: 'roteiro_video_completo', name: 'Roteiro de Vídeo Completo', category: 'video', defaultPillar: 'ALCANÇAR', synonyms: ['roteiro de vídeo', 'roteiro video', 'roteiro de reel', 'roteiro reels', 'video sobre', 'reels sobre', 'ideia para video', 'script de video', 'gravar video', 'conteúdo em vídeo', 'vídeo para instagram', 'ideia de video', 'ideia de reel', 'video de', 'reel de', 'reel sobre', 'roteiro para video', 'roteiro para reel'], requiresBiblicalFoundation: true, requiresProductionTips: true, description: 'Roteiro completo com estratégia, implementação e métricas' },

  // SOCIAL
  { type: 'post', name: 'Post Simples', category: 'social', defaultPillar: 'EDIFICAR', synonyms: ['post', 'post simples', 'publicação', 'legenda'], requiresBiblicalFoundation: true, requiresProductionTips: true, description: 'Post de texto' },
  { type: 'foto_post', name: 'Post com Foto', category: 'social', defaultPillar: 'ALCANÇAR', synonyms: ['foto post', 'post com foto'], requiresBiblicalFoundation: false, requiresProductionTips: true, description: 'Post com imagem' },
  { type: 'carrossel', name: 'Carrossel', category: 'social', defaultPillar: 'EDIFICAR', synonyms: ['carrossel', 'carousel', 'slides', 'páginas'], requiresBiblicalFoundation: true, requiresProductionTips: true, description: 'Sequência de slides' },
  { type: 'stories', name: 'Stories', category: 'social', defaultPillar: 'ALCANÇAR', synonyms: ['stories', 'story'], requiresBiblicalFoundation: false, requiresProductionTips: true, description: 'Stories Instagram' },
  { type: 'convite', name: 'Convite', category: 'social', defaultPillar: 'ALCANÇAR', synonyms: ['convite', 'venha para'], requiresBiblicalFoundation: false, requiresProductionTips: false, description: 'Convite para eventos' },
  { type: 'aviso', name: 'Aviso/Comunicado', category: 'operacional', defaultPillar: 'SERVIR', synonyms: ['aviso', 'comunicado', 'lembrete'], requiresBiblicalFoundation: false, requiresProductionTips: false, description: 'Comunicado' },
  
  // BÍBLICO
  { type: 'devocional', name: 'Devocional', category: 'biblico', defaultPillar: 'EXALTAR', synonyms: ['devocional', 'meditação', 'reflexão'], requiresBiblicalFoundation: true, requiresProductionTips: false, description: 'Devocional diário' },
  { type: 'devocional_semanal', name: 'Devocional Semanal', category: 'biblico', defaultPillar: 'EXALTAR', synonyms: ['devocional semanal', 'devocional de 7 dias', 'devocional 7 dias'], requiresBiblicalFoundation: true, requiresProductionTips: false, description: 'Série de 7 devocionais' },
  { type: 'estudo', name: 'Estudo Bíblico', category: 'biblico', defaultPillar: 'EDIFICAR', synonyms: ['estudo', 'estudo bíblico', 'exegese'], requiresBiblicalFoundation: true, requiresProductionTips: false, description: 'Estudo aprofundado' },
  { type: 'esboco', name: 'Esboço de Pregação', category: 'biblico', defaultPillar: 'EDIFICAR', synonyms: ['esboço', 'esboco', 'outline'], requiresBiblicalFoundation: true, requiresProductionTips: false, description: 'Estrutura de sermão' },
  { type: 'resumo', name: 'Resumo de Pregação', category: 'biblico', defaultPillar: 'EDIFICAR', synonyms: ['resumo', 'síntese', 'principais pontos'], requiresBiblicalFoundation: true, requiresProductionTips: false, description: 'Resumo de pregação' },
  { type: 'resumo_breve', name: 'Resumo Breve', category: 'biblico', defaultPillar: 'EDIFICAR', synonyms: ['resumo breve', 'resumo curto'], requiresBiblicalFoundation: false, requiresProductionTips: false, description: 'Resumo curto' },
  { type: 'versiculos_citados', name: 'Versículos Citados', category: 'biblico', defaultPillar: 'EDIFICAR', synonyms: ['versículos citados', 'referências bíblicas'], requiresBiblicalFoundation: false, requiresProductionTips: false, description: 'Lista de versículos' },
  { type: 'trilha_oracao', name: 'Trilha de Oração', category: 'biblico', defaultPillar: 'EXALTAR', synonyms: ['trilha de oração', 'roteiro de oração'], requiresBiblicalFoundation: true, requiresProductionTips: false, description: 'Roteiro de oração' },
  
  // ENGAJAMENTO
  { type: 'desafio_semanal', name: 'Desafio Semanal', category: 'engajamento', defaultPillar: 'ENVIAR', synonyms: ['desafio', 'desafio semanal', 'challenge'], requiresBiblicalFoundation: true, requiresProductionTips: false, description: 'Desafio de 7 dias' },
  { type: 'campanha_tematica', name: 'Campanha Temática', category: 'engajamento', defaultPillar: 'ENVIAR', synonyms: ['campanha', 'campanha temática'], requiresBiblicalFoundation: false, requiresProductionTips: false, description: 'Campanha de 4 semanas' },
  { type: 'ideia_estrategica', name: 'Ideia Estratégica', category: 'engajamento', defaultPillar: 'ENVIAR', synonyms: ['ideia', 'ideia estratégica', 'viral'], requiresBiblicalFoundation: true, requiresProductionTips: false, description: 'Ideia criativa' },
  { type: 'perguntas', name: 'Perguntas para Célula', category: 'engajamento', defaultPillar: 'EDIFICAR', synonyms: ['perguntas', 'questões', 'célula'], requiresBiblicalFoundation: true, requiresProductionTips: false, description: 'Perguntas reflexivas' },
  
  // EDUCACIONAL
  { type: 'guia', name: 'Guia Prático', category: 'educacional', defaultPillar: 'EDIFICAR', synonyms: ['guia', 'manual', 'tutorial'], requiresBiblicalFoundation: false, requiresProductionTips: false, description: 'Material educativo' },
  { type: 'discipulado', name: 'Plano de Discipulado', category: 'educacional', defaultPillar: 'EDIFICAR', synonyms: ['discipulado', 'mentoria'], requiresBiblicalFoundation: true, requiresProductionTips: false, description: 'Plano de discipulado' },
  { type: 'qa_estruturado', name: 'Perguntas e Respostas', category: 'educacional', defaultPillar: 'EDIFICAR', synonyms: ['perguntas e respostas', 'q&a', 'faq'], requiresBiblicalFoundation: true, requiresProductionTips: false, description: 'Q&A estruturado' },
  { type: 'treino_voluntario', name: 'Treino de Voluntário', category: 'educacional', defaultPillar: 'SERVIR', synonyms: ['treino de voluntário', 'onboarding', 'treinamento de equipe', 'treinamento mídia', 'treinamento para equipe de mídia', 'treinamento de voluntários', 'capacitação de equipe', 'treinamento equipe'], requiresBiblicalFoundation: false, requiresProductionTips: false, description: 'Material para voluntários' },
  { type: 'manual_etica', name: 'Manual de Ética', category: 'educacional', defaultPillar: 'SERVIR', synonyms: ['manual ética', 'guia ética'], requiresBiblicalFoundation: false, requiresProductionTips: false, description: 'Guia de ética' },
  { type: 'kit_basico', name: 'Kit Básico de Mídia', category: 'educacional', defaultPillar: 'SERVIR', synonyms: ['kit básico', 'mídia com celular', 'kit de boas-vindas', 'kit boas vindas', 'kit para novos convertidos', 'kit novos membros'], requiresBiblicalFoundation: false, requiresProductionTips: false, description: 'Lista de equipamentos' },
  
  // OPERACIONAL
  { type: 'calendario', name: 'Calendário Editorial', category: 'operacional', defaultPillar: 'SERVIR', synonyms: ['calendário', 'cronograma', 'planner'], requiresBiblicalFoundation: false, requiresProductionTips: false, description: 'Planejamento editorial' },
  { type: 'convite_grupos', name: 'Convite para Grupos', category: 'operacional', defaultPillar: 'PERTENCER', synonyms: ['convite para grupo', 'chamado para célula'], requiresBiblicalFoundation: false, requiresProductionTips: false, description: 'Convite para células' },
  { type: 'checklist_culto', name: 'Checklist do Culto', category: 'operacional', defaultPillar: 'SERVIR', synonyms: ['checklist culto', 'pré culto'], requiresBiblicalFoundation: false, requiresProductionTips: false, description: 'Checklist operacional' },
  { type: 'estrategia_social', name: 'Estratégia Social', category: 'operacional', defaultPillar: 'SERVIR', synonyms: ['estratégia social', 'plano instagram', 'estratégia de redes sociais', 'plano de redes sociais', 'estratégia para redes', 'estratégia para a igreja'], requiresBiblicalFoundation: false, requiresProductionTips: false, description: 'Plano para redes' },
  
  // VÍDEO (tipos legados redirecionam para roteiro_video_completo)
  // roteiro_video e roteiro_reels foram unificados em roteiro_video_completo
  
  // GENÉRICO (fallback)
  { type: 'conteudo_generico_estruturado', name: 'Conteúdo Estruturado', category: 'generico', defaultPillar: 'EDIFICAR', synonyms: [], requiresBiblicalFoundation: false, requiresProductionTips: false, description: 'Conteúdo genérico' },
];

// ============================================
// MAPA DE SINÔNIMOS PARA LOOKUP RÁPIDO
// ============================================

export const SYNONYM_MAP: Record<string, string> = CONTENT_TYPE_DEFINITIONS.reduce((acc, def) => {
  acc[def.type.toLowerCase()] = def.type;
  def.synonyms.forEach((syn) => {
    acc[syn.toLowerCase().trim()] = def.type;
  });
  return acc;
}, {} as Record<string, string>);

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getTypeDefinition(type: string): ContentTypeDefinition | undefined {
  return CONTENT_TYPE_DEFINITIONS.find(def => def.type === type);
}

export function getTypesByCategory(category: ContentCategory): ContentTypeDefinition[] {
  return CONTENT_TYPE_DEFINITIONS.filter(def => def.category === category);
}

export function requiresBiblicalFoundation(type: string): boolean {
  const def = getTypeDefinition(type);
  return def?.requiresBiblicalFoundation ?? false;
}

export function getDefaultPillar(type: string): ContentPillar {
  const def = getTypeDefinition(type);
  return def?.defaultPillar ?? 'EDIFICAR';
}

export const ALL_CONTENT_TYPES: string[] = CONTENT_TYPE_DEFINITIONS.map(def => def.type);

export function isValidContentType(value: string): boolean {
  return ALL_CONTENT_TYPES.includes(value);
}

export const isContentType = isValidContentType;

// ============================================
// PADRÕES REGEX POR TIPO
// ============================================

interface TypePattern {
  type: string;
  patterns: RegExp[];
  priority: number;
}

const TYPE_PATTERNS: TypePattern[] = [
  // PRIORIDADE 0: VÍDEO UNIFICADO (captura TODAS as variações de vídeo/reels)
  { type: 'roteiro_video_completo', patterns: [
    /roteiro\s*(de\s*)?(v[ií]deo|reels?)/i,
    /v[ií]deo\s*(sobre|de|para|com)\s/i,
    /reels?\s*(sobre|de|para|com)\s/i,
    /ideia\s*(de\s*|para\s*)?(v[ií]deo|reels?)/i,
    /script\s*(de\s*)?(v[ií]deo|reels?)/i,
    /gravar\s*(um\s*)?(v[ií]deo|reels?)/i,
    /conte[uú]do\s*(em\s*)?v[ií]deo/i,
    /v[ií]deo\s+\w+/i,  // "video testemunho", "video comunhão"
    /\breels?\b.*\b(sobre|tema|assunto)\b/i,
  ], priority: 0 },

  // PRIORIDADE 1: Muito específicos
  { type: 'treino_voluntario', patterns: [
    /treino\s*(de\s*)?volunt[aá]rio/i, 
    /onboarding\s*m[ií]dia/i,
    /treinamento\s*(para\s*)?(equipe\s*)?(de\s*)?m[ií]dia/i,
    /capacita[cç][aã]o\s*(de\s*)?(equipe|volunt[aá]rios?)/i,
    /treinamento\s*(de\s*)?volunt[aá]rios?/i,
    /treinamento\s*(para\s*)?equipe/i
  ], priority: 1 },
  { type: 'campanha_tematica', patterns: [/campanha[-\s]?tem[aá]tica/i, /s[eé]rie\s*de\s*conte[uú]do/i], priority: 1 },
  { type: 'checklist_culto', patterns: [/checklist\s*(para\s*)?(equipe\s*)?(do\s*)?culto/i, /checklist.*culto/i, /pr[eé][-\s]?culto/i], priority: 1 },
  { type: 'kit_basico', patterns: [
    /kit\s*b[aá]sico/i, 
    /m[ií]dia\s*com\s*celular/i,
    /kit\s*(de\s*)?boas[-\s]?vindas/i,
    /kit\s*(para\s*)?(novos\s*)?convertidos/i,
    /kit\s*(de\s*)?novos\s*membros/i
  ], priority: 1 },
  { type: 'manual_etica', patterns: [/manual\s*[-\s]?[eé]tica/i, /guia\s*[eé]tica/i], priority: 1 },
  { type: 'estrategia_social', patterns: [
    /estrat[eé]gia[-\s]?social/i, 
    /plano\s*instagram/i,
    /estrat[eé]gia\s*(de\s*)?(redes\s*)?sociais?/i,
    /estrat[eé]gia\s*(para\s*)?redes/i,
    /plano\s*(de\s*)?redes\s*sociais?/i,
    /estrat[eé]gia\s*(para\s*)?(a\s*)?igreja/i
  ], priority: 1 },

  // PRIORIDADE 2: Específicos com múltiplas palavras
  { type: 'devocional_semanal', patterns: [/devocional\s*(de\s*)?(7|sete|\d+)\s*dias?/i, /devocionais?\s+semanais?/i, /devocional\s+semanal/i], priority: 2 },
  { type: 'desafio_semanal', patterns: [/desafio\s*(semanal|de\s*7\s*dias)/i, /7\s*dias\s*de/i], priority: 2 },
  { type: 'versiculos_citados', patterns: [/vers[ií]culos\s*citados/i, /refer[eê]ncias\s*b[ií]blicas/i], priority: 2 },
  { type: 'trilha_oracao', patterns: [/trilha\s*(de\s*)?ora[cç][aã]o/i, /roteiro\s*(de\s*)?ora[cç][aã]o/i], priority: 2 },
  { type: 'qa_estruturado', patterns: [/perguntas\s*e\s*respostas/i, /q\s*&\s*a/i, /faq/i], priority: 2 },
  { type: 'convite_grupos', patterns: [/convite\s*(para\s*)?grupo/i, /chamado\s*(para\s*)?c[eé]lula/i], priority: 2 },
  { type: 'resumo_breve', patterns: [/resumo\s*breve/i, /resumo\s*curto/i], priority: 2 },
  { type: 'estudo', patterns: [/estudo\s*b[ií]blico/i, /an[aá]lise\s*b[ií]blica/i, /exegese/i], priority: 2 },
  { type: 'ideia_estrategica', patterns: [/ideia\s*estrat[eé]gica/i, /plano\s*de\s*conte[uú]do/i], priority: 2 },

  // PRIORIDADE 3: Tipos comuns
  { type: 'carrossel', patterns: [/carros?s?el/i, /carousel/i, /\d+\s*slides?/i, /\d+\s*p[aá]ginas?/i], priority: 3 },
  { type: 'calendario', patterns: [/calend[aá]rio/i, /cronograma/i, /plano\s*editorial/i, /planner/i], priority: 3 },
  { type: 'stories', patterns: [/\bstory\b/i, /\bstories\b/i], priority: 3 },
  { type: 'aviso', patterns: [/\baviso\b/i, /\bcomunicado\b/i, /\blembrete\b/i], priority: 3 },
  { type: 'guia', patterns: [/\bguia\b/i, /\bmanual\b/i, /passo\s*a\s*passo/i], priority: 3 },
  { type: 'esboco', patterns: [/\besbo[cç]o\b/i, /\boutline\b/i], priority: 3 },
  { type: 'discipulado', patterns: [/\bdiscipulado\b/i, /\bmentoria\b/i], priority: 3 },

  // PRIORIDADE 4: Genéricos
  { type: 'desafio_semanal', patterns: [/\bdesafio\b/i, /\bchallenge\b/i, /\bjornada\b/i], priority: 4 },
  { type: 'estudo', patterns: [/\bestudo\b(?!\s*(de\s*caso|t[eé]cnico))/i], priority: 4 },
  { type: 'resumo', patterns: [/\bresumo\b/i, /\bresumir\b/i, /principais\s*pontos/i], priority: 4 },
  { type: 'devocional', patterns: [/\bdevocional\b/i, /\bmedita[cç][aã]o\b/i], priority: 4 },
  { type: 'perguntas', patterns: [/\bperguntas\b(?!\s*e\s*respostas)/i, /\bquest[oõ]es\b/i], priority: 4 },
  { type: 'convite', patterns: [/\bconvite\b/i, /venha\s*para/i, /\bparticipe\b/i], priority: 4 },

  // PRIORIDADE 5: Mais genéricos
  { type: 'post', patterns: [/\bpost\b/i, /\bpublica[cç][aã]o\b/i, /\blegenda\b/i], priority: 5 },
  { type: 'ideia_estrategica', patterns: [/\bideia\b/i, /\bviral\b/i, /\bcampanha\b/i], priority: 5 },
];

// ============================================
// FUNÇÕES DE DETECÇÃO
// ============================================

function detectContentTypesFromPatterns(input: string): string[] {
  const normalizedInput = normalizeText(input);
  const matches: { type: string; priority: number }[] = [];

  for (const { type, patterns, priority } of TYPE_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(input) || pattern.test(normalizedInput)) {
        if (!matches.find(m => m.type === type)) {
          matches.push({ type, priority });
        }
        break;
      }
    }
  }

  matches.sort((a, b) => a.priority - b.priority);
  return matches.map(m => m.type);
}

function detectContentTypesFromSynonyms(input: string): string[] {
  const normalizedInput = normalizeText(input);
  const words = normalizedInput.split(/\s+/);
  const detected: Set<string> = new Set();

  for (let phraseLength = 3; phraseLength >= 1; phraseLength--) {
    for (let i = 0; i <= words.length - phraseLength; i++) {
      const phrase = words.slice(i, i + phraseLength).join(' ');
      const matchedType = SYNONYM_MAP[phrase];
      if (matchedType) {
        detected.add(matchedType);
      }
    }
  }

  return Array.from(detected);
}

export function detectExplicitType(input: string): string | null {
  const match = input.match(/TIPO_SOLICITADO:\s*([a-z_]+)/i);
  if (match) {
    const type = match[1].trim().toLowerCase();
    if (isValidContentType(type)) {
      return type;
    }
  }
  return null;
}

export function interpretSemanticType(input: string): string {
  const normalizedInput = normalizeText(input);

  const categoryKeywords: Record<string, { keywords: RegExp[]; defaultType: string }> = {
    biblico: {
      keywords: [/b[ií]blia/i, /vers[ií]culo/i, /deus/i, /jesus/i, /evangelho/i, /ora[cç][aã]o/i],
      defaultType: 'devocional'
    },
    social: {
      keywords: [/instagram/i, /facebook/i, /rede\s*social/i, /feed/i],
      defaultType: 'post'
    },
    video: {
      keywords: [/v[ií]deo/i, /gravar/i, /filmar/i, /youtube/i],
      defaultType: 'reel'
    },
    educacional: {
      keywords: [/ensinar/i, /capacitar/i, /treinar/i, /aprender/i],
      defaultType: 'guia'
    },
    operacional: {
      keywords: [/evento/i, /culto/i, /reuni[aã]o/i, /hor[aá]rio/i],
      defaultType: 'aviso'
    }
  };

  for (const [, config] of Object.entries(categoryKeywords)) {
    for (const keyword of config.keywords) {
      if (keyword.test(input) || keyword.test(normalizedInput)) {
        return config.defaultType;
      }
    }
  }

  return 'conteudo_generico_estruturado';
}

/**
 * FUNÇÃO PRINCIPAL: Detecta todos os tipos de conteúdo no texto
 */
export function detectContentTypes(input: string): string[] {
  try {
    // 1. Verificar tipo explícito primeiro
    const explicitType = detectExplicitType(input);
    if (explicitType) {
      console.log(`🎯 Explicit type detected: ${explicitType}`);
      return [explicitType];
    }

    // 2. Detectar por patterns
    const patternMatches = detectContentTypesFromPatterns(input);
    
    // 3. Detectar por sinônimos
    const synonymMatches = detectContentTypesFromSynonyms(input);
    
    // 4. Combinar resultados únicos
    const combined = [...new Set([...patternMatches, ...synonymMatches])];

    if (combined.length > 0) {
      console.log(`✅ Detected types: ${combined.join(', ')}`);
      return combined;
    }

    // 5. Fallback para interpretação semântica
    const semanticType = interpretSemanticType(input);
    console.log(`🔮 Semantic interpretation: ${semanticType}`);
    return [semanticType];
  } catch (error) {
    console.error('Error in detectContentTypes:', error);
    return ['post']; // Fallback seguro
  }
}

export function getDetectedTypesInfo(types: string[]): ContentTypeDefinition[] {
  return types
    .map(type => getTypeDefinition(type))
    .filter((def): def is ContentTypeDefinition => def !== undefined);
}
