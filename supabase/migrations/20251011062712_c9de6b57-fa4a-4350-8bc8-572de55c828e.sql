-- Corrigir dados existentes com source_type incorreto
UPDATE generated_contents 
SET source_type = 'ai-creator' 
WHERE source_type = 'ai_generated' OR source_type IS NULL;

-- Garantir que todos os registros tenham content_format
UPDATE generated_contents 
SET content_format = 'post' 
WHERE content_format IS NULL;