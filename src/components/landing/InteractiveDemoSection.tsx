import { Card } from "@/components/ui/card";
import { Mic, Sparkles } from "lucide-react";

export const InteractiveDemoSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Veja Como Funciona
            </h2>
            <p className="text-lg text-muted-foreground font-body">
              De um sermão, multiplicação estratégica do evangelho
            </p>
          </div>

          {/* Audio Player Mockup */}
          <Card className="p-8 bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-950/20 dark:to-pink-950/20 border-2">
            <div className="space-y-6">
              <div className="flex items-center gap-4 justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Sermão sobre Fé e Esperança</p>
                  <p className="text-sm text-muted-foreground">45 minutos • Pastor João</p>
                </div>
              </div>

              {/* Waveform Mockup */}
              <div className="flex gap-1 items-center justify-center h-16">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-violet-500 to-pink-500 rounded-full opacity-60"
                    style={{
                      height: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>

              {/* Loading State */}
              <div className="flex items-center justify-center gap-3 text-violet-600 dark:text-violet-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <p className="font-semibold">Analisando contexto bíblico e gerando conteúdo...</p>
              </div>
            </div>
          </Card>

          {/* Result Cards Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].slice(0, 4).map((i) => (
              <Card
                key={i}
                className="aspect-square bg-gradient-to-br from-violet-100 to-pink-100 dark:from-violet-900/20 dark:to-pink-900/20 border-2 flex items-center justify-center hover:scale-105 transition-transform duration-300"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">Post {i}</p>
                  <p className="text-xs text-muted-foreground mt-2">Dia {i}</p>
                </div>
              </Card>
            ))}
          </div>

          <p className="text-muted-foreground font-body italic">
            "É assim que funciona. Simples. Poderoso. A serviço do Reino."
          </p>
        </div>
      </div>
    </section>
  );
};
