import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Sparkles, BookOpen, Library } from "lucide-react";
import confetti from "canvas-confetti";

interface SermonCompletedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sermon: {
    id: string;
    summary: string;
    created_at: string;
  };
  contentsCount?: number;
  onViewContents: (sermonId: string) => void;
  onCreateContents: (sermonId: string) => void;
}

export const SermonCompletedModal = ({
  open,
  onOpenChange,
  sermon,
  contentsCount = 0,
  onViewContents,
  onCreateContents,
}: SermonCompletedModalProps) => {
  useEffect(() => {
    if (open) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-3xl max-h-[85dvh] sm:max-h-[80dvh] overflow-x-hidden" data-prevent-zoom>
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-primary">
            O Reino Cresce a Cada Conteúdo Criado Por Você! 🎉
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[300px] sm:max-h-[400px] pr-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              <span>Resumo da Pregação</span>
            </div>
            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
              {sermon.summary}
            </p>
          </div>
        </ScrollArea>

        <div className="space-y-4 pt-4 border-t">
          {contentsCount > 0 ? (
            // Se JÁ tem conteúdos gerados
            <>
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-sm font-semibold text-primary mb-1">
                  ✨ {contentsCount} conteúdos criados!
                </p>
                <p className="text-xs text-muted-foreground">
                  Posts, stories, reels e mais foram gerados com base na sua pregação
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => onViewContents(sermon.id)}
                  className="flex-1"
                >
                  <Library className="w-4 h-4 mr-2" />
                  Ver Conteúdos
                </Button>
              </div>
            </>
          ) : (
            // Se NÃO tem conteúdos ainda
            <>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Fazer Depois
                </Button>
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    onCreateContents(sermon.id);
                  }}
                  className="flex-1"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Criar Conteúdos
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Use a IA para criar posts, stories, reels e mais baseados na sua pregação
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
