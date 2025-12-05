import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, Lightbulb, Package, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { normalizeGuiaData } from "@/lib/normalizeContentData";

interface GuiaViewProps {
  guia?: any;
  data?: any;
  onRegenerate?: () => void;
}

export const GuiaView = ({ guia, data, onRegenerate }: GuiaViewProps) => {
  // Normalizar dados de múltiplas fontes
  const rawData = guia || data?.guia || data;
  const normalized = normalizeGuiaData(rawData);
  
  const hasContent = normalized.passos && normalized.passos.length > 0;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const copyAll = () => {
    let fullText = `📘 ${normalized.titulo}\n\n`;
    if (normalized.introducao) fullText += `${normalized.introducao}\n\n`;
    
    if (normalized.recursos_necessarios?.length > 0) {
      fullText += `📦 RECURSOS NECESSÁRIOS:\n`;
      normalized.recursos_necessarios.forEach(r => {
        fullText += `• ${r}\n`;
      });
      fullText += '\n';
    }
    
    fullText += `📋 PASSOS:\n\n`;
    normalized.passos.forEach((passo) => {
      fullText += `${passo.numero}. ${passo.titulo}\n`;
      fullText += `${passo.descricao}\n`;
      if (passo.dica) fullText += `💡 Dica: ${passo.dica}\n`;
      fullText += '\n';
    });
    
    if (normalized.conclusao) fullText += `✅ CONCLUSÃO:\n${normalized.conclusao}`;
    
    copyToClipboard(fullText, "Guia completo");
  };

  if (!hasContent) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Guia incompleto</p>
          <p className="text-sm text-muted-foreground mb-4">
            Nenhum passo foi definido. Tente regenerar o conteúdo.
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
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle>{normalized.titulo}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={copyAll}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
          </div>
          {normalized.introducao && (
            <p className="text-sm text-muted-foreground mt-2">{normalized.introducao}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {normalized.recursos_necessarios && normalized.recursos_necessarios.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm mb-2">Recursos Necessários</p>
                    <ul className="space-y-1">
                      {normalized.recursos_necessarios.map((recurso, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3" />
                          {recurso}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {normalized.passos.map((passo, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Badge variant="outline" className="h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                      {passo.numero}
                    </Badge>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold">{passo.titulo}</h4>
                      <p className="text-sm text-muted-foreground">{passo.descricao}</p>
                      {passo.dica && (
                        <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg mt-3">
                          <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Dica:</span> {passo.dica}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {normalized.conclusao && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{normalized.conclusao}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};