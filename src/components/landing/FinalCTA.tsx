import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

interface FinalCTAProps {
  onCTA: () => void;
}

export const FinalCTA = ({ onCTA }: FinalCTAProps) => {
  const benefits = [
    "Sem cartão de crédito",
    "100% gratuito durante a fase beta",
    "Suporte pastoral prioritário",
    "Fidelidade bíblica garantida",
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 text-white">
          <h2 className="font-display text-4xl md:text-6xl font-black leading-tight">
            Pronto Para Obedecer à Grande Comissão
            <br />
            Também no Digital?
          </h2>

          <p className="text-xl md:text-2xl text-white/90 font-body">
            Junte-se aos pastores que estão alcançando milhares com a mesma mensagem
            que já pregam aos domingos
          </p>

          <div className="pt-8">
            <Button
              size="lg"
              onClick={onCTA}
              className="bg-white text-violet-600 hover:bg-white/90 font-bold text-xl px-12 py-8 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 group"
            >
              Começar Gratuitamente
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 justify-center">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <p className="text-white/90 font-body">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
