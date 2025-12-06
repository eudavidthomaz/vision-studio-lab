/**
 * MÓDULO DE DETECÇÃO E INTERPRETAÇÃO SEMÂNTICA DE TIPOS DE CONTEÚDO (BACKEND)
 * 
 * Sincronizado com src/lib/contentTypeDetection.ts (frontend)
 */

import { 
  CONTENT_TYPE_DEFINITIONS,
  SYNONYM_MAP,
  normalizeText,
  getTypeDefinition,
  isValidContentType,
  getDefaultPillar,
  typeRequiresBiblicalFoundation,
  type ContentTypeDefinition,
  type ContentPillar
} from "./contentTypesConfig.ts";

// Re-exportar tipos e funções úteis
export { 
  CONTENT_TYPE_DEFINITIONS, 
  SYNONYM_MAP, 
  normalizeText,
  getTypeDefinition,
  isValidContentType,
  getDefaultPillar,
  typeRequiresBiblicalFoundation,
  type ContentTypeDefinition,
  type ContentPillar
};

// ============================================
// PADRÕES REGEX POR TIPO (ordenados por especificidade)
// ============================================

interface TypePattern {
  type: string;
  patterns: RegExp[];
  priority: number;  // Menor = maior prioridade
}

const TYPE_PATTERNS: TypePattern[] = [
  // PRIORIDADE 1: Tipos muito específicos (comandos)
  {
    type: 'treino_voluntario',
    patterns: [
      /treino\s*(de\s*)?volunt[aá]rio/i, 
      /onboarding\s*m[ií]dia/i, 
      /\/treino-volunt[aá]rio/i,
      /treinamento\s*(para\s*)?(equipe\s*)?(de\s*)?m[ií]dia/i,
      /capacita[cç][aã]o\s*(de\s*)?(equipe|volunt[aá]rios?)/i,
      /treinamento\s*(de\s*)?volunt[aá]rios?/i,
      /treinamento\s*(para\s*)?equipe/i
    ],
    priority: 1
  },
  {
    type: 'campanha_tematica',
    patterns: [/campanha[-\s]?tem[aá]tica/i, /s[eé]rie\s*de\s*conte[uú]do/i, /planejamento\s*s[eé]rie/i],
    priority: 1
  },
  {
    type: 'roteiro_reels',
    patterns: [/roteiro\s*(de\s*)?reels?/i, /script\s*reels?/i, /reel\s*roteiro/i],
    priority: 1
  },
  {
    type: 'checklist_culto',
    patterns: [/checklist\s*(para\s*)?(equipe\s*)?(do\s*)?culto/i, /checklist.*culto/i, /pr[eé][-\s]?culto/i],
    priority: 1
  },
  {
    type: 'kit_basico',
    patterns: [
      /kit\s*b[aá]sico/i, 
      /m[ií]dia\s*com\s*celular/i, 
      /setup\s*m[ií]nimo/i,
      /kit\s*(de\s*)?boas[-\s]?vindas/i,
      /kit\s*(para\s*)?(novos\s*)?convertidos/i,
      /kit\s*(de\s*)?novos\s*membros/i
    ],
    priority: 1
  },
  {
    type: 'manual_etica',
    patterns: [/manual\s*[-\s]?[eé]tica/i, /guia\s*[eé]tica/i, /prote[cç][aã]o\s*imagem/i],
    priority: 1
  },
  {
    type: 'estrategia_social',
    patterns: [
      /estrat[eé]gia[-\s]?social/i, 
      /plano\s*instagram/i, 
      /estrat[eé]gia\s*redes/i,
      /estrat[eé]gia\s*(de\s*)?(redes\s*)?sociais?/i,
      /estrat[eé]gia\s*(para\s*)?redes/i,
      /plano\s*(de\s*)?redes\s*sociais?/i,
      /estrat[eé]gia\s*(para\s*)?(a\s*)?igreja/i
    ],
    priority: 1
  },

  // PRIORIDADE 2: Tipos específicos com múltiplas palavras
  {
    type: 'devocional_semanal',
    patterns: [
      /devocional\s*(de\s*)?(7|sete|\d+)\s*dias?/i,
      /semana\s*(de\s*)?devocional/i,
      /devocionais?\s+semanais?/i,
      /devocional\s+semanal/i
    ],
    priority: 2
  },
  {
    type: 'desafio_semanal',
    patterns: [/desafio\s*(semanal|de\s*7\s*dias)/i, /challenge\s*semanal/i, /7\s*dias\s*de/i],
    priority: 2
  },
  {
    type: 'versiculos_citados',
    patterns: [/vers[ií]culos\s*citados/i, /refer[eê]ncias\s*b[ií]blicas/i, /passagens\s*mencionadas/i],
    priority: 2
  },
  {
    type: 'trilha_oracao',
    patterns: [/trilha\s*(de\s*)?ora[cç][aã]o/i, /roteiro\s*(de\s*)?ora[cç][aã]o/i, /guia\s*(de\s*)?intercess[aã]o/i],
    priority: 2
  },
  {
    type: 'qa_estruturado',
    patterns: [/perguntas\s*e\s*respostas/i, /q\s*&\s*a/i, /d[uú]vidas\s*frequentes/i, /faq/i],
    priority: 2
  },
  {
    type: 'convite_grupos',
    patterns: [/convite\s*(para\s*)?grupo/i, /chamado\s*(para\s*)?c[eé]lula/i, /junte[-\s]?se\s*ao/i],
    priority: 2
  },
  {
    type: 'resumo_breve',
    patterns: [/resumo\s*breve/i, /resumo\s*curto/i, /resumo\s*r[aá]pido/i],
    priority: 2
  },
  {
    type: 'roteiro_video',
    patterns: [/roteiro\s*(de\s*)?v[ií]deo/i, /script\s*(de\s*)?v[ií]deo/i],
    priority: 2
  },
  {
    type: 'estudo',
    patterns: [/estudo\s*b[ií]blico/i, /an[aá]lise\s*b[ií]blica/i, /exegese/i],
    priority: 2
  },
  {
    type: 'ideia_estrategica',
    patterns: [/ideia\s*estrat[eé]gica/i, /plano\s*de\s*conte[uú]do/i],
    priority: 2
  },

  // PRIORIDADE 3: Tipos comuns
  {
    type: 'carrossel',
    patterns: [/carros?s?el/i, /carousel/i, /\d+\s*slides?/i, /\d+\s*p[aá]ginas?/i, /cards?\s*\d+/i],
    priority: 3
  },
  {
    type: 'calendario',
    patterns: [/calend[aá]rio/i, /cronograma/i, /planejamento\s*editorial/i, /plano\s*editorial/i, /planner/i],
    priority: 3
  },
  {
    type: 'reel',
    patterns: [/\breels?\b/i, /\bshorts?\b/i, /v[ií]deo\s*curto/i],
    priority: 3
  },
  {
    type: 'stories',
    patterns: [/\bstory\b/i, /\bstories\b/i, /\bstorys\b/i],
    priority: 3
  },
  {
    type: 'aviso',
    patterns: [/\baviso\b/i, /\bcomunicado\b/i, /\blembrete\b/i, /\baten[cç][aã]o\b/i],
    priority: 3
  },
  {
    type: 'guia',
    patterns: [/\bguia\b/i, /\bmanual\b/i, /passo\s*a\s*passo/i, /\btutorial\b/i],
    priority: 3
  },
  {
    type: 'esboco',
    patterns: [/\besbo[cç]o\b/i, /\boutline\b/i, /t[oó]picos\s*d[aeo]/i],
    priority: 3
  },
  {
    type: 'discipulado',
    patterns: [/\bdiscipulado\b/i, /\bmentoria\b/i, /acompanhamento\s*espiritual/i],
    priority: 3
  },

  // PRIORIDADE 4: Tipos genéricos (cuidado com falsos positivos)
  {
    type: 'desafio_semanal',
    patterns: [/\bdesafio\b/i, /\bchallenge\b/i, /\bmiss[aã]o\b/i, /\bjornada\b/i],
    priority: 4
  },
  {
    type: 'estudo',
    patterns: [/\bestudo\b(?!\s*(de\s*caso|t[eé]cnico))/i],
    priority: 4
  },
  {
    type: 'resumo',
    patterns: [/\bresumo\b/i, /\bresumir\b/i, /\bsintetize\b/i, /principais\s*pontos/i, /\bs[ií]ntese\b/i],
    priority: 4
  },
  {
    type: 'devocional',
    patterns: [/\bdevocional\b/i, /\bmedita[cç][aã]o\b/i, /reflex[aã]o\s*di[aá]ria/i],
    priority: 4
  },
  {
    type: 'perguntas',
    patterns: [/\bperguntas\b(?!\s*e\s*respostas)/i, /\bquest[oõ]es\b/i, /\bc[eé]lula\b/i],
    priority: 4
  },
  {
    type: 'convite',
    patterns: [/\bconvite\b/i, /\bconvidar\b/i, /chamado\s*para/i, /venha\s*para/i, /\bparticipe\b/i],
    priority: 4
  },

  // PRIORIDADE 5: Tipos mais genéricos (último recurso antes do fallback)
  {
    type: 'post',
    patterns: [/\bpost\b/i, /\bpublica[cç][aã]o\b/i, /\blegenda\b/i],
    priority: 5
  },
  {
    type: 'ideia_estrategica',
    patterns: [/\bideia\b/i, /\bviral\b/i, /\bcampanha\b/i, /\bestrat[eé]gia\b/i, /\bs[eé]rie\b/i],
    priority: 5
  },
];

