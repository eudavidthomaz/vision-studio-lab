-- Create content_planners table for visual planner
CREATE TABLE public.content_planners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX idx_content_planners_user_week 
ON public.content_planners(user_id, week_start_date);

-- Enable RLS
ALTER TABLE public.content_planners ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own planners"
ON public.content_planners
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planners"
ON public.content_planners
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planners"
ON public.content_planners
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planners"
ON public.content_planners
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_content_planners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_content_planners_updated_at
BEFORE UPDATE ON public.content_planners
FOR EACH ROW
EXECUTE FUNCTION public.update_content_planners_updated_at();