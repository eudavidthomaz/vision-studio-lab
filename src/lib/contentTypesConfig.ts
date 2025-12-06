/**
 * MÓDULO CENTRALIZADO DE CONFIGURAÇÃO DE TIPOS DE CONTEÚDO
 * 
 * Este é a FONTE ÚNICA DE VERDADE para todos os tipos de conteúdo do Ide.On.
 * Qualquer novo tipo deve ser adicionado aqui primeiro.
 * 
 * Baseado em CONTENT_TYPES.md e ARQUITETURA_SISTEMA_IDEON.md
 */

// ============================================
// TIPOS CANÔNICOS
// ============================================

export type ContentCategory = 
  | 'social'           // Posts, carrosséis, stories, reels
  | 'biblico'          // Devocionais, estudos, esboços
  | 'engajamento'      // Desafios, campanhas, ideias estratégicas
  | 'educacional'      // Guias, manuais, treinos
  | 'operacional'      // Avisos, convites, calendários
  | 'video'            // Roteiros de vídeo
  | 'generico';        // Fallback estruturado

export type ContentPillar = 'EDIFICAR' | 'ALCANÇAR' | 'PERTENCER' | 'SERVIR' | 'EXALTAR' | 'ENVIAR';

export interface ContentTypeDefinition {
  type: string;                    // Chave canônica (snake_case)
  name: string;                    // Nome exibido ao usuário
  category: ContentCategory;       // Categoria
  defaultPillar: ContentPillar;    // Pilar padrão
  synonyms: string[];              // Variações de linguagem natural
  requiresBiblicalFoundation: boolean;  // Se precisa de fundamento_biblico
  requiresProductionTips: boolean;      // Se precisa de dica_producao
  description: string;             // Descrição breve
}

// ============================================
// LISTA CANÔNICA DE TIPOS (34+ tipos)
// ============================================

