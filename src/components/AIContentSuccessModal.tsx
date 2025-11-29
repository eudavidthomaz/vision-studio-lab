import { ContentLibraryItem } from "@/hooks/useContentLibrary";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Library, RefreshCw } from "lucide-react";

interface AIContentSuccessModalProps {
  open: boolean;
  content: ContentLibraryItem | null;
  onClose: () => void;
  onViewContent: () => void;
  onCreateAnother: () => void;
}

export function AIContentSuccessModal({
  open,
  content,
  onClose,
  onViewContent,
  onCreateAnother,
}: AIContentSuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px] rounded-xl border-border/60">
        <DialogHeader className="space-y-2 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-primary animate-pulse" />
          </div>
          <DialogTitle className="text-lg sm:text-xl">Conteúdo criado com sucesso! 🎉</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Agora você pode abrir a peça completa ou continuar criando novas variações.
          </p>
        </DialogHeader>

        {content ? (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {content.content_type && (
                <Badge variant="outline" className="text-[11px]">
                  {content.content_type.toUpperCase()}
                </Badge>
              )}
              {content.pilar && (
                <Badge className="text-[11px] bg-primary/90">{content.pilar}</Badge>
              )}
              {content.source_type && (
                <Badge variant="secondary" className="text-[11px]">
                  {content.source_type === "ai-creator" ? "IA" : content.source_type}
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold leading-snug line-clamp-2">{content.title}</p>
              {content.prompt_original && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {content.prompt_original}
                </p>
              )}
            </div>

            {content.tags && content.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {content.tags.slice(0, 4).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-[11px]">
                    #{tag}
                  </Badge>
                ))}
                {content.tags.length > 4 && (
                  <Badge variant="secondary" className="text-[11px]">
                    +{content.tags.length - 4}
                  </Badge>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
            Tudo pronto! Assim que a peça estiver disponível ela aparecerá aqui.
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-2">
          <Button variant="outline" onClick={onCreateAnother} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Criar outra peça
          </Button>
          <Button onClick={onViewContent} className="gap-2">
            <Library className="w-4 h-4" />
            Abrir conteúdo
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
