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

/**
 * Normaliza dados de devocional
 */
export function normalizeDevocionalData(data: any): {
  titulo: string;
  reflexao: string;
  perguntas_pessoais: string[];
  oracao: string;
  desafio_do_dia: string;
  versiculo_base?: string;
} {
  const dev = data?.devocional || data;
  
  return {
    titulo: dev?.titulo || data?.titulo || 'Devocional',
    reflexao: dev?.reflexao || dev?.meditacao || dev?.conteudo || '',
    perguntas_pessoais: dev?.perguntas_pessoais || dev?.perguntas || dev?.questoes || [],
    oracao: dev?.oracao || dev?.oracao_sugerida || '',
    desafio_do_dia: dev?.desafio_do_dia || dev?.desafio || dev?.aplicacao_pratica || '',
    versiculo_base: dev?.versiculo_base || dev?.versiculo || data?.fundamento_biblico?.versiculos?.[0],
  };
}

/**
 * Normaliza dados de estudo bíblico
 */
export function normalizeEstudoBiblicoData(data: any): {
  fundamento_biblico: {
    versiculos: string[];
    contexto: string;
    principio_atemporal: string;
  };
  estudo_biblico: {
    tema: string;
    introducao: string;
    desenvolvimento: Array<{
      ponto: string;
      explicacao: string;
      aplicacao: string;
    }>;
    perguntas: string[];
    conclusao: string;
    desafio: string;
  };
} {
  const fb = data?.fundamento_biblico || {};
  const eb = data?.estudo_biblico || data?.estudo || data;
  
  return {
    fundamento_biblico: {
      versiculos: Array.isArray(fb.versiculos) ? fb.versiculos : 
                  fb.versiculos ? [fb.versiculos] : 
                  eb.versiculos ? [eb.versiculos] : [],
      contexto: fb.contexto || eb.contexto_historico || '',
      principio_atemporal: fb.principio_atemporal || fb.principio || eb.principio || '',
    },
    estudo_biblico: {
      tema: eb.tema || data?.titulo || 'Estudo Bíblico',
      introducao: eb.introducao || eb.abertura || '',
      desenvolvimento: (eb.desenvolvimento || eb.pontos || eb.topicos || []).map((d: any, i: number) => ({
        ponto: d.ponto || d.titulo || d.topico || `Ponto ${i + 1}`,
        explicacao: d.explicacao || d.conteudo || d.descricao || '',
        aplicacao: d.aplicacao || d.aplicacao_pratica || '',
      })),
      perguntas: eb.perguntas || eb.perguntas_reflexao || [],
      conclusao: eb.conclusao || eb.fechamento || '',
      desafio: eb.desafio || eb.desafio_semanal || eb.aplicacao || '',
    },
  };
}

/**
 * Normaliza dados de trilha de oração
 */
export function normalizeTrilhaOracaoData(data: any): {
  titulo: string;
  duracao_estimada: string;
  introducao: string;
  etapas: Array<{
    numero: number;
    nome: string;
    orientacao: string;
    versiculo_guia: string;
    tempo_sugerido: string;
  }>;
  encerramento: string;
} {
  const trilha = data?.trilha || data?.trilha_oracao || data;
  
  return {
    titulo: trilha?.titulo || data?.titulo || 'Trilha de Oração',
    duracao_estimada: trilha?.duracao_estimada || trilha?.duracao || '15 minutos',
    introducao: trilha?.introducao || trilha?.abertura || '',
    etapas: (trilha?.etapas || trilha?.passos || trilha?.momentos || []).map((e: any, i: number) => ({
      numero: e.numero || i + 1,
      nome: e.nome || e.titulo || `Etapa ${i + 1}`,
      orientacao: e.orientacao || e.descricao || e.instrucao || '',
      versiculo_guia: e.versiculo_guia || e.versiculo || '',
      tempo_sugerido: e.tempo_sugerido || e.tempo || '3 min',
    })),
    encerramento: trilha?.encerramento || trilha?.conclusao || trilha?.fechamento || '',
  };
}

/**
 * Normaliza dados de convite
 */
