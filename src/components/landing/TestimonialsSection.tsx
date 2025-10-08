import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

export const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Pastores Que Já Estão Indo
            </h2>
            <p className="text-lg text-muted-foreground font-body">
              Em breve, testemunhos reais de transformação
            </p>
          </div>

          <Card className="p-12 bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-950/20 dark:to-pink-950/20 border-2">
            <div className="space-y-6">
              <Quote className="w-12 h-12 text-violet-400 mx-auto" />
              <p className="text-lg text-foreground font-body italic leading-relaxed">
                "Espaço reservado para testemunhos de pastores que estão multiplicando
                o alcance do evangelho através do Ide.On"
              </p>
              <div className="pt-4">
                <p className="font-semibold text-foreground">— Em breve</p>
                <p className="text-sm text-muted-foreground">Junte-se aos primeiros</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
