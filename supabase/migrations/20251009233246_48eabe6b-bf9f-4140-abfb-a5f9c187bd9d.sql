-- Adicionar coluna sermon_id à tabela content_planners
ALTER TABLE public.content_planners
ADD COLUMN sermon_id UUID REFERENCES public.sermons(id) ON DELETE SET NULL;

-- Criar índice para melhor performance
CREATE INDEX idx_content_planners_sermon_id ON public.content_planners(sermon_id);

COMMENT ON COLUMN public.content_planners.sermon_id IS 'Referência ao sermão usado para gerar este conteúdo';