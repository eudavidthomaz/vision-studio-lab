-- ========================================
-- FASE 1: NOVA TABELA CONTENT_LIBRARY
-- ========================================

-- Criar tabela central unificada
CREATE TABLE IF NOT EXISTS public.content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Metadados
  title TEXT NOT NULL,
  content_type TEXT NOT NULL,
  source_type TEXT NOT NULL,
  pilar TEXT DEFAULT 'EDIFICAR',
  status TEXT DEFAULT 'draft',
  
  -- Conteúdo (JSONB flexível)
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Metadados adicionais
  tags TEXT[] DEFAULT '{}',
  sermon_id UUID REFERENCES public.sermons(id) ON DELETE SET NULL,
  prompt_original TEXT,
  
  -- Busca otimizada
  search_vector TSVECTOR,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_content_library_user ON public.content_library(user_id);
CREATE INDEX IF NOT EXISTS idx_content_library_type ON public.content_library(content_type);
CREATE INDEX IF NOT EXISTS idx_content_library_source ON public.content_library(source_type);
CREATE INDEX IF NOT EXISTS idx_content_library_pilar ON public.content_library(pilar);
CREATE INDEX IF NOT EXISTS idx_content_library_search ON public.content_library USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_content_library_tags ON public.content_library USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_library_created ON public.content_library(created_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_content_library_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_library_updated_at
BEFORE UPDATE ON public.content_library
FOR EACH ROW
EXECUTE FUNCTION public.update_content_library_updated_at();

-- Trigger para atualizar search_vector
CREATE TRIGGER content_library_search_update
BEFORE INSERT OR UPDATE ON public.content_library
FOR EACH ROW
EXECUTE FUNCTION tsvector_update_trigger(search_vector, 'pg_catalog.portuguese', title, prompt_original);

-- ========================================
-- MIGRAÇÃO DE DADOS EXISTENTES
-- ========================================

-- Migrar de generated_contents
INSERT INTO public.content_library (
  id, 
  user_id, 
  title, 
  content_type, 
  source_type, 
  pilar, 
  content, 
  prompt_original, 
  created_at,
  updated_at
)
SELECT 
  id,
  user_id,
  COALESCE(
    content->>'titulo',
    content->'devocional'->>'titulo',
    content->'esboco'->>'titulo',
    content->'estrutura'->>'titulo',
    'Conteúdo Gerado'
  ) as title,
  COALESCE(content_format, 'post') as content_type,
  COALESCE(source_type, 'ai-creator') as source_type,
  COALESCE(pilar, 'EDIFICAR') as pilar,
  content,
  prompt_original,
  created_at,
  updated_at
FROM public.generated_contents
ON CONFLICT (id) DO NOTHING;

-- Migrar desafios Ide.On
INSERT INTO public.content_library (
  id,
  user_id, 
  title, 
  content_type, 
  source_type, 
  pilar, 
  content, 
  created_at
)
SELECT 
  id,
  user_id,
  COALESCE(challenge->>'titulo', 'Desafio Ide.On') as title,
  'desafio_ideon' as content_type,
  'ai-creator' as source_type,
  'ENVIAR' as pilar,
  challenge as content,
  created_at
FROM public.ideon_challenges
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- RLS POLICIES
-- ========================================

ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seu próprio conteúdo
CREATE POLICY "Users can view own content"
ON public.content_library
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Usuários podem inserir seu próprio conteúdo
CREATE POLICY "Users can insert own content"
ON public.content_library
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seu próprio conteúdo
CREATE POLICY "Users can update own content"
ON public.content_library
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Usuários podem deletar seu próprio conteúdo
CREATE POLICY "Users can delete own content"
ON public.content_library
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Acesso público via share token (para futura implementação)
CREATE POLICY "Public access via valid share token"
ON public.content_library
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.shared_content
    WHERE shared_content.content_id = content_library.id
    AND shared_content.content_type = 'library'
    AND shared_content.is_public = true
    AND shared_content.expires_at > NOW()
  )
);