/**
 * Utilitário centralizado de normalização de dados de conteúdo
 * 
 * Este módulo resolve o problema de inconsistência entre estruturas JSON
 * geradas pelo backend e o que cada View espera receber.
 */

// ============================================
// INTERFACES PADRONIZADAS POR TIPO
// ============================================

export interface NormalizedSlide {
  numero: number;
  titulo: string;
  conteudo: string;
  imagem_sugerida?: string;
  chamada_para_acao?: string;
  versiculo?: string;
}

export interface NormalizedStory {
  numero: number;
  titulo: string;
  texto: string;
  versiculo?: string;
  call_to_action?: string;
  timing?: string;
  sugestao_visual?: string;
}

export interface NormalizedCena {
  numero: number;
  duracao: string;
  visual: string;
  audio: string;
  texto_overlay?: string;
}

export interface NormalizedPost {
  texto: string;
  legenda?: string;
  hashtags?: string[];
}

export interface NormalizedDicaProducao {
  formato?: string;
  estilo?: string;
  horario?: string;
  hashtags?: string[];
  copywriting?: string;
  cta?: string;
}

export interface NormalizedFundamentoBiblico {
  versiculos: string[];
  contexto: string;
  principio: string;
}

// ============================================
// FUNÇÕES DE NORMALIZAÇÃO
// ============================================

/**
 * Normaliza dados de carrossel de múltiplas estruturas possíveis
 */
export function normalizeCarrosselData(data: any): {
  slides: NormalizedSlide[];
  legenda?: string;
  dicaProducao?: NormalizedDicaProducao;
  fundamento?: NormalizedFundamentoBiblico;
} {
  const rawSlides = 
    data?.estrutura_visual?.slides ||
    data?.estrutura_visual?.cards ||
    data?.estrutura?.slides ||
    data?.estrutura?.cards ||
    data?.carrossel?.slides ||
    data?.slides ||
    data?.cards ||
    [];

  const slides: NormalizedSlide[] = rawSlides.map((slide: any, index: number) => ({
    numero: slide.numero_slide || slide.numero || index + 1,
    titulo: slide.titulo_slide || slide.titulo || `Slide ${index + 1}`,
    conteudo: slide.conteudo || slide.texto || slide.content || '',
    imagem_sugerida: slide.imagem_sugerida || slide.imagem || slide.visual,
    chamada_para_acao: slide.chamada_para_acao || slide.cta || slide.call_to_action,
    versiculo: slide.versiculo || slide.versiculo_base,
  }));

  const legenda = data?.conteudo?.legenda || data?.legenda || data?.caption;

  const rawDica = data?.dica_producao || data?.dicas || {};
  const dicaProducao: NormalizedDicaProducao = {
    formato: rawDica.formato,
    estilo: rawDica.estilo,
    horario: rawDica.horario || rawDica.melhor_horario,
    hashtags: rawDica.hashtags || data?.conteudo?.hashtags || data?.hashtags,
    copywriting: rawDica.copywriting,
    cta: rawDica.cta,
  };

  const rawFundamento = data?.fundamento_biblico || data?.fundamento || {};
  const fundamento: NormalizedFundamentoBiblico | undefined = rawFundamento.versiculos ? {
    versiculos: Array.isArray(rawFundamento.versiculos) 
      ? rawFundamento.versiculos 
      : [rawFundamento.versiculos],
    contexto: rawFundamento.contexto || '',
    principio: rawFundamento.principio || rawFundamento.principio_atemporal || '',
  } : undefined;

  return { slides, legenda, dicaProducao, fundamento };
}

/**
 * Normaliza dados de stories de múltiplas estruturas possíveis
 */
