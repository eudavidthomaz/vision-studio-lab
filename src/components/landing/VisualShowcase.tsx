import { Card } from "@/components/ui/card";
import { Clock, Users, TrendingUp } from "lucide-react";

export const VisualShowcase = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              De Pregação para Proclamação Digital
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Antes */}
            <Card className="p-8 space-y-6 border-2">
              <div className="text-center">
                <div className="inline-block px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 mb-4">
                  <span className="text-sm font-semibold text-red-700 dark:text-red-300">Antes</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground">Processo Manual</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">5+ horas por semana</p>
                    <p className="text-sm text-muted-foreground">Criando posts manualmente</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Alcance limitado</p>
                    <p className="text-sm text-muted-foreground">100-200 pessoas no domingo</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Depois */}
            <Card className="p-8 space-y-6 bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-950/20 dark:to-pink-950/20 border-2 border-violet-200 dark:border-violet-800">
              <div className="text-center">
                <div className="inline-block px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 mb-4">
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">Depois</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground">Com Ide.On</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">3 minutos</p>
                    <p className="text-sm text-muted-foreground">Criação assistida de 7 formatos</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">3x mais alcance</p>
                    <p className="text-sm text-muted-foreground">Milhares durante a semana</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <p className="text-center text-lg text-muted-foreground italic">
            "Ide por todo o mundo e pregai o evangelho a toda criatura" — Marcos 16:15
          </p>
        </div>
      </div>
    </section>
  );
};
