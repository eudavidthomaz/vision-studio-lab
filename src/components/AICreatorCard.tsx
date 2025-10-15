import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface AICreatorCardProps {
  onClick: () => void;
}

export const AICreatorCard = ({ onClick }: AICreatorCardProps) => {
  return (
    <div className="relative group min-w-0 overflow-x-clip">
      {/* glow/outline */}
      <div className="pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary via-accent to-primary opacity-75 group-hover:opacity-100 blur transition duration-500 animate-pulse" />

      <div className="relative bg-card rounded-xl p-6 sm:p-8 md:p-12 text-center border border-border shadow-lg min-w-0">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Sparkles className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 text-primary animate-pulse shrink-0" />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-ping" />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent break-words">
          Crie para o reino com apenas um clique...
        </h2>

        <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-prose mx-auto whitespace-pre-wrap break-words px-2">
          Use inteligência artificial para gerar conteúdo bíblico completo, com fundamento teológico e criatividade
          pastoral
        </p>

        <div className="w-full max-w-md mx-auto">
          <Button
            onClick={onClick}
            size="lg"
            className="group/btn relative overflow-hidden w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/50 transition-all duration-300"
          >
            <Sparkles className="mr-2 h-5 w-5 animate-pulse shrink-0" />
            <span className="relative z-10">Criar com IA</span>
            <div className="pointer-events-none absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </div>
  );
};
