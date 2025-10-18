-- Add sermon_id column to content_library
ALTER TABLE content_library 
ADD COLUMN IF NOT EXISTS sermon_id UUID REFERENCES sermons(id) ON DELETE SET NULL;

-- Add index for sermon lookups
CREATE INDEX IF NOT EXISTS idx_content_library_sermon 
ON content_library(user_id, sermon_id) 
WHERE sermon_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN content_library.sermon_id IS 
'Reference to the sermon that generated this content (via sermon pack)';