export const CONTENT_TYPE_DEFINITIONS: ContentTypeDefinition[] = [
  // ========== SOCIAL (7 tipos) ==========
  {
    type: 'post',
    name: 'Post Simples',
    category: 'social',
    defaultPillar: 'EDIFICAR',
    synonyms: ['post', 'post simples', 'post único', 'publicação', 'legenda', 'post para feed'],
    requiresBiblicalFoundation: true,
    requiresProductionTips: true,
    description: 'Post de texto para feed do Instagram/Facebook'
  },
  {
    type: 'foto_post',
    name: 'Post com Foto',
    category: 'social',
    defaultPillar: 'ALCANÇAR',
    synonyms: ['foto post', 'post com foto', 'foto para feed', 'imagem para post'],
    requiresBiblicalFoundation: false,
    requiresProductionTips: true,
    description: 'Post com foco em imagem destacada'
  },
  {
    type: 'carrossel',
    name: 'Carrossel',
    category: 'social',
    defaultPillar: 'EDIFICAR',
    synonyms: ['carrossel', 'carousel', 'slides', 'páginas', 'sequência de cards', 'carrossel de 10 páginas', 'carrossel 10', 'carrossel 8 páginas'],
    requiresBiblicalFoundation: true,
    requiresProductionTips: true,
    description: 'Sequência de 5-10 slides para Instagram'
  },
  {
    type: 'stories',
    name: 'Stories',
    category: 'social',
    defaultPillar: 'ALCANÇAR',
    synonyms: ['stories', 'story', 'sequência de stories', 'stories instagram'],
    requiresBiblicalFoundation: false,
    requiresProductionTips: true,
    description: 'Sequência de stories para Instagram/Facebook'
  },
  {
    type: 'reel',
    name: 'Reel/Short',
    category: 'social',
    defaultPillar: 'ALCANÇAR',
    synonyms: ['reel', 'reels', 'vídeo curto', 'short', 'shorts', 'tiktok'],
    requiresBiblicalFoundation: true,
    requiresProductionTips: true,
    description: 'Vídeo curto de 15-90 segundos'
  },
  {
    type: 'convite',
    name: 'Convite',
    category: 'social',
    defaultPillar: 'ALCANÇAR',
    synonyms: ['convite', 'convite para evento', 'venha para', 'participe'],
    requiresBiblicalFoundation: false,
    requiresProductionTips: false,
    description: 'Convite para eventos da igreja'
  },
  {
    type: 'aviso',
    name: 'Aviso/Comunicado',
    category: 'operacional',
    defaultPillar: 'SERVIR',
    synonyms: ['aviso', 'comunicado', 'lembrete', 'atenção', 'informe'],
    requiresBiblicalFoundation: false,
    requiresProductionTips: false,
    description: 'Comunicado importante para a comunidade'
  },

  // ========== BÍBLICO (8 tipos) ==========
  {
    type: 'devocional',
    name: 'Devocional',
    category: 'biblico',
    defaultPillar: 'EXALTAR',
    synonyms: ['devocional', 'devoção', 'meditação', 'reflexão diária'],
    requiresBiblicalFoundation: true,
    requiresProductionTips: false,
    description: 'Reflexão devocional para um dia'
  },
  {
    type: 'devocional_semanal',
    name: 'Devocional Semanal',
    category: 'biblico',
    defaultPillar: 'EXALTAR',
    synonyms: ['devocional semanal', 'devocional de 7 dias', 'devocional 7 dias', 'devocionais semanais', 'semana devocional'],
    requiresBiblicalFoundation: true,
    requiresProductionTips: false,
    description: 'Série de 7 devocionais conectados'
  },
  {
    type: 'estudo',
    name: 'Estudo Bíblico',
    category: 'biblico',
    defaultPillar: 'EDIFICAR',
    synonyms: ['estudo', 'estudo bíblico', 'estudo biblico', 'análise bíblica', 'exegese'],
    requiresBiblicalFoundation: true,
    requiresProductionTips: false,
    description: 'Estudo aprofundado de uma passagem bíblica'
  },
  {
    type: 'esboco',
    name: 'Esboço de Pregação',
    category: 'biblico',
    defaultPillar: 'EDIFICAR',
    synonyms: ['esboço', 'esboco', 'outline', 'estrutura de sermão', 'tópicos'],
    requiresBiblicalFoundation: true,
    requiresProductionTips: false,
    description: 'Estrutura completa de um sermão'
  },
  {
    type: 'resumo',
    name: 'Resumo de Pregação',
    category: 'biblico',
    defaultPillar: 'EDIFICAR',
    synonyms: ['resumo', 'resumo de pregação', 'resumo da pregação', 'síntese', 'principais pontos'],
    requiresBiblicalFoundation: true,
    requiresProductionTips: false,
    description: 'Resumo completo de uma pregação'
  },
  {
    type: 'resumo_breve',
    name: 'Resumo Breve',
    category: 'biblico',
    defaultPillar: 'EDIFICAR',
    synonyms: ['resumo breve', 'resumo curto', 'resumo rápido'],
    requiresBiblicalFoundation: false,
    requiresProductionTips: false,
    description: 'Resumo conciso de até 500 palavras'
  },
  {
    type: 'versiculos_citados',
    name: 'Versículos Citados',
    category: 'biblico',
    defaultPillar: 'EDIFICAR',
    synonyms: ['versículos citados', 'versiculos citados', 'referências bíblicas', 'passagens mencionadas'],
    requiresBiblicalFoundation: false,
    requiresProductionTips: false,
    description: 'Lista organizada de versículos mencionados'
  },
  {
    type: 'trilha_oracao',
    name: 'Trilha de Oração',
    category: 'biblico',
    defaultPillar: 'EXALTAR',
    synonyms: ['trilha de oração', 'trilha oracao', 'roteiro de oração', 'guia de intercessão'],
    requiresBiblicalFoundation: true,
    requiresProductionTips: false,
    description: 'Roteiro estruturado para momento de oração'
  },

  // ========== ENGAJAMENTO (4 tipos) ==========
  {
    type: 'desafio_semanal',
    name: 'Desafio Semanal',
    category: 'engajamento',
    defaultPillar: 'ENVIAR',
    synonyms: ['desafio', 'desafio semanal', 'challenge', 'desafio de 7 dias', 'jornada', 'missão semanal'],
    requiresBiblicalFoundation: true,
    requiresProductionTips: false,
    description: 'Desafio prático de 7 dias para a comunidade'
  },
  {
    type: 'campanha_tematica',
    name: 'Campanha Temática',
    category: 'engajamento',
    defaultPillar: 'ENVIAR',
    synonyms: ['campanha', 'campanha temática', 'série de conteúdo', 'planejamento série'],
    requiresBiblicalFoundation: false,
    requiresProductionTips: false,
    description: 'Planejamento de campanha de 4 semanas'
  },
  {
    type: 'ideia_estrategica',
    name: 'Ideia Estratégica',
    category: 'engajamento',
    defaultPillar: 'ENVIAR',
    synonyms: ['ideia', 'ideia estratégica', 'estratégia', 'plano de conteúdo', 'viral'],
    requiresBiblicalFoundation: true,
    requiresProductionTips: false,
    description: 'Ideia criativa para engajamento'
  },
  {
    type: 'perguntas',
    name: 'Perguntas para Célula',
    category: 'engajamento',
    defaultPillar: 'EDIFICAR',
    synonyms: ['perguntas', 'questões', 'discussão', 'perguntas para célula'],
    requiresBiblicalFoundation: true,
    requiresProductionTips: false,
    description: 'Perguntas reflexivas para grupos pequenos'
  },

  // ========== EDUCACIONAL (6 tipos) ==========
  {
    type: 'guia',
    name: 'Guia Prático',
    category: 'educacional',
    defaultPillar: 'EDIFICAR',
    synonyms: ['guia', 'manual', 'passo a passo', 'tutorial', 'como fazer'],
    requiresBiblicalFoundation: false,
    requiresProductionTips: false,
    description: 'Material educativo passo a passo'
  },
  {
    type: 'discipulado',
    name: 'Plano de Discipulado',
    category: 'educacional',
    defaultPillar: 'EDIFICAR',
    synonyms: ['discipulado', 'plano de discipulado', 'mentoria', 'acompanhamento espiritual'],
    requiresBiblicalFoundation: true,
    requiresProductionTips: false,
    description: 'Plano estruturado de discipulado'
  },
  {
    type: 'qa_estruturado',
    name: 'Perguntas e Respostas',
    category: 'educacional',
    defaultPillar: 'EDIFICAR',
    synonyms: ['perguntas e respostas', 'q&a', 'qa', 'faq', 'dúvidas frequentes'],
    requiresBiblicalFoundation: true,
    requiresProductionTips: false,
    description: 'Q&A estruturado sobre um tema'
  },
  {
    type: 'treino_voluntario',
    name: 'Treino de Voluntário',
    category: 'educacional',
    defaultPillar: 'SERVIR',
    synonyms: ['treino de voluntário', 'treino voluntário', 'onboarding mídia', 'capacitação'],
    requiresBiblicalFoundation: false,
    requiresProductionTips: false,
    description: 'Material de onboarding para novos voluntários'
  },
  {
    type: 'manual_etica',
    name: 'Manual de Ética',
    category: 'educacional',
    defaultPillar: 'SERVIR',
    synonyms: ['manual ética', 'manual de ética', 'guia ética', 'proteção imagem'],
    requiresBiblicalFoundation: false,
    requiresProductionTips: false,
    description: 'Guia de boas práticas e ética em mídia'
  },
  {
    type: 'kit_basico',
    name: 'Kit Básico de Mídia',
    category: 'educacional',
    defaultPillar: 'SERVIR',
    synonyms: ['kit básico', 'kit basico', 'mídia com celular', 'setup mínimo'],
    requiresBiblicalFoundation: false,
    requiresProductionTips: false,
    description: 'Lista de equipamentos básicos para mídia'
  },

  // ========== OPERACIONAL (4 tipos) ==========
  {
    type: 'calendario',
    name: 'Calendário Editorial',
    category: 'operacional',
    defaultPillar: 'SERVIR',
    synonyms: ['calendário', 'calendario', 'cronograma', 'planejamento', 'plano editorial', 'planner'],
    requiresBiblicalFoundation: false,
    requiresProductionTips: false,
    description: 'Planejamento semanal/mensal de postagens'
  },
  {
    type: 'convite_grupos',
    name: 'Convite para Grupos',
    category: 'operacional',
    defaultPillar: 'PERTENCER',
    synonyms: ['convite para grupo', 'convite grupos', 'chamado para célula', 'entre no grupo'],
    requiresBiblicalFoundation: false,
    requiresProductionTips: false,
    description: 'Convite para células e grupos pequenos'
  },
  {
    type: 'checklist_culto',
    name: 'Checklist do Culto',
    category: 'operacional',
    defaultPillar: 'SERVIR',
    synonyms: ['checklist culto', 'checklist do culto', 'pré culto', 'checklist'],
    requiresBiblicalFoundation: false,
    requiresProductionTips: false,
    description: 'Checklist operacional para cultos'
  },
  {
    type: 'estrategia_social',
    name: 'Estratégia Social',
    category: 'operacional',
    defaultPillar: 'SERVIR',
    synonyms: ['estratégia social', 'estrategia social', 'plano instagram', 'estratégia redes'],
    requiresBiblicalFoundation: false,
    requiresProductionTips: false,
    description: 'Plano estratégico para redes sociais'
  },

  // ========== VÍDEO (2 tipos) ==========
  {
    type: 'roteiro_video',
    name: 'Roteiro de Vídeo',
    category: 'video',
    defaultPillar: 'ENVIAR',
    synonyms: ['roteiro de vídeo', 'roteiro video', 'script de vídeo', 'roteiro longo'],
    requiresBiblicalFoundation: true,
    requiresProductionTips: true,
    description: 'Roteiro completo para vídeo longo'
  },
  {
    type: 'roteiro_reels',
    name: 'Roteiro para Reels',
    category: 'video',
    defaultPillar: 'ALCANÇAR',
    synonyms: ['roteiro reels', 'script reels', 'roteiro de reel'],
    requiresBiblicalFoundation: true,
    requiresProductionTips: true,
    description: 'Roteiro específico para Reels/Shorts'
  },

  // ========== GENÉRICO (fallback) ==========
  {
    type: 'conteudo_generico_estruturado',
    name: 'Conteúdo Estruturado',
    category: 'generico',
    defaultPillar: 'EDIFICAR',
    synonyms: [],  // Não tem sinônimos - é usado apenas como fallback
    requiresBiblicalFoundation: false,
    requiresProductionTips: false,
    description: 'Conteúdo estruturado genérico (usado quando o tipo não é reconhecido)'
  },
];

