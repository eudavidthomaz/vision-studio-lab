import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";
interface AICreatorCardProps {
  onClick: () => void;
}
export const AICreatorCard = ({
  onClick
}: AICreatorCardProps) => {
  return <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-75 group-hover:opacity-100 blur transition duration-500 animate-pulse"></div>
      <div className="relative bg-card rounded-xl p-8 md:p-12 text-center border border-border shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Sparkles className="w-16 h-16 md:w-20 md:h-20 text-primary animate-pulse" />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-ping"></div>
          </div>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Crie para o reino com apenas um clique...
        </h2>
        
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto text-xs">Gere conteúdo bíblico completo, com fundamento teológico e criatividade pastoral</p>
        
        <Button onClick={onClick} size="lg" className="group/btn relative overflow-hidden bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/50 transition-all duration-300">
          <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
          <span className="relative z-10">Criar com IA</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
        </Button>
      </div>
    </div>;
};