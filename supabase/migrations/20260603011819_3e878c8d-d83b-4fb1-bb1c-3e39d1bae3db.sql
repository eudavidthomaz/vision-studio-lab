
-- 1. Tabelas
CREATE TABLE public.klap_users (
  user_id UUID PRIMARY KEY,
  klap_user_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.klap_video_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('video-to-shorts','video-to-video')),
  source_video_url TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '{}'::jsonb,
  klap_task_id TEXT,
  task_status TEXT NOT NULL DEFAULT 'processing',
  output_type TEXT,
  output_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.klap_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.klap_video_jobs(id) ON DELETE CASCADE,
  klap_project_id TEXT NOT NULL,
  klap_folder_id TEXT,
  name TEXT,
  virality_score NUMERIC,
  virality_score_explanation TEXT,
  duration NUMERIC,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, klap_project_id)
);

CREATE TABLE public.klap_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES public.klap_projects(id) ON DELETE CASCADE,
  klap_export_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  src_url TEXT,
  watermark BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);

-- 2. GRANTs (todas auth-only)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.klap_users      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.klap_video_jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.klap_projects   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.klap_exports    TO authenticated;
GRANT ALL ON public.klap_users      TO service_role;
GRANT ALL ON public.klap_video_jobs TO service_role;
GRANT ALL ON public.klap_projects   TO service_role;
GRANT ALL ON public.klap_exports    TO service_role;

-- 3. RLS
ALTER TABLE public.klap_users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.klap_video_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.klap_projects   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.klap_exports    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "klap_users self read" ON public.klap_users
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "klap_jobs owner all" ON public.klap_video_jobs
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "klap_projects owner all" ON public.klap_projects
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "klap_exports owner all" ON public.klap_exports
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Índices
CREATE INDEX klap_jobs_user_created_idx    ON public.klap_video_jobs(user_id, created_at DESC);
CREATE INDEX klap_projects_user_job_idx    ON public.klap_projects(user_id, job_id);
CREATE INDEX klap_exports_user_project_idx ON public.klap_exports(user_id, project_id);

-- 5. Triggers de updated_at (reaproveita função existente)
CREATE TRIGGER klap_jobs_updated_at
  BEFORE UPDATE ON public.klap_video_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER klap_projects_updated_at
  BEFORE UPDATE ON public.klap_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
