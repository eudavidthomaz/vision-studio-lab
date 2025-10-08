-- Fix security warning: Update function search_path
-- This ensures the function uses a proper search_path to prevent SQL injection attacks

DROP FUNCTION IF EXISTS public.search_content_by_tags(uuid, text[]);

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
-- Explicitly set search_path to prevent malicious schema attacks
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id as planner_id,
    cp.week_start_date,
    cp.content
  FROM public.content_planners cp
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

COMMENT ON FUNCTION public.search_content_by_tags IS 'Search content planners by tags within content items (security definer with explicit search_path)';