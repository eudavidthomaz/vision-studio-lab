import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Sparkles, BookOpen } from "lucide-react";
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
}

export const SermonCompletedModal = ({
  open,
  onOpenChange,
  sermon,
  contentsCount = 0,
  onViewContents,
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
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <DialogTitle className="text-2xl font-bold text-primary">
            O Reino Cresce a Cada Conteúdo Criado Por Você! 🎉
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              <span>Resumo da Pregação</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {sermon.summary}
            </p>
          </div>
        </ScrollArea>

        <div className="space-y-4 pt-4 border-t">
          {contentsCount > 0 && (
            <div className="p-4 bg-primary/10 rounded-lg text-center">
              <p className="text-sm font-semibold text-primary mb-1">
                ✨ {contentsCount} conteúdos criados automaticamente!
              </p>
              <p className="text-xs text-muted-foreground">
                Posts, stories, reels e mais foram gerados com base na sua pregação
              </p>
            </div>
          )}
          
          <Button onClick={() => onViewContents(sermon.id)} size="lg" className="w-full">
            <Sparkles className="w-4 h-4 mr-2" />
            {contentsCount > 0 ? 'Ver Meus Conteúdos' : 'Criar Conteúdos Agora'}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            {contentsCount > 0 
              ? 'Visualize, edite e publique seus conteúdos gerados'
              : 'Acesse sua pregação e comece a criar conteúdos baseados nela'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