export function normalizeStoriesData(data: any): {
  slides: NormalizedStory[];
  legenda?: string;
  hashtags?: string[];
} {
  const rawSlides = 
    data?.stories?.slides ||
    data?.stories ||
    data?.estrutura?.slides ||
    data?.slides ||
    (Array.isArray(data?.fundamento_biblico?.versiculos) && 
     data?.fundamento_biblico?.versiculos[0]?.texto 
      ? data.fundamento_biblico.versiculos 
      : null) ||
    [];

  if (rawSlides.length === 0 && (data?.conteudo?.legenda || data?.conteudo?.texto)) {
    return {
      slides: [{
        numero: 1,
        titulo: 'Story',
        texto: data?.conteudo?.legenda || data?.conteudo?.texto || 'Conteúdo não formatado corretamente',
        call_to_action: data?.conteudo?.cta,
      }],
      legenda: undefined,
      hashtags: data?.conteudo?.hashtags || data?.dica_producao?.hashtags,
    };
  }

  const slides: NormalizedStory[] = rawSlides.map((story: any, index: number) => ({
    numero: story.numero || index + 1,
    titulo: story.titulo || story.dia || `Story ${index + 1}`,
    texto: story.texto || story.conteudo || story.mensagem || story.aplicacao || '',
    versiculo: story.versiculo || story.referencia,
    call_to_action: story.call_to_action || story.cta || story.chamada_para_acao,
    timing: story.timing || '5s',
    sugestao_visual: story.sugestao_visual || story.visual,
  }));

  return {
    slides,
    legenda: data?.conteudo?.legenda,
    hashtags: data?.conteudo?.hashtags || data?.dica_producao?.hashtags,
  };
}

/**
 * Normaliza dados de reel de múltiplas estruturas possíveis
 */
export function normalizeReelData(data: any): {
  cenas: NormalizedCena[];
  legenda?: string;
  hashtags?: string[];
  hook?: string;
  duracao?: string;
} {
  const rawCenas = 
    data?.roteiro?.cenas ||
    data?.roteiro_video?.cenas ||
    data?.estrutura_visual?.cenas ||
    data?.cenas ||
    [];

  if (rawCenas.length === 0 && (data?.roteiro || data?.estrutura_visual?.roteiro)) {
    const roteiroText = typeof data?.roteiro === 'string' 
      ? data.roteiro 
      : data?.estrutura_visual?.roteiro || '';
    
    if (roteiroText) {
      return {
        cenas: [{
          numero: 1,
          duracao: data?.estrutura_visual?.duracao_total || '15-30s',
          visual: 'Seguir roteiro abaixo',
          audio: roteiroText,
        }],
        legenda: data?.conteudo?.legenda,
        hashtags: data?.conteudo?.hashtags || data?.dica_producao?.hashtags,
        hook: data?.hook || data?.conteudo?.hook,
        duracao: data?.estrutura_visual?.duracao_total || data?.duracao,
      };
    }
  }

  const cenas: NormalizedCena[] = rawCenas.map((cena: any, index: number) => ({
    numero: cena.numero || index + 1,
    duracao: cena.duracao || cena.tempo || '3-5s',
    visual: cena.visual || cena.descricao_visual || '',
    audio: cena.audio || cena.texto || cena.script || cena.fala || '',
    texto_overlay: cena.texto_overlay || cena.texto_tela,
  }));

  return {
    cenas,
    legenda: data?.conteudo?.legenda,
    hashtags: data?.conteudo?.hashtags || data?.dica_producao?.hashtags,
    hook: data?.hook || data?.conteudo?.hook,
    duracao: data?.estrutura_visual?.duracao_total || data?.duracao,
  };
}

/**
 * Normaliza dados de post simples
 */
export function normalizePostData(data: any): NormalizedPost {
  return {
    texto: data?.conteudo?.texto || data?.conteudo?.legenda || data?.texto || data?.legenda || '',
    legenda: data?.conteudo?.legenda || data?.legenda,
    hashtags: data?.conteudo?.hashtags || data?.dica_producao?.hashtags || data?.hashtags,
  };
}

// ============================================
// NORMALIZADORES PARA TIPOS ESPECÍFICOS
// ============================================

/**
 * Normaliza dados de calendário editorial
 */
