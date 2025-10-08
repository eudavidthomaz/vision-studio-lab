import { Card } from "@/components/ui/card";
import { Mic, Brain, Share2 } from "lucide-react";

export const ProcessStoryTelling = () => {
  const steps = [
    {
      icon: Mic,
      title: "Você Prega",
      description: "Grave ou faça upload do sermão. A tecnologia serve você, não o contrário.",
    },
    {
      icon: Brain,
      title: "IA Teologicamente Treinada",
      description: "Analisa contexto bíblico usando os 4 pilares: Alcançar, Edificar, Pertencer, Servir.",
      highlight: true,
    },
    {
      icon: Share2,
      title: "Conteúdo Pronto",
      description: "7 posts que discipulam, prontos para compartilhar.",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Tecnologia a Serviço do Reino
            </h2>
            <p className="text-lg text-muted-foreground font-body max-w-3xl mx-auto">
              Não estamos substituindo o pastor. Estamos amplificando sua mensagem.
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/4 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-200 via-pink-200 to-violet-200 dark:from-violet-800 dark:via-pink-800 dark:to-violet-800 -z-10" />

            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card
                  key={index}
                  className={`p-8 text-center space-y-4 hover:scale-105 transition-all duration-300 ${
                    step.highlight
                      ? "border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-950/20 dark:to-pink-950/20"
                      : ""
                  }`}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white mx-auto">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground font-body text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Bottom Message */}
          <div className="text-center max-w-3xl mx-auto">
            <Card className="p-8 bg-muted/50">
              <p className="text-foreground font-body leading-relaxed">
                Nossa IA não gera texto aleatório. Ela foi treinada para entender{" "}
                <span className="font-semibold text-violet-600 dark:text-violet-400">
                  contexto bíblico, teologia reformada e narrativa pastoral
                </span>
                . Cada post mantém a essência do seu sermão, adaptado para o formato digital.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
