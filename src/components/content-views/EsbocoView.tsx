import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, List } from "lucide-react";

interface EsbocoViewProps {
  esboco: {
    titulo: string;
    introducao: string;
    topicos: Array<{
      numero: string;
      titulo: string;
      subtopicos: string[];
      versiculo_base: string;
    }>;
    conclusao: string;
  };
}

export const EsbocoView = ({ esboco }: EsbocoViewProps) => {
  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>{esboco.titulo}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">{esboco.introducao}</p>
          </div>

          <div className="space-y-4">
            {esboco.topicos.map((topico, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="shrink-0 font-mono">
                        {topico.numero}
                      </Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">{topico.titulo}</h4>
                        <div className="space-y-1 ml-4">
                          {topico.subtopicos.map((sub, subIndex) => (
                            <div key={subIndex} className="flex items-start gap-2">
                              <List className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <p className="text-sm text-muted-foreground">{sub}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="ml-10 p-3 bg-primary/5 rounded-lg">
                      <p className="text-sm text-muted-foreground italic">
                        📖 {topico.versiculo_base}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="font-medium text-sm mb-2">Conclusão</p>
              <p className="text-sm text-muted-foreground">{esboco.conclusao}</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