export function normalizeConviteData(data: any): {
  titulo_evento: string;
  data: string;
  horario: string;
  local: string;
  descricao: string;
  publico_alvo: string;
  como_participar: string;
  contato?: string;
  chamado_acao: string;
} {
  const convite = data?.convite || data;
  
  return {
    titulo_evento: convite?.titulo_evento || convite?.titulo || data?.titulo || 'Evento',
    data: convite?.data || convite?.data_evento || '[Data a definir]',
    horario: convite?.horario || convite?.hora || '[Horário a definir]',
    local: convite?.local || convite?.endereco || '[Local a definir]',
    descricao: convite?.descricao || convite?.sobre || '',
    publico_alvo: convite?.publico_alvo || convite?.para_quem || 'Todos são bem-vindos',
    como_participar: convite?.como_participar || convite?.inscricao || 'Basta comparecer',
    contato: convite?.contato || convite?.informacoes,
    chamado_acao: convite?.chamado_acao || convite?.cta || 'Participe!',
  };
}

/**
 * Normaliza dados de guia
 */
export function normalizeGuiaData(data: any): {
  titulo: string;
  introducao: string;
  passos: Array<{
    numero: number;
    titulo: string;
    descricao: string;
    dica?: string;
  }>;
  recursos_necessarios: string[];
  conclusao: string;
} {
  const guia = data?.guia || data;
  
  return {
    titulo: guia?.titulo || data?.titulo || 'Guia',
    introducao: guia?.introducao || guia?.abertura || '',
    passos: (guia?.passos || guia?.etapas || guia?.steps || []).map((p: any, i: number) => ({
      numero: p.numero || i + 1,
      titulo: p.titulo || `Passo ${i + 1}`,
      descricao: p.descricao || p.conteudo || '',
      dica: p.dica || p.sugestao,
    })),
    recursos_necessarios: guia?.recursos_necessarios || guia?.recursos || guia?.materiais || [],
    conclusao: guia?.conclusao || guia?.fechamento || '',
  };
}

/**
 * Normaliza dados de aviso
 */
export function normalizeAvisoData(data: any): {
  tipo: string;
  titulo: string;
  mensagem: string;
  data_vigencia: string;
  responsavel: string;
  chamado_acao: string;
} {
  const aviso = data?.aviso || data;
  
  return {
    tipo: aviso?.tipo || aviso?.categoria || 'Informativo',
    titulo: aviso?.titulo || data?.titulo || 'Aviso',
    mensagem: aviso?.mensagem || aviso?.conteudo || aviso?.descricao || '',
    data_vigencia: aviso?.data_vigencia || aviso?.validade || '[Sem prazo]',
    responsavel: aviso?.responsavel || aviso?.autor || '[Não informado]',
    chamado_acao: aviso?.chamado_acao || aviso?.cta || '',
  };
}

/**
 * Normaliza dados de roteiro de vídeo
 */
export function normalizeRoteiroVideoData(data: any): {
  titulo: string;
  duracao_total: string;
  objetivo: string;
  cenas: Array<{
    numero: number;
    duracao: string;
    descricao_visual: string;
    audio_fala: string;
    texto_tela?: string;
  }>;
  equipamentos_sugeridos: string[];
  dicas_gravacao: string[];
} {
  const roteiro = data?.roteiro || data?.roteiro_video || data;
  
  return {
    titulo: roteiro?.titulo || data?.titulo || 'Roteiro de Vídeo',
    duracao_total: roteiro?.duracao_total || roteiro?.duracao || '3-5 min',
    objetivo: roteiro?.objetivo || '',
    cenas: (roteiro?.cenas || roteiro?.sequencias || []).map((c: any, i: number) => ({
      numero: c.numero || i + 1,
      duracao: c.duracao || c.tempo || '10-20s',
      descricao_visual: c.descricao_visual || c.visual || c.imagem || '',
      audio_fala: c.audio_fala || c.audio || c.fala || c.script || '',
      texto_tela: c.texto_tela || c.texto_overlay,
    })),
    equipamentos_sugeridos: roteiro?.equipamentos_sugeridos || roteiro?.equipamentos || [],
    dicas_gravacao: roteiro?.dicas_gravacao || roteiro?.dicas || [],
  };
}

/**
 * Normaliza dados de checklist de culto
 */
