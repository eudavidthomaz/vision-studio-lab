import { useEffect } from 'react';
import { useKlapJobs, useRefreshTask, KlapJob } from '@/hooks/useKlap';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Film, Scissors, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JobProjects from './JobProjects';

export default function JobList() {
  const { data: jobs, isLoading } = useKlapJobs();
  const refresh = useRefreshTask();

  // Auto-refresh task status for processing jobs via the edge function (server-side fetch)
  useEffect(() => {
    if (!jobs) return;
    const processing = jobs.filter((j) => j.task_status === 'processing');
    if (processing.length === 0) return;
    const t = setInterval(() => {
      processing.forEach((j) => refresh.mutate(j.id));
    }, 20000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs?.map((j) => `${j.id}:${j.task_status}`).join(',')]);

  if (isLoading) {
    return <Skeleton className="h-32 rounded-2xl" />;
  }
  if (!jobs?.length) {
    return (
      <Card className="p-10 text-center border-dashed bg-card/30">
        <Film className="h-10 w-10 mx-auto text-muted-foreground/60 mb-3" />
        <p className="text-muted-foreground">Nenhum vídeo processado ainda. Comece pela URL acima.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobRow key={job.id} job={job} onRefresh={() => refresh.mutate(job.id)} refreshing={refresh.isPending} />
      ))}
    </div>
  );
}

function JobRow({ job, onRefresh, refreshing }: { job: KlapJob; onRefresh: () => void; refreshing: boolean }) {
  const statusVariant =
    job.task_status === 'ready' ? 'default' :
    job.task_status === 'error' ? 'destructive' : 'secondary';

  return (
    <Card className="p-5 backdrop-blur bg-card/60 border-border/40">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          {job.job_type === 'video-to-shorts' ? <Scissors className="h-5 w-5 mt-0.5 text-primary" /> : <Film className="h-5 w-5 mt-0.5 text-primary" />}
          <div className="min-w-0">
            <p className="font-medium truncate max-w-[60ch]">{job.source_video_url}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(job.created_at).toLocaleString('pt-BR')} • {job.job_type === 'video-to-shorts' ? 'Cortes' : 'Edição única'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant as any}>{labelFor(job.task_status)}</Badge>
          {job.task_status === 'processing' && (
            <Button size="sm" variant="ghost" onClick={onRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {job.task_status === 'error' && (
        <div className="mt-3 flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <span>{job.error_message || 'Falha no processamento.'}</span>
        </div>
      )}

      {job.task_status === 'ready' && (
        <div className="mt-4">
          <JobProjects jobId={job.id} />
        </div>
      )}
    </Card>
  );
}

function labelFor(status: string) {
  switch (status) {
    case 'ready': return 'Pronto';
    case 'error': return 'Erro';
    case 'processing': return 'Processando';
    default: return status;
  }
}
