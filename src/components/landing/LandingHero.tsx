import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface LandingHeroProps {
  onCTA: () => void;
}

export const LandingHero = ({ onCTA }: LandingHeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-violet-50 via-background to-background dark:from-violet-950/20">
      <div className="container mx-auto px-6 py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800">
            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
              Fase Beta • 100% Gratuito
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Ide por Todo o Mundo
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              Inclusive no Digital
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground font-body max-w-2xl mx-auto leading-relaxed">
            Transforme pregações em conteúdo que alcança, edifica e discipula — em minutos, não horas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" onClick={onCTA} className="gap-2 text-lg px-8 py-6">
              Começar a Missão
              <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-sm text-muted-foreground">
              "Ide por todo o mundo e pregai o evangelho" — Marcos 16:15
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