export function normalizeChecklistCultoData(data: any): {
  titulo: string;
  data_evento: string;
  responsavel_geral: string;
  categorias: Array<{
    nome: string;
    responsavel: string;
    itens: Array<{
      item: string;
      prazo: string;
      observacao?: string;
    }>;
  }>;
} {
  const checklist = data?.checklist || data?.checklist_culto || data;
  
  return {
    titulo: checklist?.titulo || data?.titulo || 'Checklist do Culto',
    data_evento: checklist?.data_evento || checklist?.data || '[Data a definir]',
    responsavel_geral: checklist?.responsavel_geral || checklist?.responsavel || '[Não definido]',
    categorias: (checklist?.categorias || checklist?.secoes || checklist?.areas || []).map((cat: any) => ({
      nome: cat.nome || cat.titulo || cat.categoria || 'Categoria',
      responsavel: cat.responsavel || '[Não definido]',
      itens: (cat.itens || cat.tarefas || []).map((item: any) => ({
        item: typeof item === 'string' ? item : item.item || item.tarefa || item.descricao || '',
        prazo: typeof item === 'string' ? '' : item.prazo || item.quando || '',
        observacao: typeof item === 'string' ? undefined : item.observacao || item.obs,
      })),
    })),
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

  const typeKey = contentType.toLowerCase().replace(/_/g, '');
  
  switch (typeKey) {
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
    case 'fotopost':
      return { ...normalizePostData(data), _normalized: true };
    
    case 'calendario':
    case 'calendar':
      return { calendario: normalizeCalendarioData(data), _normalized: true };
    
    case 'desafiosemanal':
    case 'desafio':
      const desafioNorm = normalizeDesafioSemanalData(data);
      return { 
        desafio_semanal: desafioNorm.dias.length > 0 ? desafioNorm : data?.desafio_semanal || data,
        fundamento_biblico: desafioNorm.fundamento_biblico || data?.fundamento_biblico,
        _normalized: true 
      };
    
    case 'campanhatematica':
    case 'campanha':
      return { data: normalizeCampanhaTematicaData(data), _normalized: true };
    
    case 'manualetica':
      return { data: normalizeManualEticaData(data), _normalized: true };
    
    case 'qaestruturado':
    case 'qa':
    case 'perguntas':
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
    
    case 'devocional':
      return { data: normalizeDevocionalData(data), _normalized: true };
    
    case 'estudo':
    case 'estudobiblico':
      return { data: normalizeEstudoBiblicoData(data), _normalized: true };
    
    case 'trilhaoracao':
      return { trilha: normalizeTrilhaOracaoData(data), _normalized: true };
    
    case 'convite':
      return { convite: normalizeConviteData(data), _normalized: true };
    
    case 'guia':
      return { guia: normalizeGuiaData(data), _normalized: true };
    
    case 'aviso':
      return { aviso: normalizeAvisoData(data), _normalized: true };
    
    case 'roteirovideo':
      return { roteiro: normalizeRoteiroVideoData(data), _normalized: true };
    
    case 'checklistculto':
      return { checklist: normalizeChecklistCultoData(data), _normalized: true };
    
    case 'convitegrupos':
      return { convite: normalizeConviteData(data), _normalized: true };
    
    case 'resumo':
    case 'resumopregacao':
    case 'resumobreve':
    case 'versiculoscitados':
    case 'esboco':
    case 'ideiastrategica':
    case 'discipulado':
    case 'roteiroreels':
      // Retornar dados originais para tipos que têm views específicas
      return { ...data, _normalized: false, _type: contentType };
    
    default:
      return { ...data, _normalized: false, _type: contentType };
  }
}

/**
 * Detecta o tipo real do conteúdo baseado na estrutura dos dados
 */
export function detectRealContentType(data: any, declaredType: string): string {
  // Priorizar tipo declarado se tiver campo content_type interno
  if (data?.content_type && typeof data.content_type === 'string') {
    return data.content_type;
  }
  
  // Carrossel - múltiplas estruturas possíveis
  if (data?.estrutura_visual?.slides || data?.carrossel?.slides || data?.slides) {
    const slides = data?.estrutura_visual?.slides || data?.carrossel?.slides || data?.slides;
    if (Array.isArray(slides) && slides.length > 0) {
      return 'carrossel';
    }
  }

  // Stories
  if (data?.stories?.slides || (Array.isArray(data?.stories) && data.stories.length > 0)) {
    return 'stories';
  }

  // Reel/Video
  if (data?.roteiro?.cenas || data?.estrutura_visual?.cenas || data?.cenas) {
    return 'reel';
  }

  // Devocional
  if (data?.devocional?.reflexao || data?.devocional?.oracao || data?.devocional?.titulo) {
    return 'devocional';
  }

  // Estudo Bíblico
  if (data?.estudo_biblico || data?.estudo?.tema || data?.estudo?.pontos_principais) {
    return 'estudo';
  }

  // Trilha de Oração
  if (data?.trilha || data?.trilha_oracao?.etapas) {
    return 'trilha_oracao';
  }

  // Convite
  if (data?.convite?.titulo_evento || data?.convite?.data) {
    return 'convite';
  }

  // Guia
  if (data?.guia?.passos || data?.guia?.titulo) {
    return 'guia';
  }

  // Aviso
  if (data?.aviso?.mensagem || data?.aviso?.tipo) {
    return 'aviso';
  }

  // Calendário
  if (data?.calendario || data?.calendario_editorial?.postagens) {
    return 'calendario';
  }

  // Desafio Semanal - múltiplas estruturas
  if (data?.desafio_semanal?.dias || data?.desafio_semanal?.titulo || 
      data?.desafio?.dias || (data?.pontos_principais && declaredType === 'desafio_semanal')) {
    return 'desafio_semanal';
  }

  // Campanha Temática
  if (data?.campanha?.semanas || data?.campanha_tematica?.semanas) {
    return 'campanha_tematica';
  }

  // Manual de Ética
  if (data?.manual?.secoes || data?.manual_etica?.principios_gerais) {
    return 'manual_etica';
  }

  // Q&A Estruturado
  if (data?.qa?.questoes || data?.perguntas_respostas?.questoes) {
    return 'qa_estruturado';
  }
  
  // Estratégia Social
  if (data?.estrategia?.pilares_conteudo || data?.estrategia_social) {
    return 'estrategia_social';
  }
  
  // Treino Voluntário
  if (data?.treino?.modulos || data?.capacitacao) {
    return 'treino_voluntario';
  }
  
  // Kit Básico
  if (data?.kit?.equipamentos || data?.kit?.recursos) {
    return 'kit_basico';
  }
  
  // Checklist Culto
  if (data?.checklist?.itens || data?.checklist?.tarefas) {
    return 'checklist_culto';
  }
  
  // Ideia Estratégica
  if (data?.ideia_estrategica?.proposta || data?.ideia_estrategica?.titulo) {
    return 'ideia_estrategica';
  }
  
  // Esboço de Pregação
  if (data?.esboco?.topicos || data?.esboco?.titulo) {
    return 'esboco';
  }
  
  // Resumo de Pregação
  if (data?.resumo_pregacao?.pontos_principais || data?.resumo_pregacao?.titulo) {
    return 'resumo';
  }
  
  // Resumo Breve - string simples
  if (data?.resumo && typeof data.resumo === 'string' && data.resumo.length > 100) {
    return 'resumo_breve';
  }
  
  // Perguntas para Célula
  if (data?.perguntas_celula?.perguntas_reflexao || data?.perguntas_celula?.tema) {
    return 'perguntas';
  }
  
  // Discipulado
  if (data?.plano_discipulado?.encontros || data?.discipulado) {
    return 'discipulado';
  }
  
  // Versículos Citados
  if (data?.versiculos_citados?.versiculos) {
    return 'versiculos_citados';
  }
  
  // Convite para Grupos
  if (data?.convite_grupos?.tipo_grupo || data?.convite_grupos?.nome_grupo) {
    return 'convite_grupos';
  }
  
  // Roteiro de Reels
  if (data?.roteiro?.script || data?.roteiro?.cenas_rapidas) {
    return 'roteiro_reels';
  }

  // Post simples como fallback
  if (data?.conteudo?.legenda || data?.texto || data?.legenda) {
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
    case 'devocional': {
      const normalized = normalizeDevocionalData(data);
      return !normalized.reflexao;
    }
    case 'estudo': {
      const normalized = normalizeEstudoBiblicoData(data);
      return !normalized.estudo_biblico.tema && normalized.estudo_biblico.desenvolvimento.length === 0;
    }
    case 'trilha_oracao': {
      const normalized = normalizeTrilhaOracaoData(data);
      return normalized.etapas.length === 0;
    }
    case 'calendario': {
      const normalized = normalizeCalendarioData(data);
      return normalized.postagens.length === 0;
    }
    default:
      return Object.keys(data).length === 0;
  }
}