// ============================================
// FUNÇÕES DE DETECÇÃO
// ============================================

/**
 * Detecta tipos de conteúdo mencionados no texto usando regex patterns
 * Retorna array ordenado por prioridade (mais específico primeiro)
 */
export function detectContentTypesFromPatterns(input: string): string[] {
  const normalizedInput = normalizeText(input);
  const matches: { type: string; priority: number }[] = [];

  for (const { type, patterns, priority } of TYPE_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(input) || pattern.test(normalizedInput)) {
        // Evitar duplicatas
        if (!matches.find(m => m.type === type)) {
          matches.push({ type, priority });
        }
        break;  // Encontrou match para este tipo, não precisa testar mais patterns
      }
    }
  }

  // Ordenar por prioridade (menor = mais específico = primeiro)
  matches.sort((a, b) => a.priority - b.priority);

  return matches.map(m => m.type);
}

/**
 * Detecta tipos usando lookup direto de sinônimos
 */
export function detectContentTypesFromSynonyms(input: string): string[] {
  const normalizedInput = normalizeText(input);
  const words = normalizedInput.split(/\s+/);
  const detected: Set<string> = new Set();

  // Buscar frases de 3 palavras, depois 2, depois 1
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

/**
 * Detecta tipo explícito marcado no prompt (ex: TIPO_SOLICITADO: carrossel)
 */
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

/**
 * FUNÇÃO PRINCIPAL: Detecta todos os tipos de conteúdo no texto
 * 
 * Estratégia em camadas:
 * 1. Tipo explícito (TIPO_SOLICITADO: xxx)
 * 2. Detecção por patterns regex
 * 3. Detecção por sinônimos
 * 4. Interpretação semântica (se nada encontrado)
 */
export function detectContentTypes(input: string): string[] {
  // 1. Verificar tipo explícito primeiro
  const explicitType = detectExplicitType(input);
  if (explicitType) {
    console.log(`🎯 Explicit type detected: ${explicitType}`);
    return [explicitType];
  }

  // 2. Detectar por patterns (mais preciso)
  const patternMatches = detectContentTypesFromPatterns(input);
  
  // 3. Detectar por sinônimos (complementar)
  const synonymMatches = detectContentTypesFromSynonyms(input);
  
  // 4. Combinar resultados únicos, priorizando patterns
  const combined = [...new Set([...patternMatches, ...synonymMatches])];

  if (combined.length > 0) {
    console.log(`✅ Detected types: ${combined.join(', ')}`);
    return combined;
  }

  // 5. Se nada foi detectado, usar interpretação semântica
  const semanticType = interpretSemanticType(input);
  console.log(`🔮 Semantic interpretation: ${semanticType}`);
  return [semanticType];
}

/**
 * Interpretação semântica para quando nenhum tipo é detectado
 * Analisa palavras-chave para sugerir o tipo mais provável
 */
export function interpretSemanticType(input: string): string {
  const normalizedInput = normalizeText(input);

  // Palavras-chave por categoria
  const categoryKeywords: Record<string, { keywords: RegExp[]; defaultType: string }> = {
    biblico: {
      keywords: [/b[ií]blia/i, /vers[ií]culo/i, /deus/i, /jesus/i, /evangelho/i, /ora[cç][aã]o/i, /f[eé]/i, /esp[ií]rito/i, /salmo/i, /prov[eé]rbio/i],
      defaultType: 'devocional'
    },
    social: {
      keywords: [/instagram/i, /facebook/i, /rede\s*social/i, /feed/i, /engajamento/i, /seguidores/i],
      defaultType: 'post'
    },
    video: {
      keywords: [/v[ií]deo/i, /gravar/i, /filmar/i, /youtube/i, /c[aâ]mera/i],
      defaultType: 'reel'
    },
    educacional: {
      keywords: [/ensinar/i, /capacitar/i, /treinar/i, /aprender/i, /curso/i],
      defaultType: 'guia'
    },
    operacional: {
      keywords: [/evento/i, /culto/i, /reuni[aã]o/i, /hor[aá]rio/i, /data/i, /local/i],
      defaultType: 'aviso'
    }
  };

  // Verificar cada categoria
  for (const [, config] of Object.entries(categoryKeywords)) {
    for (const keyword of config.keywords) {
      if (keyword.test(input) || keyword.test(normalizedInput)) {
        return config.defaultType;
      }
    }
  }

  // Fallback: retornar tipo genérico estruturado (NUNCA post silenciosamente)
  return 'conteudo_generico_estruturado';
}

/**
 * Obtém informações sobre os tipos detectados
 */
export function getDetectedTypesInfo(types: string[]): ContentTypeDefinition[] {
  return types
    .map(type => getTypeDefinition(type))
    .filter((def): def is ContentTypeDefinition => def !== undefined);
}

// ============================================
// EXPORTAÇÕES COMPATÍVEIS COM CÓDIGO EXISTENTE
// ============================================

// Re-exportar tipo ContentType para compatibilidade
export type ContentType = string;

// Função para verificar se é um tipo válido (alias)
export const isContentType = isValidContentType;
