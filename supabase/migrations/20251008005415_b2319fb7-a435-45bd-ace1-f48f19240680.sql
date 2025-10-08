-- Add new columns to content_planners for enhanced content management
-- This migration adds support for tags, status workflow, favorites, and archiving

-- First, let's create an enum for content status
DO $$ BEGIN
  CREATE TYPE content_status AS ENUM ('draft', 'approved', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add comment to explain the enum
COMMENT ON TYPE content_status IS 'Status workflow for content items: draft -> approved -> published or archived';

-- Note: We're storing these fields within the JSONB content column structure
-- Each content item will have: tags[], status, is_favorite, is_archived
-- This approach maintains backward compatibility and allows per-item metadata

-- Create indexes for better query performance on content_planners
CREATE INDEX IF NOT EXISTS idx_content_planners_week_start ON content_planners(week_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_content_planners_user_week ON content_planners(user_id, week_start_date DESC);

-- Create a function to help filter content by tags (for future use)
CREATE OR REPLACE FUNCTION public.search_content_by_tags(
  _user_id uuid,
  _tags text[]
)
RETURNS TABLE (
  planner_id uuid,
  week_start_date date,
  content jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id as planner_id,
    cp.week_start_date,
    cp.content
  FROM content_planners cp
  WHERE cp.user_id = _user_id
  AND EXISTS (
    SELECT 1
    FROM jsonb_each(cp.content) as day_content
    WHERE EXISTS (
      SELECT 1
      FROM jsonb_array_elements(day_content.value) as item
      WHERE item->'tags' ?| _tags
    )
  )
  ORDER BY cp.week_start_date DESC;
END;
$$;

COMMENT ON FUNCTION search_content_by_tags IS 'Search content planners by tags within content items';