import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Target, Users, CheckCircle2, AlertCircle, TrendingUp, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface IdeiaEstrategicaViewProps {
  data?: any;
  onRegenerate?: () => void;
}

export const IdeiaEstrategicaView = ({ data, onRegenerate }: IdeiaEstrategicaViewProps) => {
  // Normalizar dados de múltiplas estruturas possíveis
  const rawData = data?.ideia_estrategica || data?.ideia || data || {};
  
  const normalized = {
    titulo: rawData?.titulo || 'Ideia Estratégica',
    problema_real: rawData?.problema_real || rawData?.problema || rawData?.contexto || '',
    proposta: rawData?.proposta || rawData?.solucao || rawData?.descricao || '',
    hook_psicologico: rawData?.hook_psicologico || rawData?.hook || rawData?.gatilho || '',
    pilar_editorial: rawData?.pilar_editorial || rawData?.pilar || 'Estratégia',
    base_academica: Array.isArray(rawData?.base_academica) ? rawData.base_academica : 
                    rawData?.base_academica ? [rawData.base_academica] : [],
    implementacao: {
      equipe_solo: rawData?.implementacao?.equipe_solo || rawData?.equipe_solo || '',
      equipe_pequena: rawData?.implementacao?.equipe_pequena || rawData?.equipe_pequena || '',
      equipe_estruturada: rawData?.implementacao?.equipe_estruturada || rawData?.equipe_estruturada || '',
    },
    passos_praticos: Array.isArray(rawData?.passos_praticos) ? rawData.passos_praticos : 
                     Array.isArray(rawData?.passos) ? rawData.passos : [],
    metricas_de_fruto: rawData?.metricas_de_fruto || rawData?.metricas || rawData?.kpis || '',
    filtro_etico: rawData?.filtro_etico || rawData?.etica || rawData?.consideracoes || '',
    exemplo_pratico: rawData?.exemplo_pratico || rawData?.exemplo || '',
  };
  
  const hasContent = normalized.titulo && (normalized.proposta || normalized.problema_real);

  const copyAll = () => {
    let fullText = `💡 ${normalized.titulo}\n\n`;
    if (normalized.problema_real) fullText += `❓ PROBLEMA:\n${normalized.problema_real}\n\n`;
    if (normalized.proposta) fullText += `🎯 PROPOSTA:\n${normalized.proposta}\n\n`;
    if (normalized.hook_psicologico) fullText += `🧠 HOOK: ${normalized.hook_psicologico}\n\n`;
    if (normalized.base_academica.length > 0) {
      fullText += `📚 FUNDAMENTAÇÃO:\n`;
      normalized.base_academica.forEach(b => fullText += `• ${b}\n`);
      fullText += '\n';
    }
    if (normalized.passos_praticos.length > 0) {
      fullText += `✅ PASSOS:\n`;
      normalized.passos_praticos.forEach((p, i) => fullText += `${i + 1}. ${p}\n`);
      fullText += '\n';
    }
    if (normalized.metricas_de_fruto) fullText += `📊 MÉTRICAS: ${normalized.metricas_de_fruto}\n`;
    
    navigator.clipboard.writeText(fullText);
    toast.success("Ideia copiada!");
  };

  if (!hasContent) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Ideia estratégica incompleta</p>
          <p className="text-sm text-muted-foreground mb-4">
            O conteúdo não foi gerado corretamente. Tente regenerar.
          </p>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerar
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Lightbulb className="h-8 w-8 text-primary shrink-0 mt-1" />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-2xl mb-2">{normalized.titulo}</CardTitle>
                <Button variant="ghost" size="sm" onClick={copyAll}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Badge variant="secondary" className="mb-3">
                {normalized.pilar_editorial}
              </Badge>
              {normalized.problema_real && (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {normalized.problema_real}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Proposta */}
      {normalized.proposta && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Proposta Estratégica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-line">{normalized.proposta}</p>
            {normalized.hook_psicologico && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-2">Hook Psicológico:</p>
                <p className="text-sm">{normalized.hook_psicologico}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Base Acadêmica */}
      {normalized.base_academica.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📚 Fundamentação Acadêmica</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {normalized.base_academica.map((base, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{base}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Implementação por Tamanho de Equipe */}
      {(normalized.implementacao.equipe_solo || normalized.implementacao.equipe_pequena || normalized.implementacao.equipe_estruturada) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Como Implementar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {normalized.implementacao.equipe_solo && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-primary">👤 Equipe Solo (1 pessoa)</h4>
                <p className="text-sm text-muted-foreground">{normalized.implementacao.equipe_solo}</p>
              </div>
            )}
            {normalized.implementacao.equipe_pequena && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-primary">👥 Equipe Pequena (2-5 pessoas)</h4>
                <p className="text-sm text-muted-foreground">{normalized.implementacao.equipe_pequena}</p>
              </div>
            )}
            {normalized.implementacao.equipe_estruturada && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-primary">🏢 Equipe Estruturada (10+ pessoas)</h4>
                <p className="text-sm text-muted-foreground">{normalized.implementacao.equipe_estruturada}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Passos Práticos */}
      {normalized.passos_praticos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">✅ Passo a Passo</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {normalized.passos_praticos.map((passo, idx) => (
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
      )}

      {/* Métricas de Fruto */}
      {normalized.metricas_de_fruto && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5" />
              Como Medir o Impacto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{normalized.metricas_de_fruto}</p>
          </CardContent>
        </Card>
      )}

      {/* Filtro Ético */}
      {normalized.filtro_etico && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-5 w-5" />
              Filtro Ético e Teológico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{normalized.filtro_etico}</p>
          </CardContent>
        </Card>
      )}

      {/* Exemplo Prático */}
      {normalized.exemplo_pratico && (
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="text-base text-emerald-700 dark:text-emerald-400">
              💡 Exemplo Prático
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{normalized.exemplo_pratico}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
