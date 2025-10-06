-- Fix search_path for security
DROP FUNCTION IF EXISTS public.update_content_planners_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_content_planners_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER trigger_update_content_planners_updated_at
BEFORE UPDATE ON public.content_planners
FOR EACH ROW
EXECUTE FUNCTION public.update_content_planners_updated_at();