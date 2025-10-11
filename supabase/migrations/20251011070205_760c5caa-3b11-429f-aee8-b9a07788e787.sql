-- ============================================
-- OPÇÃO E: LIMPEZA E OTIMIZAÇÃO DO BANCO
-- ============================================
-- Data: 2025-01-11
-- Motivo: Sistema migrado para content_library unificada
-- Segurança: Tabelas verificadas como vazias e sem dependências
-- ============================================

-- ======================
-- PARTE 1: REMOVER TABELAS ANTIGAS
-- ======================

-- Remover tabela weekly_packs (verificada como vazia)
DROP TABLE IF EXISTS public.weekly_packs CASCADE;

-- Remover tabela generated_contents (verificada como vazia)
DROP TABLE IF EXISTS public.generated_contents CASCADE;

-- Adicionar comentário para histórico
COMMENT ON TABLE public.content_library IS 'Tabela unificada para todos os tipos de conteúdo. Substitui as antigas weekly_packs e generated_contents desde janeiro/2025.';

-- ======================
-- PARTE 2: CRIAR ÍNDICES OTIMIZADOS
-- ======================

-- Índice composto para queries filtradas por usuário + tipo (query mais comum)
CREATE INDEX IF NOT EXISTS idx_content_library_user_type 
ON public.content_library(user_id, content_type);

-- Índice para ordenação por data (usado em todas as listagens)
CREATE INDEX IF NOT EXISTS idx_content_library_created_at 
ON public.content_library(created_at DESC);

-- Índice GIN para busca eficiente por tags
CREATE INDEX IF NOT EXISTS idx_content_library_tags 
ON public.content_library USING GIN(tags);

-- Índice GIN para busca full-text no título (português)
CREATE INDEX IF NOT EXISTS idx_content_library_title_search 
ON public.content_library USING GIN(to_tsvector('portuguese', title));

-- Índice para filtro por pilar (apenas onde existe)
CREATE INDEX IF NOT EXISTS idx_content_library_pilar 
ON public.content_library(pilar) 
WHERE pilar IS NOT NULL;

-- Índice para filtro por status
CREATE INDEX IF NOT EXISTS idx_content_library_status 
ON public.content_library(status);

-- Índice composto para queries de usuário + status (comum em dashboards)
CREATE INDEX IF NOT EXISTS idx_content_library_user_status 
ON public.content_library(user_id, status);

-- ======================
-- PARTE 3: ATUALIZAR USAGE_QUOTAS
-- ======================

-- Adicionar coluna para sermon packs (novo sistema)
ALTER TABLE public.usage_quotas 
ADD COLUMN IF NOT EXISTS sermon_packs_generated integer DEFAULT 0;

-- Remover coluna antiga que não faz mais sentido
ALTER TABLE public.usage_quotas 
DROP COLUMN IF EXISTS weekly_packs_used;

-- Atualizar comentário
COMMENT ON TABLE public.usage_quotas IS 'Controle de uso mensal: desafios, imagens e sermon packs gerados.';

-- ======================
-- PARTE 4: ANÁLISE DE SERMON_ID
-- ======================

-- Verificar quantos registros usam sermon_id
DO $$
DECLARE
  sermon_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO sermon_count
  FROM public.content_library
  WHERE sermon_id IS NOT NULL;
  
  -- Se nenhum registro usa sermon_id, removê-lo
  IF sermon_count = 0 THEN
    ALTER TABLE public.content_library DROP COLUMN IF EXISTS sermon_id;
    RAISE NOTICE 'Coluna sermon_id removida (não estava sendo utilizada)';
  ELSE
    RAISE NOTICE 'Coluna sermon_id mantida (% registros usando)', sermon_count;
  END IF;
END $$;