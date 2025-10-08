import { Card } from "@/components/ui/card";
import { FileText, Image, Video, Calendar, Sparkles, Mic } from "lucide-react";

export const InteractiveDemoSection = () => {
  const outputs = [
    { icon: FileText, label: "Posts" },
    { icon: Image, label: "Carrosséis" },
    { icon: Video, label: "Stories" },
    { icon: Calendar, label: "Calendário" },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Veja Como Funciona
            </h2>
            <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
              De uma pregação para 7 formatos de conteúdo. Multiplicação estratégica do evangelho.
            </p>
          </div>

          <Card className="p-8 md:p-12 bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-950/20 dark:to-pink-950/20 border-2">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Pregação Dominical</h3>
                  <p className="text-muted-foreground">45 minutos de conteúdo pastoral</p>
                </div>
              </div>

              <div className="flex items-center justify-center py-8">
                <Sparkles className="w-12 h-12 text-violet-500 animate-pulse" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {outputs.map((output, index) => (
                  <Card key={index} className="p-6 text-center space-y-3 hover-scale">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mx-auto">
                      <output.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-semibold text-foreground">{output.label}</p>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
