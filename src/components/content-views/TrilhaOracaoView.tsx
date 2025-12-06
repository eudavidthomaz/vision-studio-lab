import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Clock, BookOpen, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { normalizeTrilhaOracaoData, safeString } from "@/lib/normalizeContentData";

interface TrilhaOracaoViewProps {
  trilha?: any;
  data?: any;
  onRegenerate?: () => void;
}

export const TrilhaOracaoView = ({ trilha, data, onRegenerate }: TrilhaOracaoViewProps) => {
  // Normalizar dados de múltiplas fontes
  const rawData = trilha || data?.trilha || data;
  const normalized = normalizeTrilhaOracaoData(rawData);
  
  const hasContent = normalized.etapas && normalized.etapas.length > 0;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const copyAll = () => {
    let fullText = `🙏 ${normalized.titulo}\n`;
    fullText += `⏱️ Duração: ${normalized.duracao_estimada}\n\n`;
    if (normalized.introducao) fullText += `📝 ${normalized.introducao}\n\n`;
    
    normalized.etapas.forEach((etapa) => {
      fullText += `--- Etapa ${etapa.numero}: ${etapa.nome} (${etapa.tempo_sugerido}) ---\n`;
      fullText += `${etapa.orientacao}\n`;
      if (etapa.versiculo_guia) fullText += `📖 ${etapa.versiculo_guia}\n`;
      fullText += '\n';
    });
    
    if (normalized.encerramento) fullText += `✨ Encerramento:\n${normalized.encerramento}`;
    
    copyToClipboard(fullText, "Trilha de Oração completa");
  };

  if (!hasContent) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Trilha de Oração incompleta</p>
          <p className="text-sm text-muted-foreground mb-4">
            Nenhuma etapa foi definida. Tente regenerar o conteúdo.
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
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <CardTitle>{normalized.titulo}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={copyAll}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
          </div>
          <Badge variant="outline" className="w-fit gap-2 mt-2">
            <Clock className="h-3 w-3" />
            {normalized.duracao_estimada}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {normalized.introducao && (
            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">{normalized.introducao}</p>
            </div>
          )}

          <div className="space-y-4">
            {normalized.etapas.map((etapa, index) => (
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
                    
                    <p className="text-sm text-muted-foreground ml-11">{safeString(etapa.orientacao)}</p>
                    
                    {etapa.versiculo_guia && (
                      <div className="ml-11 p-3 bg-muted/50 rounded-lg flex items-start gap-2">
                        <BookOpen className="h-4 w-4 text-primary mt-0.5" />
                        <p className="text-sm text-muted-foreground italic flex-1">
                          {safeString(etapa.versiculo_guia)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {normalized.encerramento && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <p className="font-medium text-sm mb-2">✨ Encerramento</p>
                <p className="text-sm text-muted-foreground">{normalized.encerramento}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};