-- Criar tabela unificada para todos os conteúdos gerados
CREATE TABLE IF NOT EXISTS public.generated_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Tipo de geração
  source_type TEXT NOT NULL CHECK (source_type IN ('ai-creator', 'audio-pack', 'quick-post', 'photo-idea', 'video-script')),
  
  -- Conteúdo principal (JSONB flexível)
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Metadados para busca/filtro
  content_format TEXT CHECK (content_format IN ('carrossel', 'reel', 'post', 'story', 'pack')),
  pilar TEXT CHECK (pilar IN ('ALCANÇAR', 'EDIFICAR', 'PERTENCER', 'SERVIR', 'EXALTAR')),
  prompt_original TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_generated_contents_user_id ON public.generated_contents(user_id);
CREATE INDEX idx_generated_contents_created_at ON public.generated_contents(created_at DESC);
CREATE INDEX idx_generated_contents_source_type ON public.generated_contents(source_type);
CREATE INDEX idx_generated_contents_pilar ON public.generated_contents(pilar);

-- RLS Policies
ALTER TABLE public.generated_contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content"
ON public.generated_contents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content"
ON public.generated_contents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content"
ON public.generated_contents FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content"
ON public.generated_contents FOR DELETE
USING (auth.uid() = user_id);

-- Policy para compartilhamento público
CREATE POLICY "Public access via valid share token"
ON public.generated_contents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM shared_content
    WHERE shared_content.content_id = generated_contents.id
      AND shared_content.content_type = 'generated'
      AND shared_content.is_public = true
      AND shared_content.expires_at > now()
  )
);

-- Trigger para updated_at
CREATE TRIGGER update_generated_contents_updated_at
  BEFORE UPDATE ON public.generated_contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migrar dados de content_planners (conteúdo de IA)
INSERT INTO public.generated_contents (
  user_id, source_type, content, content_format, pilar, created_at, updated_at
)
SELECT 
  user_id,
  'ai-creator' AS source_type,
  content,
  'post' AS content_format,
  'ALCANÇAR' AS pilar,
  created_at,
  updated_at
FROM public.content_planners;

-- Migrar dados de weekly_packs (conteúdo de áudio)
INSERT INTO public.generated_contents (
  user_id, source_type, content, content_format, pilar, created_at
)
SELECT 
  user_id,
  'audio-pack' AS source_type,
  pack AS content,
  'pack' AS content_format,
  'EXALTAR' AS pilar,
  created_at
FROM public.weekly_packs;