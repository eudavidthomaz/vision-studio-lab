import { useEffect, useRef, useState } from 'react';
import { useKlapProjects, KlapProject, useCreateEmbedUrl } from '@/hooks/useKlap';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Eye, Edit3, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import ExportButton from './ExportButton';

export default function JobProjects({ jobId }: { jobId: string }) {
  const { data: projects, isLoading } = useKlapProjects(jobId);
  const [openFor, setOpenFor] = useState<KlapProject | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [embedError, setEmbedError] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showSlowHint, setShowSlowHint] = useState(false);
  const embed = useCreateEmbedUrl();
  const slowTimer = useRef<number | null>(null);

  const open = async (p: KlapProject) => {
    setOpenFor(p);
    setEmbedUrl(null);
    setEmbedError(null);
    setIframeLoaded(false);
    setShowSlowHint(false);
    try {
      const res = await embed.mutateAsync(p.klap_project_id);
      if (res?.embed_url) setEmbedUrl(res.embed_url);
      else setEmbedError('Não foi possível gerar o link do player.');
    } catch (e: any) {
      setEmbedError(e?.message || 'Erro ao gerar player.');
    }
  };

  // Show "open in new tab" hint if iframe doesn't load within 8s.
  useEffect(() => {
    if (!embedUrl || iframeLoaded) return;
    slowTimer.current = window.setTimeout(() => setShowSlowHint(true), 8000);
    return () => {
      if (slowTimer.current) window.clearTimeout(slowTimer.current);
    };
  }, [embedUrl, iframeLoaded]);

  const closeAll = () => {
    setOpenFor(null);
    setEmbedUrl(null);
    setEmbedError(null);
    setIframeLoaded(false);
    setShowSlowHint(false);
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
              <Button size="sm" variant="outline" onClick={() => open(p)} className="gap-1.5">
                <Eye className="h-3.5 w-3.5" /> Preview
              </Button>
              <Button size="sm" variant="outline" onClick={() => open(p)} className="gap-1.5">
                <Edit3 className="h-3.5 w-3.5" /> Editor
              </Button>
              <ExportButton projectId={p.id} klapProjectId={p.klap_project_id} />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!openFor} onOpenChange={(o) => { if (!o) closeAll(); }}>
        <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2 flex-row items-center justify-between gap-3 space-y-0">
            <div className="min-w-0">
              <DialogTitle className="truncate">{openFor?.name || 'Editor'}</DialogTitle>
              <DialogDescription className="text-xs">
                Player oficial do Klap. Edições são salvas automaticamente na sua conta gerenciada.
              </DialogDescription>
            </div>
            {embedUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(embedUrl, '_blank', 'noopener,noreferrer')}
                className="gap-1.5 shrink-0"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Abrir em nova aba
              </Button>
            )}
          </DialogHeader>
          <div className="h-[85dvh] bg-black relative">
            {embedError ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-destructive p-6 text-center">
                <AlertCircle className="h-6 w-6" />
                <p className="text-sm">{embedError}</p>
              </div>
            ) : embedUrl ? (
              <>
                {!iframeLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
                <iframe
                  src={embedUrl}
                  title="Klap"
                  className="w-full h-full border-0"
                  allow="clipboard-read; clipboard-write; autoplay; fullscreen; encrypted-media; picture-in-picture"
                  allowFullScreen
                  loading="eager"
                  referrerPolicy="no-referrer-when-downgrade"
                  onLoad={() => setIframeLoaded(true)}
                />
                {showSlowHint && !iframeLoaded && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/90 border border-border/60 rounded-lg px-3 py-2 text-xs text-muted-foreground shadow-lg backdrop-blur">
                    Demorando a carregar?{' '}
                    <button
                      className="underline text-foreground"
                      onClick={() => window.open(embedUrl, '_blank', 'noopener,noreferrer')}
                    >
                      Abrir em nova aba
                    </button>
                  </div>
                )}
              </>
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