export function normalizeCalendarioData(data: any): {
  periodo: string;
  objetivo: string;
  postagens: Array<{
    dia: string;
    horario_sugerido: string;
    formato: string;
    tema: string;
    pilar: string;
    versiculo_base?: string;
    objetivo_do_post: string;
  }>;
  observacoes?: string;
} {
  const cal = data?.calendario || data?.calendario_editorial || data?.data?.calendario || data;
  
  const rawPostagens = cal?.postagens || cal?.posts || cal?.dias || [];
  
  const postagens = rawPostagens.map((p: any, i: number) => ({
    dia: p.dia || p.data || `Dia ${i + 1}`,
    horario_sugerido: p.horario_sugerido || p.horario || p.melhor_horario || '18:00',
    formato: p.formato || p.tipo || 'Post',
    tema: p.tema || p.titulo || p.assunto || '',
    pilar: p.pilar || 'EDIFICAR',
    versiculo_base: p.versiculo_base || p.versiculo,
    objetivo_do_post: p.objetivo_do_post || p.objetivo || p.descricao || '',
  }));

  return {
    periodo: cal?.periodo || data?.titulo || 'Calendário Semanal',
    objetivo: cal?.objetivo || cal?.objetivo_geral || '',
    postagens,
    observacoes: cal?.observacoes || cal?.dicas,
  };
}

/**
 * Normaliza dados de desafio semanal
 */
export function normalizeDesafioSemanalData(data: any): {
  titulo: string;
  objetivo_espiritual: string;
  objetivo_pratico: string;
  como_funciona: string;
  dias: Array<{
    dia: number;
    acao: string;
    versiculo_do_dia: string;
    reflexao: string;
    exemplo_pratico: string;
  }>;
  como_compartilhar: {
    hashtag: string;
    sugestao_post: string;
    formato: string;
  };
  metricas_de_impacto: {
    individual: string;
    comunitario: string;
  };
  fundamento_biblico?: NormalizedFundamentoBiblico;
} {
  const desafio = data?.desafio_semanal || data?.desafio || data;
  const fundamento = data?.fundamento_biblico;
  
  // Normalizar dias de diferentes estruturas
  let dias = desafio?.dias || [];
  
  // Se veio como objeto dia_1, dia_2, etc
  if (dias.length === 0 && desafio?.dia_1) {
    dias = [];
    for (let i = 1; i <= 7; i++) {
      const diaKey = `dia_${i}`;
      if (desafio[diaKey]) {
        const d = desafio[diaKey];
        dias.push({
          dia: i,
          acao: d.desafio || d.acao || d.titulo || '',
          versiculo_do_dia: d.reflexao || d.versiculo || '',
          reflexao: typeof d.reflexao === 'string' ? d.reflexao : '',
          exemplo_pratico: d.exemplo || d.exemplo_pratico || '',
        });
      }
    }
  }

  return {
    titulo: desafio?.titulo || data?.titulo || 'Desafio Semanal',
    objetivo_espiritual: desafio?.objetivo_espiritual || desafio?.objetivo || '',
    objetivo_pratico: desafio?.objetivo_pratico || '',
    como_funciona: desafio?.como_funciona || '',
    dias: dias.map((d: any, i: number) => ({
      dia: d.dia || i + 1,
      acao: d.acao || d.desafio || d.titulo || '',
      versiculo_do_dia: d.versiculo_do_dia || d.versiculo || '',
      reflexao: d.reflexao || '',
      exemplo_pratico: d.exemplo_pratico || d.exemplo || '',
    })),
    como_compartilhar: {
      hashtag: desafio?.como_compartilhar?.hashtag || '#DesafioSemanal',
      sugestao_post: desafio?.como_compartilhar?.sugestao_post || '',
      formato: desafio?.como_compartilhar?.formato || 'Story',
    },
    metricas_de_impacto: {
      individual: desafio?.metricas_de_impacto?.individual || desafio?.impacto?.individual || '',
      comunitario: desafio?.metricas_de_impacto?.comunitario || desafio?.impacto?.comunitario || '',
    },
    fundamento_biblico: fundamento ? {
      versiculos: Array.isArray(fundamento.versiculos) ? fundamento.versiculos : [fundamento.versiculos || ''],
      contexto: fundamento.contexto || '',
      principio: fundamento.principio || fundamento.principio_atemporal || '',
    } : undefined,
  };
}

