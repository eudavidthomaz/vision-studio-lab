import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface VersiculosCitadosViewProps {
  versiculos: {
    origem: string;
    versiculos: Array<{
      referencia: string;
      texto_completo: string;
      contexto_uso: string;
    }>;
  };
}

export const VersiculosCitadosView = ({ versiculos }: VersiculosCitadosViewProps) => {
  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Versículos Citados</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{versiculos.origem}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {versiculos.versiculos.map((versiculo, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-primary mb-2">{versiculo.referencia}</p>
                      <p className="text-sm text-muted-foreground italic leading-relaxed">
                        "{versiculo.texto_completo}"
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Contexto:</span> {versiculo.contexto_uso}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
