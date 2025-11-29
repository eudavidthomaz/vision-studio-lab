import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BookOpen, Bot, CheckCircle2 } from "lucide-react";

interface AIContentStatusModalProps {
  open: boolean;
  step: "briefing" | "context" | "generation" | "saving";
  onClose: () => void;
}

const steps = [
  { key: "briefing", title: "Entendendo seu pedido", description: "Analisando o que você quer criar" },
  { key: "context", title: "Carregando contexto", description: "Aplicando sua pregação e preferências" },
  { key: "generation", title: "Gerando conteúdo", description: "IA criando títulos, legendas e blocos" },
  { key: "saving", title: "Salvando na biblioteca", description: "Organizando na sua biblioteca" },
] as const;

export function AIContentStatusModal({ open, step, onClose }: AIContentStatusModalProps) {
  const currentIndex = steps.findIndex((item) => item.key === step);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] rounded-xl border-border/60">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Gerando seu conteúdo com IA
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            A experiência foi atualizada para acompanhar cada etapa da criação.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <Progress value={progress} className="h-2" />

          <div className="grid grid-cols-1 gap-3">
            {steps.map((item, index) => {
              const isActive = index === currentIndex;
              const isDone = index < currentIndex;

              return (
                <div
                  key={item.key}
                  className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 transition ${
                    isActive
                      ? "border-primary/40 bg-primary/5 shadow-sm"
                      : isDone
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-border/60"
                  }`}
                >
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : isActive ? (
                      <Bot className="w-4 h-4 text-primary animate-pulse" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{item.title}</p>
                      {isActive && <Badge className="text-[10px]">ao vivo</Badge>}
                      {isDone && <Badge variant="secondary" className="text-[10px]">pronto</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
