-- Add favorite and pinned columns to content_library
ALTER TABLE content_library 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_library_favorites 
ON content_library(user_id, is_favorite) 
WHERE is_favorite = true;

CREATE INDEX IF NOT EXISTS idx_content_library_pinned 
ON content_library(user_id, is_pinned, pinned_at DESC) 
WHERE is_pinned = true;

-- Add GIN index for full-text search on content
CREATE INDEX IF NOT EXISTS idx_content_library_content_search 
ON content_library USING GIN(to_tsvector('portuguese', content::text));

-- Function for full-text search
CREATE OR REPLACE FUNCTION search_content_library(
  search_query TEXT,
  user_uuid UUID
) RETURNS SETOF content_library AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM content_library
  WHERE user_id = user_uuid
    AND (
      to_tsvector('portuguese', title) @@ plainto_tsquery('portuguese', search_query)
      OR to_tsvector('portuguese', content::text) @@ plainto_tsquery('portuguese', search_query)
    )
  ORDER BY 
    is_pinned DESC,
    pinned_at DESC NULLS LAST,
    created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;