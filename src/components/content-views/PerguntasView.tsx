import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Copy, RefreshCw } from "lucide-react";
import { FundamentoBiblicoCard } from "./shared/FundamentoBiblicoCard";
import { toast } from "sonner";

interface PerguntasViewProps {
  data?: any;
  onRegenerate?: () => void;
}

export const PerguntasView = ({ data, onRegenerate }: PerguntasViewProps) => {
  // Normalizar dados de múltiplas estruturas possíveis
  const rawData = data?.perguntas_celula || data?.perguntas_reflexao || data?.perguntas || data || {};
  
  const normalized = {
    titulo: rawData.titulo || data?.titulo || 'Perguntas para Reflexão',
    fundamento_biblico: rawData.fundamento_biblico || data?.fundamento_biblico,
    perguntas: Array.isArray(rawData.perguntas) ? rawData.perguntas : 
               Array.isArray(rawData.questoes) ? rawData.questoes : 
               Array.isArray(data?.perguntas) ? data.perguntas : [],
    contexto_uso: rawData.contexto_uso || rawData.contexto || data?.contexto_uso || '',
  };
  
  const hasContent = normalized.perguntas.length > 0;

  const copyAll = () => {
    let fullText = `❓ ${normalized.titulo}\n\n`;
    if (normalized.contexto_uso) fullText += `Como usar: ${normalized.contexto_uso}\n\n`;
    
    normalized.perguntas.forEach((item, idx) => {
      const numero = item.numero || idx + 1;
      const pergunta = typeof item === 'string' ? item : item.pergunta || '';
      fullText += `${numero}. ${pergunta}\n`;
      if (item.objetivo) fullText += `   Objetivo: ${item.objetivo}\n`;
      if (item.dica_facilitador) fullText += `   💡 Dica: ${item.dica_facilitador}\n`;
      fullText += '\n';
    });
    
    navigator.clipboard.writeText(fullText);
    toast.success("Perguntas copiadas!");
  };

  if (!hasContent) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Nenhuma pergunta encontrada</p>
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
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 max-w-4xl mx-auto">
      
      {/* Header */}
      <Card className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-teal-200 dark:border-teal-800">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl sm:text-2xl md:text-3xl break-words">
                  {normalized.titulo}
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  Perguntas para grupos pequenos, células e discussões em comunidade
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={copyAll}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      {/* Fundamento Bíblico */}
      {normalized.fundamento_biblico && (
        <FundamentoBiblicoCard fundamento={normalized.fundamento_biblico} />
      )}
      
      {/* Contexto de Uso */}
      {normalized.contexto_uso && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              Como Usar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line text-muted-foreground">
              {normalized.contexto_uso}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Perguntas */}
      <div className="space-y-4">
        {normalized.perguntas.map((item, index) => {
          const perguntaText = typeof item === 'string' ? item : item.pergunta || '';
          const numero = typeof item === 'string' ? index + 1 : item.numero || index + 1;
          const objetivo = typeof item === 'string' ? '' : item.objetivo || '';
          const dica = typeof item === 'string' ? '' : item.dica_facilitador || '';
          
          return (
            <Card key={index} className="border-l-4 border-l-teal-500">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="shrink-0 font-mono">
                      {numero}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base sm:text-lg mb-2 break-words">
                        {perguntaText}
                      </p>
                      
                      {objetivo && (
                        <div className="p-3 bg-teal-50 dark:bg-teal-950/20 rounded-lg mb-3">
                          <p className="text-xs sm:text-sm">
                            <span className="font-semibold">Objetivo:</span> {objetivo}
                          </p>
                        </div>
                      )}
                      
                      {dica && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border-l-2 border-amber-400">
                          <p className="text-xs sm:text-sm">
                            <span className="font-semibold">💡 Dica para o facilitador:</span> {dica}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
    </div>
  );
};
