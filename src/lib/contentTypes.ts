// ============================================
// FONTE ÚNICA DE VERDADE PARA TIPOS DE CONTEÚDO
// Usado tanto no frontend quanto referenciado no backend
// ============================================

export const CONTENT_TYPES = {
  // Posts e Carrosséis
  carrossel: { label: "Carrossel", pilar: "EDIFICAR", icon: "📑" },
  post: { label: "Post Simples", pilar: "EDIFICAR", icon: "📝" },
  convite: { label: "Convite", pilar: "ALCANÇAR", icon: "💌" },
  aviso: { label: "Aviso", pilar: "EDIFICAR", icon: "📢" },
  convite_grupos: { label: "Convite Grupos", pilar: "EDIFICAR", icon: "👥" },
  
  // Stories e Vídeos
  stories: { label: "Stories", pilar: "ALCANÇAR", icon: "📱" },
  reel: { label: "Reel/Short", pilar: "ALCANÇAR", icon: "🎬" },
  roteiro_reels: { label: "Roteiro Reels", pilar: "ALCANÇAR", icon: "📽️" },
  
  // Conteúdo Bíblico
  devocional: { label: "Devocional", pilar: "EXALTAR", icon: "🙏" },
  estudo: { label: "Estudo Bíblico", pilar: "EDIFICAR", icon: "📖" },
  esboco: { label: "Esboço de Pregação", pilar: "EDIFICAR", icon: "📋" },
  versiculos_citados: { label: "Versículos Citados", pilar: "EDIFICAR", icon: "✝️" },
  resumo: { label: "Resumo de Pregação", pilar: "EDIFICAR", icon: "📄" },
  resumo_breve: { label: "Resumo Breve", pilar: "EDIFICAR", icon: "📃" },
  trilha_oracao: { label: "Trilha de Oração", pilar: "EXALTAR", icon: "🕯️" },
  perguntas: { label: "Perguntas p/ Célula", pilar: "EDIFICAR", icon: "❓" },
  
  // Engajamento
  desafio_semanal: { label: "Desafio Semanal", pilar: "ENVIAR", icon: "🎯" },
  ideia_estrategica: { label: "Ideia Estratégica", pilar: "ENVIAR", icon: "💡" },
  
  // Materiais Educativos
  guia: { label: "Guia/Manual", pilar: "EDIFICAR", icon: "📘" },
  discipulado: { label: "Discipulado", pilar: "EDIFICAR", icon: "🌱" },
  
  // Estrutura e Organização
  calendario: { label: "Calendário Editorial", pilar: "EDIFICAR", icon: "📅" },
  qa_estruturado: { label: "Q&A Estruturado", pilar: "EDIFICAR", icon: "💬" },
  
  // Operacional
  treino_voluntario: { label: "Treino Voluntário", pilar: "SERVIR", icon: "🎓" },
  campanha_tematica: { label: "Campanha Temática", pilar: "ALCANÇAR", icon: "🚀" },
  checklist_culto: { label: "Checklist Culto", pilar: "SERVIR", icon: "✅" },
  kit_basico: { label: "Kit Básico Mídia", pilar: "SERVIR", icon: "🧰" },
  manual_etica: { label: "Manual de Ética", pilar: "SERVIR", icon: "⚖️" },
  estrategia_social: { label: "Estratégia Social", pilar: "ENVIAR", icon: "📊" },
} as const;

export type ContentType = keyof typeof CONTENT_TYPES;

// Lista ordenada para dropdown
export const CONTENT_TYPE_OPTIONS: { value: ContentType; label: string; icon: string }[] = [
  { value: "carrossel", label: "Carrossel", icon: "📑" },
  { value: "post", label: "Post Simples", icon: "📝" },
  { value: "stories", label: "Stories", icon: "📱" },
  { value: "reel", label: "Reel/Short", icon: "🎬" },
  { value: "devocional", label: "Devocional", icon: "🙏" },
  { value: "estudo", label: "Estudo Bíblico", icon: "📖" },
  { value: "resumo", label: "Resumo de Pregação", icon: "📄" },
  { value: "resumo_breve", label: "Resumo Breve", icon: "📃" },
  { value: "perguntas", label: "Perguntas p/ Célula", icon: "❓" },
  { value: "desafio_semanal", label: "Desafio Semanal", icon: "🎯" },
  { value: "convite", label: "Convite", icon: "💌" },
  { value: "aviso", label: "Aviso", icon: "📢" },
  { value: "calendario", label: "Calendário Editorial", icon: "📅" },
  { value: "trilha_oracao", label: "Trilha de Oração", icon: "🕯️" },
  { value: "esboco", label: "Esboço de Pregação", icon: "📋" },
  { value: "guia", label: "Guia/Manual", icon: "📘" },
  { value: "discipulado", label: "Discipulado", icon: "🌱" },
  { value: "ideia_estrategica", label: "Ideia Estratégica", icon: "💡" },
  { value: "roteiro_reels", label: "Roteiro Reels", icon: "📽️" },
  { value: "qa_estruturado", label: "Q&A Estruturado", icon: "💬" },
  { value: "versiculos_citados", label: "Versículos Citados", icon: "✝️" },
  { value: "convite_grupos", label: "Convite Grupos", icon: "👥" },
  { value: "treino_voluntario", label: "Treino Voluntário", icon: "🎓" },
  { value: "campanha_tematica", label: "Campanha Temática", icon: "🚀" },
  { value: "checklist_culto", label: "Checklist Culto", icon: "✅" },
  { value: "kit_basico", label: "Kit Básico Mídia", icon: "🧰" },
  { value: "manual_etica", label: "Manual de Ética", icon: "⚖️" },
  { value: "estrategia_social", label: "Estratégia Social", icon: "📊" },
];

// Grupos por categoria para UI organizada
export const CONTENT_TYPE_GROUPS = [
  {
    label: "Posts e Carrosséis",
    types: ["carrossel", "post", "convite", "aviso", "convite_grupos"] as ContentType[],
  },
  {
    label: "Stories e Vídeos",
    types: ["stories", "reel", "roteiro_reels"] as ContentType[],
  },
  {
    label: "Conteúdo Bíblico",
    types: ["devocional", "estudo", "resumo", "resumo_breve", "perguntas", "esboco", "versiculos_citados", "trilha_oracao"] as ContentType[],
  },
  {
    label: "Engajamento",
    types: ["desafio_semanal", "ideia_estrategica", "calendario"] as ContentType[],
  },
  {
    label: "Educativo e Operacional",
    types: ["guia", "discipulado", "qa_estruturado", "treino_voluntario", "checklist_culto", "kit_basico", "manual_etica", "estrategia_social", "campanha_tematica"] as ContentType[],
  },
];

export function isValidContentType(type: string): type is ContentType {
  return type in CONTENT_TYPES;
}

export function getContentTypeLabel(type: string): string {
  if (isValidContentType(type)) {
    return CONTENT_TYPES[type].label;
  }
  return type;
}
