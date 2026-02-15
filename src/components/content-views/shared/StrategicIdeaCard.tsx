import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Compass, Target, Users, Megaphone, Sparkles } from "lucide-react";
import { safeString } from "@/lib/normalizeContentData";

interface StrategicIdeaCardProps {
  ideia?: {
    titulo?: string;
    objetivo?: string;
    publico_alvo?: string;
    promessa?: string;
    chamada_para_acao?: string;
    tom?: string;
    formato_prioritario?: string;
    proximos_passos?: string;
  };
}

export function StrategicIdeaCard({ ideia }: StrategicIdeaCardProps) {
  if (!ideia) return null;

  const hasContent = ideia.objetivo || ideia.promessa || ideia.chamada_para_acao;
  if (!hasContent) return null;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <div className="flex flex-wrap items-start gap-2 sm:gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg">
              <Compass className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <span className="line-clamp-1">Ideia Estratégica</span>
            </CardTitle>
            {ideia.titulo && (
              <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2">{ideia.titulo}</p>
            )}
          </div>
          {ideia.formato_prioritario && (
            <Badge className="bg-primary text-primary-foreground text-[10px] sm:text-xs flex-shrink-0">
              {ideia.formato_prioritario}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-relaxed">
        {ideia.objetivo && (
          <div className="flex items-start gap-2">
            <Target className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="font-semibold">Objetivo</p>
            <p className="text-muted-foreground whitespace-pre-line">{safeString(ideia.objetivo)}</p>
          </div>
        </div>
      )}

      {ideia.promessa && (
        <div className="flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-primary mt-0.5" />
          <div>
            <p className="font-semibold">Mensagem Central</p>
            <p className="text-muted-foreground whitespace-pre-line">{safeString(ideia.promessa)}</p>
            </div>
          </div>
        )}

        {(ideia.publico_alvo || ideia.tom) && (
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-primary mt-0.5" />
            <div className="space-y-1">
              {ideia.publico_alvo && (
                <div>
                  <p className="font-semibold">Público</p>
                  <p className="text-muted-foreground">{safeString(ideia.publico_alvo)}</p>
                </div>
              )}
              {ideia.tom && (
                <div>
                  <p className="font-semibold">Tom e Estilo</p>
                  <p className="text-muted-foreground">{safeString(ideia.tom)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {(ideia.chamada_para_acao || ideia.proximos_passos) && (
          <div className="flex items-start gap-2">
            <Megaphone className="h-4 w-4 text-primary mt-0.5" />
            <div className="space-y-1">
              {ideia.chamada_para_acao && (
                <div>
                  <p className="font-semibold">Chamada para Ação</p>
                  <p className="text-muted-foreground whitespace-pre-line">{safeString(ideia.chamada_para_acao)}</p>
                </div>
              )}
              {ideia.proximos_passos && (
                <div>
                  <p className="font-semibold">Próximos Passos</p>
                  <p className="text-muted-foreground whitespace-pre-line">{safeString(ideia.proximos_passos)}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
