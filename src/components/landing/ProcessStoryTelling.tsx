import { Card } from "@/components/ui/card";
import { Mic, Sparkles, Send } from "lucide-react";

export const ProcessStoryTelling = () => {
  const steps = [
    {
      icon: Mic,
      title: "Você Prega",
      description: "Foque no que importa: pregar a Palavra com unção e autoridade. Deixe a tecnologia cuidar do resto.",
    },
    {
      icon: Sparkles,
      title: "IA Teologicamente Treinada Analisa",
      description: "Nossa IA identifica os 4 pilares da igreja saudável em sua mensagem: Alcançar, Edificar, Pertencer e Servir.",
      highlight: true,
    },
    {
      icon: Send,
      title: "Conteúdo Pronto para Discipular",
      description: "Receba 7 formatos de conteúdo prontos para multiplicar sua mensagem durante toda a semana.",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Tecnologia a Serviço do Reino
            </h2>
            <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
              Não substituímos o pastor. Amplificamos a mensagem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card
                key={index}
                className={`p-8 space-y-6 hover-scale ${
                  step.highlight
                    ? "bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-950/20 dark:to-pink-950/20 border-2 border-violet-200 dark:border-violet-800"
                    : ""
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mx-auto">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground font-body">{step.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
