import { useMemo } from "react";

export type ContentFormat = "blog" | "carrossel" | "email" | "roteiro_video" | "post_curto";

export interface ContentTemplateField {
  label: string;
  description: string;
  required?: boolean;
  hint?: string;
}

export interface ContentTemplate {
  name: string;
  minWords?: number;
  maxWords?: number;
  fields: ContentTemplateField[];
  suggestions: string[];
}

const TEMPLATE_MAP: Record<ContentFormat, ContentTemplate> = {
  blog: {
    name: "Blog",
    minWords: 500,
    maxWords: 750,
    fields: [
      { label: "Estratégia", description: "Público, dor e benefício central", required: true },
      { label: "Título", description: "Headline até 60 caracteres", required: true },
      { label: "Resumo", description: "Resumo de 60-120 palavras", required: true },
      { label: "Corpo", description: "Seções H2/H3 com parágrafos e bullets", required: true },
      { label: "CTA", description: "3 variações de chamada para ação", required: true },
      { label: "Metadados", description: "Keywords e hashtags ao final", required: true },
      { label: "Suposições", description: "Assumptions explícitas se faltarem dados" },
    ],
    suggestions: ["Inclua links internos sugeridos", "Traga 1 dado ou estatística"],
  },
  carrossel: {
    name: "Carrossel Instagram",
    minWords: 150,
    maxWords: 280,
    fields: [
      { label: "Estratégia", description: "Gancho e benefício para o público", required: true },
      { label: "Slides", description: "6-8 slides numerados com título e copy curta", required: true },
      { label: "CTA", description: "Call-to-action no último slide", required: true },
      { label: "Metadados", description: "Hashtags e keywords", required: true },
      { label: "Suposições", description: "Contexto assumido para preencher gaps" },
    ],
    suggestions: ["Evite blocos de texto longos", "Use bullets curtos por slide"],
  },
  email: {
    name: "E-mail",
    minWords: 140,
    maxWords: 220,
    fields: [
      { label: "Assunto", description: "Linha de assunto atraente", required: true },
      { label: "Pré-header", description: "Prévia de 40-60 caracteres", required: true },
      { label: "Corpo", description: "Blocos curtos com parágrafos e bullets", required: true },
      { label: "CTA", description: "Link clicável com âncora clara", required: true },
      { label: "Metadados", description: "Palavras-chave de campanha" },
      { label: "Suposições", description: "Se dados faltarem" },
    ],
    suggestions: ["Inclua benefício tangível", "Use tom conversacional"],
  },
  roteiro_video: {
    name: "Roteiro de Vídeo",
    minWords: 120,
    maxWords: 200,
    fields: [
      { label: "Gancho", description: "Abertura de até 5 segundos", required: true },
      { label: "Apresentação", description: "Quem fala e autoridade", required: true },
      { label: "Pontos-chave", description: "3-4 tópicos com falas curtas", required: true },
      { label: "Fechamento", description: "Resumo + CTA", required: true },
      { label: "Sugestões de cena", description: "B-roll ou enquadramento" },
      { label: "Metadados", description: "Hashtags e keywords" },
      { label: "Suposições", description: "Contexto" },
    ],
    suggestions: ["Sempre inclua CTA de retenção", "Frases curtas para dublagem"],
  },
  post_curto: {
    name: "Post Curto",
    minWords: 80,
    maxWords: 140,
    fields: [
      { label: "Headline", description: "Título chamativo", required: true },
      { label: "Corpo", description: "Texto corrido ou bullets", required: true },
      { label: "CTA", description: "Fechamento objetivo", required: true },
      { label: "Metadados", description: "Hashtags e keywords" },
      { label: "Suposições", description: "Premissas usadas" },
    ],
    suggestions: ["Mantenha frases curtas", "Use 1 emoji moderadamente"],
  },
};

export function useContentTemplates() {
  const templates = useMemo(() => TEMPLATE_MAP, []);

  const getPrompt = (
    topic: string,
    audience: string,
    tone: string,
    goal: string,
    persona: string,
    formats: ContentFormat[],
  ) => {
    const selected = formats.map((format) => TEMPLATE_MAP[format].name).join(", ");
    return [
      `Tema: ${topic}`,
      `Público: ${audience}`,
      `Tom: ${tone}`,
      `Objetivo: ${goal}`,
      `Persona/voz: ${persona}`,
      `Formatos: ${selected}`,
      "Estrutura obrigatória: estratégia, título/headline, resumo, corpo (H2/H3 ou slides), CTA x3, metadados, suposições.",
      "Aplique AIDA/PPA e mantenha metadados no final.",
    ].join("\n");
  };

  return { templates, getPrompt };
}
