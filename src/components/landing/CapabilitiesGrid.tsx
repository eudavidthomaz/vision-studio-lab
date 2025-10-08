import { Card } from "@/components/ui/card";
import { FileText, Image, Video, Calendar, Lightbulb, BookOpen } from "lucide-react";

export const CapabilitiesGrid = () => {
  const capabilities = [
    {
      icon: FileText,
      title: "Posts Inspiradores",
      description: "Textos que tocam o coração, fundamentados na mensagem pregada. Prontos para engajar e edificar.",
    },
    {
      icon: Image,
      title: "Carrosséis Didáticos",
      description: "Ensino visual em slides. Perfeito para aprofundar verdades bíblicas com clareza e beleza.",
    },
    {
      icon: Video,
      title: "Stories & Reels",
      description: "Conteúdo rápido e impactante. Alcance uma nova geração onde ela está: nas redes.",
    },
    {
      icon: Calendar,
      title: "Calendário Semanal",
      description: "Planejamento estratégico. Saiba exatamente o que postar a cada dia para manter engajamento.",
    },
    {
      icon: Lightbulb,
      title: "Desafios Comunitários",
      description: "Convide sua igreja à ação. Desafios práticos que transformam ouvintes em praticantes da Palavra.",
    },
    {
      icon: BookOpen,
      title: "Roteiros de Vídeo",
      description: "Scripts prontos para gravar. Mantenha sua presença digital consistente e profissional.",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              O Que o Ide.On Cria Para Você
            </h2>
            <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
              7 formatos de conteúdo estratégico para alcançar, edificar e discipular
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((capability, index) => (
              <Card key={index} className="p-8 space-y-4 hover-scale">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                  <capability.icon className="w-7 h-7 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">{capability.title}</h3>
                  <p className="text-muted-foreground font-body">{capability.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