/**
 * Normaliza dados de campanha temática
 */
export function normalizeCampanhaTematicaData(data: any): {
  titulo: string;
  duracao: string;
  objetivo_geral: string;
  semanas: Array<{
    numero: number;
    tema: string;
    objetivo: string;
    formatos_sugeridos: string[];
    exemplo_post: string;
    metricas: string[];
  }>;
} {
  const campanha = data?.campanha || data?.campanha_tematica || data;
  const rawSemanas = campanha?.semanas || campanha?.fases || [];

  return {
    titulo: campanha?.titulo || data?.titulo || 'Campanha Temática',
    duracao: campanha?.duracao || campanha?.periodo || '4 semanas',
    objetivo_geral: campanha?.objetivo_geral || campanha?.objetivo || '',
    semanas: rawSemanas.map((s: any, i: number) => ({
      numero: s.numero || s.semana || i + 1,
      tema: s.tema || s.titulo || '',
      objetivo: s.objetivo || '',
      formatos_sugeridos: s.formatos_sugeridos || s.formatos || [],
      exemplo_post: s.exemplo_post || s.exemplo || '',
      metricas: s.metricas || [],
    })),
  };
}

/**
 * Normaliza dados de manual de ética
 */
export function normalizeManualEticaData(data: any): {
  titulo: string;
  introducao: string;
  principios_gerais: string[];
  secoes: Array<{
    titulo: string;
    contexto: string;
    fazer: string[];
    nao_fazer: string[];
    exemplo_pratico: string;
  }>;
} {
  const manual = data?.manual || data?.manual_etica || data;

  return {
    titulo: manual?.titulo || data?.titulo || 'Manual de Ética',
    introducao: manual?.introducao || '',
    principios_gerais: manual?.principios_gerais || manual?.principios || [],
    secoes: (manual?.secoes || manual?.diretrizes || []).map((s: any) => ({
      titulo: s.titulo || '',
      contexto: s.contexto || s.descricao || '',
      fazer: s.fazer || s.deve_fazer || [],
      nao_fazer: s.nao_fazer || s.evitar || [],
      exemplo_pratico: s.exemplo_pratico || s.exemplo || '',
    })),
  };
}

/**
 * Normaliza dados de Q&A estruturado
 */
export function normalizeQAEstruturadoData(data: any): {
  tema: string;
  introducao: string;
  questoes: Array<{
    numero: number;
    pergunta: string;
    resposta: string;
    versiculo_relacionado: string;
  }>;
} {
  const qa = data?.qa || data?.qa_estruturado || data?.perguntas_respostas || data;
  const rawQuestoes = qa?.questoes || qa?.perguntas || qa?.items || [];

  return {
    tema: qa?.tema || data?.titulo || 'Perguntas e Respostas',
    introducao: qa?.introducao || '',
    questoes: rawQuestoes.map((q: any, i: number) => ({
      numero: q.numero || i + 1,
      pergunta: q.pergunta || q.questao || '',
      resposta: q.resposta || '',
      versiculo_relacionado: q.versiculo_relacionado || q.versiculo || '',
    })),
  };
}

/**
 * Normaliza dados de estratégia social
 */
