import { Card } from "@/components/ui/card";
import { Clock, Users, ArrowRight } from "lucide-react";

export const VisualShowcase = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-16 text-foreground">
            De Pregação para Proclamação Digital
          </h2>

          {/* Before/After Comparison */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Before */}
            <Card className="p-8 border-2 border-muted">
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-muted rounded-full">
                  <p className="text-sm font-semibold text-muted-foreground">Antes</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">5+ horas criando posts</p>
                      <p className="text-sm text-muted-foreground">Tempo que poderia ser usado no pastoreio</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Alcance limitado</p>
                      <p className="text-sm text-muted-foreground">Mensagem presa ao domingo</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* After */}
            <Card className="p-8 border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-950/20 dark:to-pink-950/20">
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-violet-100 dark:bg-violet-900/40 rounded-full">
                  <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">Depois</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">3 minutos de criação assistida</p>
                      <p className="text-sm text-muted-foreground">Mais tempo para pessoas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Milhares alcançados na semana</p>
                      <p className="text-sm text-muted-foreground">Mensagem multiplica durante 7 dias</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground font-body italic max-w-2xl mx-auto">
              "Ide por todo o mundo e pregai o evangelho a toda criatura."
              <br />
              <span className="text-sm">— Marcos 16:15</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
