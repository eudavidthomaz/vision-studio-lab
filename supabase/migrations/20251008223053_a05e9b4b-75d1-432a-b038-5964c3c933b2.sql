-- Normalizar conteúdos antigos sem estrutura completa
-- Fase 1: Garantir estrutura mínima para fundamento_biblico
UPDATE content_planners
SET content = jsonb_set(
  content,
  '{0,fundamento_biblico}',
  COALESCE(
    content->0->'fundamento_biblico',
    jsonb_build_object(
      'versiculos', '[]'::jsonb,
      'contexto', 'Conteúdo legado sem contexto bíblico',
      'principio', 'Conteúdo legado sem princípio'
    )
  )
)
WHERE jsonb_typeof(content) = 'array'
  AND (
    content->0->'fundamento_biblico' IS NULL
    OR content->0->'fundamento_biblico'->'versiculos' IS NULL
  );

-- Normalizar estrutura_visual
UPDATE content_planners
SET content = jsonb_set(
  content,
  '{0,estrutura_visual}',
  COALESCE(
    content->0->'estrutura_visual',
    jsonb_build_object(
      'legendas', '[]'::jsonb,
      'stories', '[]'::jsonb,
      'carrosseis', '[]'::jsonb,
      'reels', '[]'::jsonb
    )
  )
)
WHERE jsonb_typeof(content) = 'array'
  AND content->0->'estrutura_visual' IS NULL;

-- Normalizar estudo_biblico_detalhado
UPDATE content_planners
SET content = jsonb_set(
  content,
  '{0,dica_producao,estudo_biblico_detalhado}',
  COALESCE(
    content->0->'dica_producao'->'estudo_biblico_detalhado',
    jsonb_build_object(
      'tema', 'Não disponível',
      'versiculos_principais', '[]'::jsonb,
      'perguntas_reflexao', '[]'::jsonb,
      'plano_devocional', jsonb_build_object('duracao', '0 dias', 'dias', '[]'::jsonb),
      'livros_recomendados', '[]'::jsonb
    )
  )
)
WHERE jsonb_typeof(content) = 'array'
  AND (
    content->0->'dica_producao' IS NULL
    OR content->0->'dica_producao'->'estudo_biblico_detalhado' IS NULL
  );