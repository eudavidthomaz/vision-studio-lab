import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type KlapJob = {
  id: string;
  job_type: 'video-to-shorts' | 'video-to-video';
  source_video_url: string;
  task_status: 'processing' | 'ready' | 'error' | string;
  output_type: 'folder' | 'project' | null;
  output_id: string | null;
  error_message: string | null;
  created_at: string;
};

export type KlapProject = {
  id: string;
  job_id: string;
  klap_project_id: string;
  klap_folder_id: string | null;
  name: string | null;
  virality_score: number | null;
  virality_score_explanation: string | null;
  duration: number | null;
};

export type KlapExport = {
  id: string;
  project_id: string;
  status: 'processing' | 'ready' | 'error' | string;
  src_url: string | null;
  watermark: Record<string, unknown> | null;
  created_at: string;
};


async function invoke<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke('klap-api', {
    body: { action, ...payload },
  });
  if (error) throw new Error(error.message);
  if (data && typeof data === 'object' && 'success' in data && data.success === false) {
    throw new Error((data as any).error || 'Erro ao processar vídeo');
  }
  return data as T;
}

export function useKlapJobs() {
  return useQuery({
    queryKey: ['klap-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('klap_video_jobs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as KlapJob[];
    },
    refetchInterval: (q) => {
      const jobs = q.state.data as KlapJob[] | undefined;
      return jobs?.some((j) => j.task_status === 'processing') ? 15000 : false;
    },
  });
}

export function useKlapProjects(jobId?: string) {
  return useQuery({
    queryKey: ['klap-projects', jobId],
    enabled: !!jobId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('klap_projects')
        .select('*')
        .eq('job_id', jobId!)
        .order('virality_score', { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as KlapProject[];
    },
  });
}

export function useKlapExports(projectId?: string) {
  return useQuery({
    queryKey: ['klap-exports', projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('klap_exports')
        .select('*')
        .eq('project_id', projectId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as KlapExport[];
    },
    refetchInterval: (q) => {
      const exps = q.state.data as KlapExport[] | undefined;
      return exps?.some((e) => e.status === 'processing') ? 15000 : false;
    },
  });
}

export function useStartJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      mode: 'shorts' | 'video';
      source_video_url: string;
      language?: string;
      target_clip_count?: number;
      max_clip_count?: number;
      max_duration?: number;
      editing_options?: Record<string, boolean>;
      dimensions?: { width: number; height: number };
      style_preset_id?: string;
      transcription_context?: string;
    }) => {
      const action = input.mode === 'shorts' ? 'start_video_to_shorts' : 'start_video_to_video';
      const { mode, ...rest } = input;
      return invoke<{ job: KlapJob }>(action, rest);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['klap-jobs'] });
      toast.success('Processamento iniciado');
    },
    onError: (e: any) => toast.error('Erro ao iniciar', { description: e.message }),
  });
}

export function useRefreshTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (job_id: string) => invoke<{ job: KlapJob; projects: KlapProject[] }>('refresh_task', { job_id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['klap-jobs'] });
      qc.invalidateQueries({ queryKey: ['klap-projects'] });
    },
  });
}

export function useCreateEmbedUrl() {
  return useMutation({
    mutationFn: (klap_project_id: string) =>
      invoke<{ embed_url: string }>('create_embed_url', { klap_project_id }),
  });
}

export function useStartExport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { klap_project_id: string; watermark?: Record<string, unknown>; project_id: string }) =>
      invoke<{ export: KlapExport }>('start_export', input),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['klap-exports', vars.project_id] });
      toast.success('Exportação iniciada');
    },
    onError: (e: any) => toast.error('Erro ao exportar', { description: e.message }),
  });
}


export function useRefreshExport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (export_id: string) => invoke<{ export: KlapExport }>('refresh_export', { export_id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['klap-exports'] }),
  });
}
