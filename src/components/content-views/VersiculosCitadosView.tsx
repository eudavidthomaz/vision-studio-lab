import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { safeString } from "@/lib/normalizeContentData";

interface VersiculosCitadosViewProps {
  versiculos?: any;
  data?: any;
  onRegenerate?: () => void;
}

export const VersiculosCitadosView = ({ versiculos, data, onRegenerate }: VersiculosCitadosViewProps) => {
  // Normalizar dados de múltiplas estruturas possíveis
  const rawData = versiculos || data?.versiculos || data || {};
  
  const normalized = {
    origem: rawData.origem || rawData.fonte || '',
    versiculos: Array.isArray(rawData.versiculos) ? rawData.versiculos : 
                Array.isArray(rawData.lista) ? rawData.lista : [],
  };
  
  const hasContent = normalized.versiculos.length > 0;

  const copyAll = () => {
    let fullText = `📖 VERSÍCULOS CITADOS\n`;
    if (normalized.origem) fullText += `Fonte: ${normalized.origem}\n\n`;
    
    normalized.versiculos.forEach((v) => {
      fullText += `${v.referencia || ''}\n`;
      fullText += `"${v.texto_completo || v.texto || ''}"\n`;
      if (v.contexto_uso) fullText += `Contexto: ${v.contexto_uso}\n`;
      fullText += '\n';
    });
    
    navigator.clipboard.writeText(fullText);
    toast.success("Versículos copiados!");
  };

  if (!hasContent) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Nenhum versículo encontrado</p>
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
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle>Versículos Citados</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={copyAll}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {normalized.origem && (
            <p className="text-sm text-muted-foreground mt-2">{normalized.origem}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
              {normalized.versiculos.map((versiculo, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-primary mb-2">
                        {safeString(versiculo.referencia) || `Versículo ${index + 1}`}
                      </p>
                      <p className="text-sm text-muted-foreground italic leading-relaxed">
                        "{safeString(versiculo.texto_completo || versiculo.texto)}"
                      </p>
                    </div>
                    {versiculo.contexto_uso && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Contexto:</span> {safeString(versiculo.contexto_uso)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
