import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Target, Users, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

interface IdeiaEstrategicaViewProps {
  data: {
    titulo: string;
    problema_real: string;
    proposta: string;
    hook_psicologico: string;
    pilar_editorial: string;
    base_academica: string[];
    implementacao: {
      equipe_solo: string;
      equipe_pequena: string;
      equipe_estruturada: string;
    };
    passos_praticos: string[];
    metricas_de_fruto: string;
    filtro_etico: string;
    exemplo_pratico: string;
  };
}

export const IdeiaEstrategicaView = ({ data }: IdeiaEstrategicaViewProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Lightbulb className="h-8 w-8 text-primary shrink-0 mt-1" />
            <div>
              <CardTitle className="text-2xl mb-2">{data.titulo}</CardTitle>
              <Badge variant="secondary" className="mb-3">
                {data.pilar_editorial}
              </Badge>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {data.problema_real}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Proposta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Proposta Estratégica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-line">{data.proposta}</p>
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-2">Hook Psicológico:</p>
            <p className="text-sm">{data.hook_psicologico}</p>
          </div>
        </CardContent>
      </Card>

      {/* Base Acadêmica */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">📚 Fundamentação Acadêmica</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.base_academica.map((base, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{base}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Implementação por Tamanho de Equipe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Como Implementar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-primary">👤 Equipe Solo (1 pessoa)</h4>
            <p className="text-sm text-muted-foreground">{data.implementacao.equipe_solo}</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-primary">👥 Equipe Pequena (2-5 pessoas)</h4>
            <p className="text-sm text-muted-foreground">{data.implementacao.equipe_pequena}</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-primary">🏢 Equipe Estruturada (10+ pessoas)</h4>
            <p className="text-sm text-muted-foreground">{data.implementacao.equipe_estruturada}</p>
          </div>
        </CardContent>
      </Card>

      {/* Passos Práticos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">✅ Passo a Passo</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {data.passos_praticos.map((passo, idx) => (
              <li key={idx} className="text-sm flex items-start gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="pt-0.5">{passo}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Métricas de Fruto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5" />
            Como Medir o Impacto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{data.metricas_de_fruto}</p>
        </CardContent>
      </Card>

      {/* Filtro Ético */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-amber-700 dark:text-amber-400">
            <AlertCircle className="h-5 w-5" />
            Filtro Ético e Teológico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{data.filtro_etico}</p>
        </CardContent>
      </Card>

      {/* Exemplo Prático */}
      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardHeader>
          <CardTitle className="text-base text-emerald-700 dark:text-emerald-400">
            💡 Exemplo Prático
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{data.exemplo_pratico}</p>
        </CardContent>
      </Card>
    </div>
  );
};
