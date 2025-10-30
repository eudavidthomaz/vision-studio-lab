import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Target } from "lucide-react";

interface CalendarioViewProps {
  calendario: {
    periodo: string;
    objetivo: string;
    postagens: Array<{
      dia: string;
      horario_sugerido: string;
      formato: string;
      tema: string;
      pilar: string;
      versiculo_base?: string;
      objetivo_do_post: string;
    }>;
    observacoes: string;
  };
}

const getPillarColor = (pilar: string) => {
  const pillarMap: Record<string, string> = {
    ALCANÇAR: "bg-red-500/10 text-red-700 border-red-200",
    EDIFICAR: "bg-blue-500/10 text-blue-700 border-blue-200",
    PERTENCER: "bg-green-500/10 text-green-700 border-green-200",
    SERVIR: "bg-purple-500/10 text-purple-700 border-purple-200",
  };
  return pillarMap[pilar] || "bg-gray-500/10 text-gray-700 border-gray-200";
};

export const CalendarioView = ({ calendario }: CalendarioViewProps) => {
  // Validação defensiva - suporte para múltiplas estruturas
  const calData = calendario || (calendario as any)?.calendario_editorial || (calendario as any)?.data?.calendario;
  
  if (!calData || !calData.postagens || calData.postagens.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-yellow-500/50">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-2">⚠️ Calendário vazio ou incompleto</p>
            <p className="text-sm text-muted-foreground">
              Nenhuma postagem foi planejada. Tente regenerar o conteúdo com mais detalhes sobre o que você precisa para cada dia da semana.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { periodo, objetivo, postagens, observacoes } = calData;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Calendário Editorial</CardTitle>
          </div>
          {periodo && (
            <p className="text-sm text-muted-foreground mt-2">{periodo}</p>
          )}
        </CardHeader>
        <CardContent>
          {objetivo && (
            <div className="flex items-start gap-2 p-4 bg-primary/5 rounded-lg mb-6">
              <Target className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Objetivo do Período</p>
                <p className="text-sm text-muted-foreground mt-1">{objetivo}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {postagens.map((post, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{post.dia}</span>
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {post.horario_sugerido}
                        </Badge>
                        <Badge variant="secondary">{post.formato}</Badge>
                      </div>
                      <Badge className={getPillarColor(post.pilar)}>
                        {post.pilar}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-1">{post.tema}</h4>
                      <p className="text-sm text-muted-foreground">{post.objetivo_do_post}</p>
                    </div>

                    {post.versiculo_base && (
                      <p className="text-xs text-muted-foreground italic">
                        📖 {post.versiculo_base}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {observacoes && (
            <Card className="mt-6 bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm font-medium mb-2">💡 Observações Estratégicas</p>
                <p className="text-sm text-muted-foreground">{observacoes}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
