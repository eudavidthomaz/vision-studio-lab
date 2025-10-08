import { Card } from "@/components/ui/card";
import { Clock, TrendingUp, Shield, Gift } from "lucide-react";

export const ImpactSection = () => {
  const impacts = [
    {
      icon: Clock,
      number: "5+",
      label: "Horas Economizadas",
      description: "Por semana, para focar no que realmente importa: pessoas",
    },
    {
      icon: TrendingUp,
      number: "3x",
      label: "Mais Alcance",
      description: "Sua mensagem multiplica além das paredes da igreja",
    },
    {
      icon: Shield,
      number: "100%",
      label: "Fidelidade Bíblica",
      description: "IA treinada em teologia, não apenas em algoritmos",
    },
    {
      icon: Gift,
      number: "Grátis",
      label: "Fase Beta",
      description: "Acesso completo sem custo durante o lançamento",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Números Que Servem Pessoas
            </h2>
            <p className="text-lg text-muted-foreground font-body">
              Impacto mensurável, propósito eterno
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impacts.map((impact, index) => {
              const Icon = impact.icon;
              return (
                <Card
                  key={index}
                  className="p-6 text-center space-y-4 hover:scale-105 transition-transform duration-300"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white mx-auto">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-display text-4xl font-bold text-foreground">
                      {impact.number}
                    </p>
                    <p className="font-semibold text-foreground">
                      {impact.label}
                    </p>
                    <p className="text-sm text-muted-foreground font-body">
                      {impact.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
