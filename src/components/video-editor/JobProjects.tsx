import { useState } from 'react';
import { useKlapProjects, KlapProject, useCreateEmbedUrl } from '@/hooks/useKlap';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Eye, Edit3, Download, Loader2 } from 'lucide-react';
import ExportButton from './ExportButton';

export default function JobProjects({ jobId }: { jobId: string }) {
  const { data: projects, isLoading } = useKlapProjects(jobId);
  const [preview, setPreview] = useState<KlapProject | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [embedFor, setEmbedFor] = useState<KlapProject | null>(null);
  const embed = useCreateEmbedUrl();

  const openEditor = async (p: KlapProject) => {
    setEmbedFor(p);
    setEmbedUrl(null);
    const res = await embed.mutateAsync(p.klap_project_id).catch(() => null);
    if (res?.embed_url) setEmbedUrl(res.embed_url);
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
              <Button size="sm" variant="outline" onClick={() => setPreview(p)} className="gap-1.5">
                <Eye className="h-3.5 w-3.5" /> Preview
              </Button>
              <Button size="sm" variant="outline" onClick={() => openEditor(p)} className="gap-1.5">
                <Edit3 className="h-3.5 w-3.5" /> Editor
              </Button>
              <ExportButton projectId={p.id} klapProjectId={p.klap_project_id} />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-3xl w-[95vw] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{preview?.name || 'Preview'}</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="aspect-[9/16] w-full max-h-[85dvh] bg-black">
              <iframe
                src={`https://klap.app/player/${preview.klap_project_id}`}
                title="Preview"
                className="w-full h-full"
                allow="autoplay; fullscreen"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!embedFor} onOpenChange={(o) => { if (!o) { setEmbedFor(null); setEmbedUrl(null); } }}>
        <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Editor — {embedFor?.name || ''}</DialogTitle>
          </DialogHeader>
          <div className="h-[85dvh] bg-black">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title="Editor Klap"
                className="w-full h-full"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
                allow="clipboard-write; autoplay; fullscreen"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
