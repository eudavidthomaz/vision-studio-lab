-- Adicionar coluna para hash SHA-256 (deduplicação)
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS sermon_hash TEXT;

-- Índice para busca rápida de duplicatas
CREATE INDEX IF NOT EXISTS idx_sermons_hash ON sermons(user_id, sermon_hash);

-- Adicionar metadados de performance e erro
ALTER TABLE sermons 
ADD COLUMN IF NOT EXISTS transcription_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS error_message TEXT;