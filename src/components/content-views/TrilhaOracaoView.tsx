import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, BookOpen } from "lucide-react";

interface TrilhaOracaoViewProps {
  trilha: {
    titulo: string;
    duracao_estimada: string;
    introducao: string;
    etapas: Array<{
      numero: number;
      nome: string;
      orientacao: string;
      versiculo_guia: string;
      tempo_sugerido: string;
    }>;
    encerramento: string;
  };
}

export const TrilhaOracaoView = ({ trilha }: TrilhaOracaoViewProps) => {
  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <CardTitle>{trilha.titulo}</CardTitle>
          </div>
          <Badge variant="outline" className="w-fit gap-2 mt-2">
            <Clock className="h-3 w-3" />
            {trilha.duracao_estimada}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-primary/5 rounded-lg">
            <p className="text-sm text-muted-foreground">{trilha.introducao}</p>
          </div>

          <div className="space-y-4">
            {trilha.etapas.map((etapa, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="h-8 w-8 rounded-full flex items-center justify-center">
                          {etapa.numero}
                        </Badge>
                        <h4 className="font-semibold">{etapa.nome}</h4>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {etapa.tempo_sugerido}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground ml-11">{etapa.orientacao}</p>
                    
                    <div className="ml-11 p-3 bg-muted/50 rounded-lg flex items-start gap-2">
                      <BookOpen className="h-4 w-4 text-primary mt-0.5" />
                      <p className="text-sm text-muted-foreground italic flex-1">
                        {etapa.versiculo_guia}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="font-medium text-sm mb-2">Encerramento</p>
              <p className="text-sm text-muted-foreground">{trilha.encerramento}</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
