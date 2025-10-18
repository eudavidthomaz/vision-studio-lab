-- LIMPEZA TOTAL: Opção B + Remoção Ide.On
-- Todas as tabelas de conteúdo serão zeradas

-- Limpar TODAS as tabelas de conteúdo
TRUNCATE TABLE content_library CASCADE;
TRUNCATE TABLE generated_contents CASCADE;
TRUNCATE TABLE ideon_challenges CASCADE;
TRUNCATE TABLE content_planners CASCADE;
TRUNCATE TABLE weekly_packs CASCADE;

-- Remover tabela ideon_challenges completamente
DROP TABLE IF EXISTS ideon_challenges CASCADE;