import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Info, Bell, Calendar, User, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { normalizeAvisoData } from "@/lib/normalizeContentData";

interface AvisoViewProps {
  aviso?: any;
  data?: any;
  onRegenerate?: () => void;
}

const getTipoConfig = (tipo: string) => {
  const configs: Record<string, { icon: any; color: string; bgColor: string }> = {
    Urgente: { icon: AlertCircle, color: "text-red-600", bgColor: "bg-red-500/10 border-red-200" },
    Importante: { icon: Bell, color: "text-yellow-600", bgColor: "bg-yellow-500/10 border-yellow-200" },
    Informativo: { icon: Info, color: "text-blue-600", bgColor: "bg-blue-500/10 border-blue-200" },
  };
  return configs[tipo] || configs.Informativo;
};

export const AvisoView = ({ aviso, data, onRegenerate }: AvisoViewProps) => {
  // Normalizar dados de múltiplas fontes
  const rawData = aviso || data?.aviso || data;
  const normalized = normalizeAvisoData(rawData);
  
  const config = getTipoConfig(normalized.tipo);
  const IconComponent = config.icon;
  
  const hasContent = normalized.titulo && normalized.mensagem;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const copyAll = () => {
    let fullText = `⚠️ ${normalized.tipo.toUpperCase()}: ${normalized.titulo}\n\n`;
    fullText += `${normalized.mensagem}\n\n`;
    fullText += `📅 Válido até: ${normalized.data_vigencia}\n`;
    fullText += `👤 Responsável: ${normalized.responsavel}\n`;
    if (normalized.chamado_acao) fullText += `\n🔔 ${normalized.chamado_acao}`;
    
    copyToClipboard(fullText, "Aviso completo");
  };

  if (!hasContent) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Aviso incompleto</p>
          <p className="text-sm text-muted-foreground mb-4">
            O aviso não foi gerado corretamente. Tente regenerar.
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
      <Card className={`border-2 ${config.bgColor}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <IconComponent className={`h-6 w-6 ${config.color}`} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className={config.color}>
                  {normalized.tipo}
                </Badge>
                <Button variant="ghost" size="sm" onClick={copyAll}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-xl">{normalized.titulo}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-background rounded-lg">
            <p className="text-muted-foreground whitespace-pre-wrap">{normalized.mensagem}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                <span className="font-medium">Válido até:</span> {normalized.data_vigencia}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                <span className="font-medium">Responsável:</span> {normalized.responsavel}
              </span>
            </div>
          </div>

          {normalized.chamado_acao && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="font-semibold text-sm text-primary">{normalized.chamado_acao}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};