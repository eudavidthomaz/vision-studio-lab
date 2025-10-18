import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, Lightbulb, Package } from "lucide-react";

interface GuiaViewProps {
  guia: {
    titulo: string;
    introducao: string;
    passos: Array<{
      numero: number;
      titulo: string;
      descricao: string;
      dica?: string;
    }>;
    recursos_necessarios: string[];
    conclusao: string;
  };
}

export const GuiaView = ({ guia }: GuiaViewProps) => {
  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>{guia.titulo}</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{guia.introducao}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {guia.recursos_necessarios && guia.recursos_necessarios.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm mb-2">Recursos Necessários</p>
                    <ul className="space-y-1">
                      {guia.recursos_necessarios.map((recurso, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3" />
                          {recurso}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {guia.passos.map((passo, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Badge variant="outline" className="h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                      {passo.numero}
                    </Badge>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold">{passo.titulo}</h4>
                      <p className="text-sm text-muted-foreground">{passo.descricao}</p>
                      {passo.dica && (
                        <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg mt-3">
                          <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Dica:</span> {passo.dica}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{guia.conclusao}</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
