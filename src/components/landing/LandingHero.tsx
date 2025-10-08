import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface LandingHeroProps {
  onCTA: () => void;
}

export const LandingHero = ({ onCTA }: LandingHeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 opacity-90">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-white/20 rounded-full animate-pulse delay-100" />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white/25 rounded-full animate-pulse delay-200" />
        <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-white/30 rounded-full animate-pulse delay-300" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
          <h1 className="font-display text-6xl md:text-8xl font-black text-white leading-tight">
            Ide por Todo o Mundo
            <br />
            <span className="text-white/90">Inclusive no Digital</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-body leading-relaxed">
            Transforme pregações em conteúdo que alcança, edifica e discipula
            <br />
            — em minutos, não horas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button
              size="lg"
              onClick={onCTA}
              className="bg-white text-violet-600 hover:bg-white/90 font-semibold text-lg px-8 py-6 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 group"
            >
              Começar a Missão
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <p className="text-white/70 text-sm font-body pt-4">
            "Portanto, ide e fazei discípulos de todas as nações..." — Mateus 28:19
          </p>
        </div>

        {/* Dashboard Preview Placeholder */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-xl bg-white/10">
            <div className="aspect-video bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm flex items-center justify-center">
              <div className="text-white/60 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowRight className="w-10 h-10" />
                </div>
                <p className="font-body">Preview do Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
