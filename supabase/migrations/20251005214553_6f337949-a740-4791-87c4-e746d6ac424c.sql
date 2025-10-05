-- Create sermons table for storing transcriptions
CREATE TABLE IF NOT EXISTS public.sermons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transcript TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create weekly_packs table for storing generated content packages
CREATE TABLE IF NOT EXISTS public.weekly_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sermon_id UUID REFERENCES public.sermons(id) ON DELETE CASCADE,
  pack JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create ideon_challenges table for storing Ide.On challenges
CREATE TABLE IF NOT EXISTS public.ideon_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable Row Level Security
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideon_challenges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sermons
CREATE POLICY "Users can manage their own sermons"
  ON public.sermons
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for weekly_packs
CREATE POLICY "Users can manage their own weekly packs"
  ON public.weekly_packs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for ideon_challenges
CREATE POLICY "Users can manage their own challenges"
  ON public.ideon_challenges
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);