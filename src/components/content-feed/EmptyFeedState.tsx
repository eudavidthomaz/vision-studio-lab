import { Sparkles, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function EmptyFeedState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <div className="flex gap-4 mb-6">
        <div className="p-4 rounded-full bg-primary/10 animate-pulse">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <div className="p-4 rounded-full bg-accent/10 animate-pulse delay-150">
          <AudioLines className="h-8 w-8 text-accent" />
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-2 text-foreground">
        Nenhum conteúdo gerado ainda
      </h3>
      <p className="text-muted-foreground mb-8 max-w-md">
        Comece criando seu primeiro conteúdo com nossas ferramentas de IA ou
        gerando um pack semanal a partir do seu sermão
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => navigate("/dashboard")}
          className="gap-2"
          size="lg"
        >
          <Sparkles className="h-4 w-4" />
          Criar com IA
        </Button>
        <Button
          onClick={() => navigate("/dashboard")}
          variant="outline"
          className="gap-2"
          size="lg"
        >
          <AudioLines className="h-4 w-4" />
          Usar Sermão
        </Button>
      </div>
    </div>
  );
}