// ============================================
// MAPA DE SINÔNIMOS PARA LOOKUP RÁPIDO
// ============================================

export const SYNONYM_MAP: Record<string, string> = CONTENT_TYPE_DEFINITIONS.reduce((acc, def) => {
  // Adicionar o próprio tipo como sinônimo
  acc[def.type.toLowerCase()] = def.type;
  
  // Adicionar todos os sinônimos
  def.synonyms.forEach((syn) => {
    acc[syn.toLowerCase().trim()] = def.type;
  });
  
  return acc;
}, {} as Record<string, string>);

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

/**
 * Normaliza texto removendo acentos, pontuação desnecessária e convertendo para minúsculas
 */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Obtém a definição de um tipo pelo seu identificador canônico
 */
export function getTypeDefinition(type: string): ContentTypeDefinition | undefined {
  return CONTENT_TYPE_DEFINITIONS.find(def => def.type === type);
}

/**
 * Obtém todos os tipos de uma categoria
 */
export function getTypesByCategory(category: ContentCategory): ContentTypeDefinition[] {
  return CONTENT_TYPE_DEFINITIONS.filter(def => def.category === category);
}

/**
 * Verifica se um tipo requer fundamento bíblico
 */
export function requiresBiblicalFoundation(type: string): boolean {
  const def = getTypeDefinition(type);
  return def?.requiresBiblicalFoundation ?? false;
}

/**
 * Obtém o pilar padrão de um tipo
 */
export function getDefaultPillar(type: string): ContentPillar {
  const def = getTypeDefinition(type);
  return def?.defaultPillar ?? 'EDIFICAR';
}

/**
 * Exporta lista de todos os tipos canônicos
 */
export const ALL_CONTENT_TYPES: string[] = CONTENT_TYPE_DEFINITIONS.map(def => def.type);

/**
 * Verifica se um valor é um tipo canônico válido
 */
export function isValidContentType(value: string): boolean {
  return ALL_CONTENT_TYPES.includes(value);
}
