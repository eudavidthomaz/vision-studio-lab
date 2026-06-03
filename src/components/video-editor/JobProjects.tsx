import { useState } from 'react';
import { useKlapProjects, KlapProject, useCreateEmbedUrl } from '@/hooks/useKlap';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Eye, Edit3, Loader2 } from 'lucide-react';
import ExportButton from './ExportButton';

type KlapFrameMode = 'preview' | 'editor';

type KlapFrame = {
  mode: KlapFrameMode;
  project: KlapProject;
  url: string | null;
  error: string | null;
};

export default function JobProjects({ jobId }: { jobId: string }) {
  const { data: projects, isLoading } = useKlapProjects(jobId);
  const [frame, setFrame] = useState<KlapFrame | null>(null);
  const embed = useCreateEmbedUrl();

  const openKlapFrame = async (project: KlapProject, mode: KlapFrameMode) => {
    setFrame({ mode, project, url: null, error: null });
    try {
      const res = await embed.mutateAsync(project.klap_project_id);
      if (!res?.embed_url) throw new Error('O Klap não retornou uma URL de acesso.');
      setFrame({ mode, project, url: res.embed_url, error: null });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro ao gerar acesso ao Klap.';
      setFrame({ mode, project, url: null, error: message });
    }
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando projetos…</p>;
  if (!projects?.length) return <p className="text-sm text-muted-foreground">Nenhum corte disponível.</p>;

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {projects.map((p) => (
          <div key={p.id} className="rounded-xl border border-border/40 bg-background/40 p-4 space-y-3">
            <div>
              <p className="font-medium truncate">{p.name || `Corte ${p.klap_project_id.slice(0, 6)}`}</p>
              {p.duration && (
                <p className="text-xs text-muted-foreground">{Math.round(p.duration)}s</p>
              )}
            </div>
            {typeof p.virality_score === 'number' && (
              <div title={p.virality_score_explanation ?? undefined}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Viralidade</span>
                  <span className="font-medium">{Math.round(p.virality_score)}</span>
                </div>
                <Progress value={p.virality_score} className="h-1.5" />
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={() => openKlapFrame(p, 'preview')} className="gap-1.5">
                <Eye className="h-3.5 w-3.5" /> Visualizar
              </Button>
              <Button size="sm" variant="outline" onClick={() => openKlapFrame(p, 'editor')} className="gap-1.5">
                <Edit3 className="h-3.5 w-3.5" /> Editor
              </Button>
              <ExportButton projectId={p.id} klapProjectId={p.klap_project_id} />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!frame} onOpenChange={(o) => { if (!o) setFrame(null); }}>
        <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>
              {frame?.mode === 'preview' ? 'Visualizar' : 'Editor'} — {frame?.project.name || 'Projeto Klap'}
            </DialogTitle>
          </DialogHeader>
          <div className="h-[85dvh] bg-black">
            {frame?.url ? (
              <iframe
                key={frame.url}
                src={frame.url}
                title={frame.mode === 'preview' ? 'Visualização Klap' : 'Editor Klap'}
                className="w-full h-full"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"
                allow="clipboard-read; clipboard-write; autoplay; fullscreen"
              />
            ) : frame?.error ? (
              <div className="h-full flex flex-col gap-3 items-center justify-center p-6 text-center">
                <p className="font-medium text-destructive">Não foi possível abrir o Klap sem login.</p>
                <p className="max-w-md text-sm text-muted-foreground">{frame.error}</p>
                <Button variant="outline" onClick={() => openKlapFrame(frame.project, frame.mode)}>
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <div className="h-full flex flex-col gap-3 items-center justify-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm">Gerando acesso seguro ao Klap…</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
