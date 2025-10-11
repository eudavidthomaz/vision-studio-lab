-- MIGRAÇÃO COMPLETA: Unificar todas as funções em generated_contents

-- 1. Expandir constraint de content_format para incluir TODOS os tipos
ALTER TABLE public.generated_contents 
DROP CONSTRAINT IF EXISTS generated_contents_content_format_check;

ALTER TABLE public.generated_contents
ADD CONSTRAINT generated_contents_content_format_check 
CHECK (content_format = ANY (ARRAY[
  'post', 'carrossel', 'reel', 'stories', 'story', 'pack',
  'estudo', 'resumo', 'resumo_breve', 'perguntas', 'devocional',
  'calendario', 'convite', 'aviso', 'guia', 'esboco',
  'versiculos_citados', 'trilha_oracao', 'qa_estruturado',
  'convite_grupos', 'discipulado', 'desafio_semanal', 'ideia_estrategica',
  'foto_post', 'roteiro_video'
]::text[]));

-- 2. Normalizar constraint de pilar (aceitar uppercase E title-case)
ALTER TABLE public.generated_contents 
DROP CONSTRAINT IF EXISTS generated_contents_pilar_check;

ALTER TABLE public.generated_contents
ADD CONSTRAINT generated_contents_pilar_check 
CHECK (pilar = ANY (ARRAY[
  'ALCANÇAR', 'Alcançar',
  'EDIFICAR', 'Edificar',
  'PERTENCER', 'Pertencer',
  'SERVIR', 'Servir',
  'EXALTAR', 'Exaltar',
  'evangelístico', 'ensino', 'comunidade'
]::text[]));

-- 3. Expandir constraint de source_type
ALTER TABLE public.generated_contents 
DROP CONSTRAINT IF EXISTS generated_contents_source_type_check;

ALTER TABLE public.generated_contents
ADD CONSTRAINT generated_contents_source_type_check 
CHECK (source_type = ANY (ARRAY[
  'ai-creator',
  'audio-pack',
  'quick-post',
  'photo-idea',
  'video-script',
  'ai_generated',
  'content-idea'
]::text[]));