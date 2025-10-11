import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, BarChart3 } from "lucide-react";

interface EstrategiaSocialViewProps {
  data: {
    titulo: string;
    objetivo_estrategico: string;
    publico_alvo: string;
    pilares_conteudo: Array<{
      nome: string;
      descricao: string;
      frequencia: string;
      exemplos: string[];
    }>;
    metricas_acompanhamento: Array<{
      metrica: string;
      meta: string;
      como_medir: string;
    }>;
    proximos_passos: string[];
  };
}

export const EstrategiaSocialView = ({ data }: EstrategiaSocialViewProps) => {
  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 max-w-4xl mx-auto">
      
      {/* Header */}
      <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-200 dark:border-violet-800">
        <CardHeader>
          <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-violet-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl break-words">
                {data.titulo}
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Plano estratégico para crescimento nas redes sociais
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Objetivo e Público */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card className="border-l-4 border-l-violet-500">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Target className="w-4 h-4" />
              Objetivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {data.objetivo_estrategico}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Público-Alvo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {data.publico_alvo}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Pilares de Conteúdo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Pilares de Conteúdo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.pilares_conteudo?.map((pilar, index) => (
            <div key={index} className="p-4 bg-muted/30 rounded-lg space-y-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h4 className="font-semibold text-sm sm:text-base">{pilar.nome}</h4>
                <Badge variant="secondary" className="text-xs">
                  {pilar.frequencia}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {pilar.descricao}
              </p>
              {pilar.exemplos && pilar.exemplos.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-semibold mb-1">Exemplos:</p>
                  <ul className="space-y-1">
                    {pilar.exemplos.map((exemplo, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-violet-600">•</span>
                        <span>{exemplo}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Métricas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            Métricas de Acompanhamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.metricas_acompanhamento?.map((metrica, index) => (
              <div key={index} className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="font-semibold text-sm">{metrica.metrica}</p>
                  <Badge className="bg-green-600 shrink-0 text-xs">
                    Meta: {metrica.meta}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrica.como_medir}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Próximos Passos */}
      {data.proximos_passos && data.proximos_passos.length > 0 && (
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">🚀 Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {data.proximos_passos.map((passo, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                  <Badge variant="outline" className="shrink-0 font-mono">
                    {i + 1}
                  </Badge>
                  <span>{passo}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
      
    </div>
  );
};
