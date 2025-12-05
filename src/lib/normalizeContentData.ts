/**
 * Utilitário centralizado de normalização de dados de conteúdo
 * 
 * Este módulo resolve o problema de inconsistência entre estruturas JSON
 * geradas pelo backend e o que cada View espera receber.
 * 
 * A IA pode retornar dados em diferentes formatos. Este normalizador
 * garante que cada View receba dados no formato esperado.
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
  // Buscar slides em todas as localizações possíveis
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

  // Normalizar legenda
  const legenda = 
    data?.conteudo?.legenda ||
    data?.legenda ||
    data?.caption ||
    undefined;

  // Normalizar dicas de produção
  const rawDica = data?.dica_producao || data?.dicas || {};
  const dicaProducao: NormalizedDicaProducao = {
    formato: rawDica.formato,
    estilo: rawDica.estilo,
    horario: rawDica.horario || rawDica.melhor_horario,
    hashtags: rawDica.hashtags || data?.conteudo?.hashtags || data?.hashtags,
    copywriting: rawDica.copywriting,
    cta: rawDica.cta,
  };

  // Normalizar fundamento bíblico
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
  // Buscar stories/slides em todas as localizações possíveis
  const rawSlides = 
    data?.stories?.slides ||
    data?.stories ||
    data?.estrutura?.slides ||
    data?.slides ||
    // Se recebeu formato de array direto de versículos (comum quando IA confunde)
    (Array.isArray(data?.fundamento_biblico?.versiculos) && 
     data?.fundamento_biblico?.versiculos[0]?.texto 
      ? data.fundamento_biblico.versiculos 
      : null) ||
    [];

  // Se recebeu um formato de post ao invés de stories, criar um story fake para exibir
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
  // Buscar cenas em todas as localizações possíveis
  const rawCenas = 
    data?.roteiro?.cenas ||
    data?.roteiro_video?.cenas ||
    data?.estrutura_visual?.cenas ||
    data?.cenas ||
    [];

  // Se não tem cenas mas tem roteiro como string, criar cena única
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

/**
 * Normaliza dados de devocional
 */
export function normalizeDevocionalData(data: any): {
  titulo: string;
  versiculo: string;
  textoVersiculo: string;
  reflexao: string;
  oracao: string;
  desafioDoDia: string;
  aplicacaoPratica?: string;
  perguntasPessoais?: string[];
  fundamento?: NormalizedFundamentoBiblico;
} {
  const devocional = data?.devocional || data;
  const fundamento = data?.fundamento_biblico;

  return {
    titulo: data?.titulo || devocional?.titulo || 'Devocional',
    versiculo: devocional?.versiculo || fundamento?.versiculos?.[0] || '',
    textoVersiculo: devocional?.texto_versiculo || '',
    reflexao: devocional?.reflexao || '',
    oracao: devocional?.oracao || '',
    desafioDoDia: devocional?.desafio_do_dia || devocional?.desafio || '',
    aplicacaoPratica: devocional?.aplicacao_pratica,
    perguntasPessoais: devocional?.perguntas_pessoais,
    fundamento: fundamento ? {
      versiculos: Array.isArray(fundamento.versiculos) ? fundamento.versiculos : [fundamento.versiculos],
      contexto: fundamento.contexto || '',
      principio: fundamento.principio || fundamento.principio_atemporal || '',
    } : undefined,
  };
}

/**
 * Normaliza dados de estudo bíblico
 */
export function normalizeEstudoData(data: any): {
  titulo: string;
  passagemPrincipal: string;
  introducao: string;
  contextoHistorico: string;
  pontosPrincipais: Array<{
    ponto: string;
    explicacao: string;
    aplicacao: string;
  }>;
  perguntasDiscussao: string[];
  desafioPratico: string;
  fundamento?: NormalizedFundamentoBiblico;
} {
  const estudo = data?.estudo_biblico || data?.estudo || data;
  const fundamento = data?.fundamento_biblico;

  // Normalizar pontos principais de diferentes estruturas
  const rawPontos = estudo?.pontos_principais || estudo?.desenvolvimento || [];
  const pontosPrincipais = rawPontos.map((p: any) => ({
    ponto: p.ponto || p.titulo || '',
    explicacao: p.explicacao || p.conteudo || '',
    aplicacao: p.aplicacao || '',
  }));

  return {
    titulo: data?.titulo || estudo?.tema || estudo?.titulo || 'Estudo Bíblico',
    passagemPrincipal: data?.passagem_principal || estudo?.passagem || fundamento?.versiculos?.[0] || '',
    introducao: estudo?.introducao || '',
    contextoHistorico: estudo?.contexto_historico || fundamento?.contexto || '',
    pontosPrincipais,
    perguntasDiscussao: estudo?.perguntas_discussao || estudo?.perguntas || [],
    desafioPratico: estudo?.desafio_pratico || estudo?.desafio || '',
    fundamento: fundamento ? {
      versiculos: Array.isArray(fundamento.versiculos) ? fundamento.versiculos : [fundamento.versiculos],
      contexto: fundamento.contexto || '',
      principio: fundamento.principio || fundamento.principio_atemporal || '',
    } : undefined,
  };
}

/**
 * Detecta o tipo real do conteúdo baseado na estrutura dos dados
 * Útil quando content_type salvo não corresponde à estrutura real
 */
export function detectRealContentType(data: any, declaredType: string): string {
  // Se tem slides de carrossel
  if (data?.estrutura_visual?.slides || data?.carrossel?.slides || data?.slides) {
    const slides = data?.estrutura_visual?.slides || data?.carrossel?.slides || data?.slides;
    if (Array.isArray(slides) && slides.length > 0) {
      // Verificar se parece carrossel (tem conteudo/texto longo)
      const firstSlide = slides[0];
      if (firstSlide.conteudo || firstSlide.texto) {
        return 'carrossel';
      }
    }
  }

  // Se tem stories
  if (data?.stories?.slides || (Array.isArray(data?.stories) && data.stories.length > 0)) {
    return 'stories';
  }

  // Se tem roteiro com cenas
  if (data?.roteiro?.cenas || data?.estrutura_visual?.cenas) {
    return 'reel';
  }

  // Se tem devocional estruturado
  if (data?.devocional?.reflexao || data?.devocional?.oracao) {
    return 'devocional';
  }

  // Se tem estudo_biblico
  if (data?.estudo_biblico || data?.estudo) {
    return 'estudo';
  }

  // Se tem só legenda (post simples)
  if (data?.conteudo?.legenda && !data?.estrutura_visual && !data?.stories) {
    return 'post';
  }

  // Retornar tipo declarado se não conseguir detectar
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
    case 'devocional': {
      const normalized = normalizeDevocionalData(data);
      return !normalized.reflexao && !normalized.oracao;
    }
    case 'estudo': {
      const normalized = normalizeEstudoData(data);
      return normalized.pontosPrincipais.length === 0 && !normalized.introducao;
    }
    default:
      // Para outros tipos, verificar se tem algum conteúdo significativo
      return Object.keys(data).length === 0;
  }
}
