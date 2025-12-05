import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, List, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface EsbocoViewProps {
  esboco?: any;
  data?: any;
  onRegenerate?: () => void;
}

export const EsbocoView = ({ esboco, data, onRegenerate }: EsbocoViewProps) => {
  // Normalizar dados de múltiplas estruturas possíveis
  const rawData = esboco || data?.esboco || data || {};
  
  const normalized = {
    titulo: rawData.titulo || 'Esboço',
    introducao: rawData.introducao || rawData.abertura || '',
    topicos: Array.isArray(rawData.topicos) ? rawData.topicos : 
             Array.isArray(rawData.pontos) ? rawData.pontos : [],
    conclusao: rawData.conclusao || rawData.fechamento || '',
  };
  
  const hasContent = normalized.titulo && (normalized.topicos.length > 0 || normalized.introducao);

  const copyAll = () => {
    let fullText = `📋 ${normalized.titulo}\n\n`;
    if (normalized.introducao) fullText += `INTRODUÇÃO:\n${normalized.introducao}\n\n`;
    
    normalized.topicos.forEach((topico) => {
      fullText += `${topico.numero || '•'} ${topico.titulo || ''}\n`;
      const subtopicos = Array.isArray(topico.subtopicos) ? topico.subtopicos : [];
      subtopicos.forEach(sub => {
        fullText += `   - ${sub}\n`;
      });
      if (topico.versiculo_base) fullText += `   📖 ${topico.versiculo_base}\n`;
      fullText += '\n';
    });
    
    if (normalized.conclusao) fullText += `CONCLUSÃO:\n${normalized.conclusao}`;
    
    navigator.clipboard.writeText(fullText);
    toast.success("Esboço copiado!");
  };

  if (!hasContent) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Esboço incompleto</p>
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
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>{normalized.titulo}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={copyAll}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {normalized.introducao && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{normalized.introducao}</p>
            </div>
          )}

          {normalized.topicos.length > 0 && (
            <div className="space-y-4">
              {normalized.topicos.map((topico, index) => {
                const subtopicos = Array.isArray(topico.subtopicos) ? topico.subtopicos : [];
                return (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="shrink-0 font-mono">
                            {topico.numero || index + 1}
                          </Badge>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2">{topico.titulo || `Tópico ${index + 1}`}</h4>
                            {subtopicos.length > 0 && (
                              <div className="space-y-1 ml-4">
                                {subtopicos.map((sub, subIndex) => (
                                  <div key={subIndex} className="flex items-start gap-2">
                                    <List className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                    <p className="text-sm text-muted-foreground">{sub}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {topico.versiculo_base && (
                          <div className="ml-10 p-3 bg-primary/5 rounded-lg">
                            <p className="text-sm text-muted-foreground italic">
                              📖 {topico.versiculo_base}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {normalized.conclusao && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <p className="font-medium text-sm mb-2">Conclusão</p>
                <p className="text-sm text-muted-foreground">{normalized.conclusao}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
