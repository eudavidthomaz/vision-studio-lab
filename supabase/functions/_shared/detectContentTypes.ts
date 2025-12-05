export type ContentType =
  | "carrossel"
  | "reel"
  | "stories"
  | "post"
  | "devocional"
  | "estudo"
  | "trilha_oracao"
  | "calendario"
  | "manual_etica"
  | "aviso"
  | "guia"
  | "esboco"
  | "versiculos_citados"
  | "qa_estruturado"
  | "convite_grupos"
  | "discipulado"
  | "desafio_semanal"
  | "resumo"
  | "perguntas"
  | "ideia_estrategica"
  | "convite"
  | "treino_voluntario"
  | "campanha_tematica"
  | "roteiro_reels"
  | "checklist_culto"
  | "kit_basico"
  | "estrategia_social"
  | "resumo_breve";

const patterns: [ContentType, RegExp][] = [
  ["carrossel", /\b(carros?el|slides?|p(a|á)ginas?|sequ(e|ê)ncia|cards?\s*\d+)\b/],
  ["calendario", /\b(calend(a|á)rio|cronograma|planejamento|plano editorial|planner)\b/],
  ["treino_voluntario", /\b(treino\s+de\s+volunt(a|á)rio|treino-volunt(a|á)rio|onboarding m(i|í)dia)\b/],
  ["campanha_tematica", /\b(campanha-tem(a|á)tica|s(e|é)rie de conte(u|ú)do|planejamento s(e|é)rie)\b/],
  ["roteiro_reels", /\b(roteiro\s*reels|script reels|reel\s*roteiro)\b/],
  ["checklist_culto", /\b(checklist\s*culto|pr(e|é) culto)\b/],
  ["kit_basico", /\b(kit\s*b(a|á)sico|m(i|í)dia com celular|setup m(i|í)nimo)\b/],
  ["manual_etica", /\b(manual\s*[- ]?(e|é)tica|guia\s*(e|é)tica|prote(c|ç)(a|ã)o\s+imagem)\b/],
  ["estrategia_social", /\b(estrat(e|é)gia-social|plano instagram|estrat(e|é)gia redes)\b/],
  ["resumo_breve", /\b(resumo_breve|resumo breve)\b/],
  ["reel", /\b(reel|v(i|í)deo(?!\s+para)|roteiro|script)\b/],
  ["stories", /\b(stories?|storys?)\b/],
  ["aviso", /\b(aviso|comunicado|lembrete|aten(c|ç)(a|ã)o)\b/],
  ["guia", /\b(guia|manual|passo a passo|tutorial)\b/],
  ["esboco", /\b(esbo(c|ç)o|outline|t(o|ó)picos|estrutura)\b/],
  ["versiculos_citados", /\b(vers(i|í)culos citados|refer(e|ê)ncias b(i|í)blicas|passagens mencionadas)\b/],
  ["trilha_oracao", /\b(trilha de ora(c|ç)(a|ã)o|roteiro de ora(c|ç)(a|ã)o|guia de intercess(a|ã)o)\b/],
  ["qa_estruturado", /\b(perguntas e respostas|q&a|d(u|ú)vidas frequentes|faq)\b/],
  ["convite_grupos", /\b(convite para grupo|chamado para c(e|é)lula|junte-se ao|entre no grupo)\b/],
  ["discipulado", /\b(discipulado|mentoria|acompanhamento espiritual)\b/],
  ["desafio_semanal", /\b(desafio|challenge|compromisso semanal|miss(a|ã)o|jornada)\b/],
  ["estudo", /\b(estudo b(i|í)blico|estudo|an(a|á)lise b(i|í)blica|exegese)\b/],
  ["resumo", /\b(resumo|resumir|sintetize|principais pontos|s(i|í)ntese)\b/],
  ["devocional", /\b(devocional|medita(c|ç)(a|ã)o|reflex(a|ã)o di(a|á)ria)\b/],
  ["perguntas", /\b(perguntas|quest(o|õ)es|discuss(a|ã)o|c(e|é)lula)\b/],
  ["post", /\b(post|publica(c|ç)(a|ã)o|legenda)\b/],
  ["ideia_estrategica", /\b(ideia|viral|campanha|estrat(e|é)gia|plano de conte(u|ú)do|s(e|é)rie)\b/],
  ["convite", /\b(convite|convidar|chamado para|venha para|participe)\b/],
];

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export const isContentType = (value: string): value is ContentType =>
  (patterns as [ContentType, RegExp][]).some(([type]) => type === value);

export function detectContentTypes(input: string): ContentType[] {
  const normalized = normalize(input);
  const found: ContentType[] = [];

  for (const [type, regex] of patterns) {
    if (regex.test(normalized)) {
      found.push(type);
    }
  }

  return found.length > 0 ? found : ["post"];
}
