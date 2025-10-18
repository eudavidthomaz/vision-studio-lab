import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, BookOpen, Calendar, CheckCircle2 } from "lucide-react";

interface DiscipuladoViewProps {
  plano: {
    titulo: string;
    objetivo: string;
    duracao: string;
    encontros: Array<{
      numero: number;
      tema: string;
      objetivos: string[];
      versiculo_base: string;
      atividades: string[];
      tarefa_casa: string;
    }>;
    recursos: string[];
  };
}

export const DiscipuladoView = ({ plano }: DiscipuladoViewProps) => {
  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>{plano.titulo}</CardTitle>
          </div>
          <Badge variant="outline" className="w-fit gap-2 mt-2">
            <Calendar className="h-3 w-3" />
            {plano.duracao}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Objetivo do Plano</p>
                  <p className="text-sm text-muted-foreground mt-1">{plano.objetivo}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {plano.encontros.map((encontro, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="h-8 w-8 rounded-full flex items-center justify-center">
                        {encontro.numero}
                      </Badge>
                      <h4 className="font-semibold">{encontro.tema}</h4>
                    </div>

                    <div className="ml-11 space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">🎯 Objetivos:</p>
                        <ul className="space-y-1">
                          {encontro.objetivos.map((objetivo, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              {objetivo}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-muted/50 rounded-lg flex items-start gap-2">
                        <BookOpen className="h-4 w-4 text-primary mt-0.5" />
                        <p className="text-sm text-muted-foreground italic flex-1">
                          {encontro.versiculo_base}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">📋 Atividades:</p>
                        <ul className="space-y-1">
                          {encontro.atividades.map((atividade, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {atividade}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-primary/5 rounded-lg">
                        <p className="text-sm font-medium mb-1">📝 Tarefa de Casa:</p>
                        <p className="text-sm text-muted-foreground">{encontro.tarefa_casa}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {plano.recursos && plano.recursos.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="font-medium text-sm mb-2">📚 Recursos Recomendados:</p>
                <ul className="space-y-1">
                  {plano.recursos.map((recurso, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      {recurso}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
