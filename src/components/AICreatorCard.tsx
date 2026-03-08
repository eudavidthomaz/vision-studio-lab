import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { GlassCard } from "./ui/glass-card";
import logoIdeon from "@/assets/logo-ideon.png";

interface AICreatorCardProps {
  onClick: () => void;
}

export const AICreatorCard = ({ onClick }: AICreatorCardProps) => {
  return (
    <GlassCard glowColor="primary" className="w-full">
      <div className="p-4 sm:p-6 md:p-8 lg:p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img src={logoIdeon} alt="Ide.On" className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-contain" />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-ping" />
          </div>
        </div>

        <h2 className="sm:text-xl md:text-2xl font-bold mb-3 font-gunterz text-foreground uppercase lg:text-base text-sm">
          VOCÊ FOI CHAMADO PARA CRIAR 

  
        </h2>

        <p className="text-muted-foreground mb-6 max-w-lg mx-auto text-xs">
          Gere conteúdo bíblico completo, com fundamento teológico e criatividade pastoral
        </p>

        <Button onClick={onClick} size="lg"
        className="group/btn relative overflow-hidden bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/50 transition-all duration-300">
          
          <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
          <span className="relative z-10">Gerar conteúdo </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
        </Button>
      </div>
    </GlassCard>);

};