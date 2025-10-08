import { Card } from "@/components/ui/card";
import { Image, BookOpen, Camera, Video, Target, Calendar } from "lucide-react";

export const CapabilitiesGrid = () => {
  const capabilities = [
    {
      icon: Image,
      title: "Posts para Feed",
      description: "Imagens com versículos-chave e insights do sermão, otimizadas para Instagram e Facebook.",
    },
    {
      icon: BookOpen,
      title: "Carrosséis Didáticos",
      description: "Séries de slides que ensinam conceitos bíblicos de forma visual e progressiva.",
    },
    {
      icon: Camera,
      title: "Stories Diários",
      description: "Conteúdo vertical e dinâmico para manter sua comunidade engajada todos os dias.",
    },
    {
      icon: Video,
      title: "Roteiros de Reels",
      description: "Scripts prontos para criar vídeos curtos que viralizam com propósito.",
    },
    {
      icon: Target,
      title: "Desafios Ide.On",
      description: "Engajamento gamificado que transforma membros em discipuladores ativos.",
    },
    {
      icon: Calendar,
      title: "Calendário Semanal",
      description: "Plano completo de quando e o que publicar, para manter consistência sem stress.",
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
              Cada formato foi pensado para alcançar, edificar e discipular
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <Card
                  key={index}
                  className="p-6 space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 text-white group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      {capability.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-body leading-relaxed">
                      {capability.description}
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
