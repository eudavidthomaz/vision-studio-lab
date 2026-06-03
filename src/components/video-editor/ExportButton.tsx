import { useEffect } from 'react';
import { useKlapExports, useStartExport, useRefreshExport } from '@/hooks/useKlap';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

export default function ExportButton({ projectId, klapProjectId }: { projectId: string; klapProjectId: string }) {
  const { data: exports } = useKlapExports(projectId);
  const start = useStartExport();
  const refresh = useRefreshExport();

  const latest = exports?.[0];

  useEffect(() => {
    if (!latest || latest.status !== 'processing') return;
    const t = setInterval(() => refresh.mutate(latest.id), 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latest?.id, latest?.status]);

  if (latest?.status === 'ready' && latest.src_url) {
    return (
      <a href={latest.src_url} target="_blank" rel="noopener noreferrer">
        <Button size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" /> Baixar
        </Button>
      </a>
    );
  }
  if (latest?.status === 'processing') {
    return (
      <Button size="sm" variant="secondary" disabled className="gap-1.5">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Exportando…
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="default"
      disabled={start.isPending}
      onClick={() => start.mutate({ klap_project_id: klapProjectId, project_id: projectId })}
      className="gap-1.5"
    >
      {start.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
      Exportar
    </Button>
  );
}