export function normalizeEstrategiaSocialData(data: any): {
  titulo: string;
  objetivo_estrategico: string;
  publico_alvo: string;
  pilares_conteudo: Array<{
    nome: string;
    descricao: string;
    frequencia: string;
    exemplos: string[];
  }>;
  metricas_acompanhamento: Array<{
    metrica: string;
    meta: string;
    como_medir: string;
  }>;
  proximos_passos: string[];
} {
  const estrategia = data?.estrategia || data?.estrategia_social || data?.plano || data;

  return {
    titulo: estrategia?.titulo || data?.titulo || 'Estratégia Social',
    objetivo_estrategico: estrategia?.objetivo_estrategico || estrategia?.objetivo || '',
    publico_alvo: estrategia?.publico_alvo || estrategia?.publico || '',
    pilares_conteudo: (estrategia?.pilares_conteudo || estrategia?.pilares || []).map((p: any) => ({
      nome: p.nome || p.titulo || '',
      descricao: p.descricao || '',
      frequencia: p.frequencia || '',
      exemplos: p.exemplos || [],
    })),
    metricas_acompanhamento: (estrategia?.metricas_acompanhamento || estrategia?.metricas || []).map((m: any) => ({
      metrica: m.metrica || m.nome || '',
      meta: m.meta || '',
      como_medir: m.como_medir || m.medicao || '',
    })),
    proximos_passos: estrategia?.proximos_passos || estrategia?.acoes || [],
  };
}

/**
 * Normaliza dados de treino de voluntário
 */
export function normalizeTreinoVoluntarioData(data: any): {
  titulo: string;
  area_ministerio: string;
  nivel: string;
  duracao_estimada: string;
  modulos: Array<{
    numero: number;
    titulo: string;
    objetivos: string[];
    conteudo_teorico: string;
    exercicio_pratico: string;
  }>;
  checklist_competencias: string[];
} {
  const treino = data?.treino || data?.treino_voluntario || data?.treinamento || data;

  return {
    titulo: treino?.titulo || data?.titulo || 'Treino de Voluntário',
    area_ministerio: treino?.area_ministerio || treino?.area || treino?.ministerio || '',
    nivel: treino?.nivel || 'Iniciante',
    duracao_estimada: treino?.duracao_estimada || treino?.duracao || '1 hora',
    modulos: (treino?.modulos || treino?.aulas || []).map((m: any, i: number) => ({
      numero: m.numero || i + 1,
      titulo: m.titulo || '',
      objetivos: m.objetivos || [],
      conteudo_teorico: m.conteudo_teorico || m.conteudo || m.teoria || '',
      exercicio_pratico: m.exercicio_pratico || m.exercicio || m.pratica || '',
    })),
    checklist_competencias: treino?.checklist_competencias || treino?.competencias || [],
  };
}

/**
 * Normaliza dados de kit básico
 */
export function normalizeKitBasicoData(data: any): {
  titulo: string;
  finalidade: string;
  orcamento_estimado: string;
  itens: Array<{
    categoria: string;
    nome: string;
    especificacao: string;
    preco_referencia: string;
    alternativa_economica?: string;
    link_referencia?: string;
  }>;
  dicas_uso: string[];
} {
  const kit = data?.kit || data?.kit_basico || data;

  return {
    titulo: kit?.titulo || data?.titulo || 'Kit Básico',
    finalidade: kit?.finalidade || kit?.descricao || kit?.objetivo || '',
    orcamento_estimado: kit?.orcamento_estimado || kit?.orcamento || 'A definir',
    itens: (kit?.itens || kit?.equipamentos || kit?.lista || []).map((item: any) => ({
      categoria: item.categoria || 'Geral',
      nome: item.nome || item.item || '',
      especificacao: item.especificacao || item.descricao || '',
      preco_referencia: item.preco_referencia || item.preco || '',
      alternativa_economica: item.alternativa_economica || item.alternativa,
      link_referencia: item.link_referencia || item.link,
    })),
    dicas_uso: kit?.dicas_uso || kit?.dicas || [],
  };
}

// ============================================
// FUNÇÃO UNIVERSAL DE NORMALIZAÇÃO
// ============================================

/**
 * Normaliza dados de qualquer tipo de conteúdo
 */
export function normalizeContentData(data: any, contentType: string): any {
  if (!data || typeof data !== 'object') {
    return { _empty: true, _type: contentType };
  }

  switch (contentType.toLowerCase().replace(/_/g, '')) {
    case 'carrossel':
    case 'carousel':
      return { ...normalizeCarrosselData(data), _normalized: true };
    
    case 'stories':
    case 'story':
      return { ...normalizeStoriesData(data), _normalized: true };
    
    case 'reel':
    case 'reels':
      return { ...normalizeReelData(data), _normalized: true };
    
    case 'post':
    case 'postsimples':
      return { ...normalizePostData(data), _normalized: true };
    
    case 'calendario':
    case 'calendar':
      return { calendario: normalizeCalendarioData(data), _normalized: true };
    
    case 'desafiosemanal':
    case 'desafio':
      return { 
        desafio_semanal: normalizeDesafioSemanalData(data).dias.length > 0 
          ? normalizeDesafioSemanalData(data) 
          : data?.desafio_semanal || data,
        fundamento_biblico: normalizeDesafioSemanalData(data).fundamento_biblico || data?.fundamento_biblico,
        _normalized: true 
      };
    
    case 'campanhatematica':
    case 'campanha':
      return { data: normalizeCampanhaTematicaData(data), _normalized: true };
    
    case 'manualetica':
      return { data: normalizeManualEticaData(data), _normalized: true };
    
    case 'qaestruturado':
    case 'qa':
      return { qa: normalizeQAEstruturadoData(data), _normalized: true };
    
    case 'estrategiasocial':
    case 'estrategia':
      return { data: normalizeEstrategiaSocialData(data), _normalized: true };
    
    case 'treinovoluntario':
    case 'treino':
      return { data: normalizeTreinoVoluntarioData(data), _normalized: true };
    
    case 'kitbasico':
    case 'kit':
      return { data: normalizeKitBasicoData(data), _normalized: true };
    
    default:
      // Para tipos não normalizados, retornar dados originais com marcação
      return { ...data, _normalized: false, _type: contentType };
  }
}

/**
 * Detecta o tipo real do conteúdo baseado na estrutura dos dados
 */
export function detectRealContentType(data: any, declaredType: string): string {
  if (data?.estrutura_visual?.slides || data?.carrossel?.slides || data?.slides) {
    const slides = data?.estrutura_visual?.slides || data?.carrossel?.slides || data?.slides;
    if (Array.isArray(slides) && slides.length > 0) {
      const firstSlide = slides[0];
      if (firstSlide.conteudo || firstSlide.texto) {
        return 'carrossel';
      }
    }
  }

  if (data?.stories?.slides || (Array.isArray(data?.stories) && data.stories.length > 0)) {
    return 'stories';
  }

  if (data?.roteiro?.cenas || data?.estrutura_visual?.cenas) {
    return 'reel';
  }

  if (data?.devocional?.reflexao || data?.devocional?.oracao) {
    return 'devocional';
  }

  if (data?.estudo_biblico || data?.estudo) {
    return 'estudo';
  }

  if (data?.conteudo?.legenda && !data?.estrutura_visual && !data?.stories) {
    return 'post';
  }

  return declaredType;
}

/**
 * Verifica se os dados estão vazios ou mal formatados
 */
export function isContentEmpty(data: any, contentType: string): boolean {
  if (!data || typeof data !== 'object') return true;
  
  switch (contentType) {
    case 'carrossel': {
      const normalized = normalizeCarrosselData(data);
      return normalized.slides.length === 0;
    }
    case 'stories': {
      const normalized = normalizeStoriesData(data);
      return normalized.slides.length === 0;
    }
    case 'reel': {
      const normalized = normalizeReelData(data);
      return normalized.cenas.length === 0 && !normalized.legenda;
    }
    case 'post': {
      const normalized = normalizePostData(data);
      return !normalized.texto && !normalized.legenda;
    }
    default:
      return Object.keys(data).length === 0;
  }
}
