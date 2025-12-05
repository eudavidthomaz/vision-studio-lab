import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, MapPin, Phone, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ConviteGruposViewProps {
  convite?: any;
  data?: any;
  onRegenerate?: () => void;
}

export const ConviteGruposView = ({ convite, data, onRegenerate }: ConviteGruposViewProps) => {
  // Normalizar dados de múltiplas fontes
  const rawData = convite || data?.convite || data;
  
  const normalized = {
    tipo_grupo: rawData?.tipo_grupo || rawData?.tipo || 'Grupo',
    nome_grupo: rawData?.nome_grupo || rawData?.nome || rawData?.titulo || 'Grupo',
    descricao: rawData?.descricao || rawData?.sobre || '',
    publico: rawData?.publico || rawData?.publico_alvo || 'Todos são bem-vindos',
    quando: rawData?.quando || rawData?.horario || '[A definir]',
    onde: rawData?.onde || rawData?.local || '[A definir]',
    como_entrar: rawData?.como_entrar || rawData?.inscricao || 'Entre em contato',
    contato: rawData?.contato || '',
    chamado_acao: rawData?.chamado_acao || rawData?.cta || 'Participe!',
  };
  
  const hasContent = normalized.nome_grupo && (normalized.descricao || normalized.chamado_acao);

  const copyToClipboard = () => {
    let fullText = `👥 ${normalized.tipo_grupo}: ${normalized.nome_grupo}\n\n`;
    fullText += `${normalized.descricao}\n\n`;
    fullText += `🎯 Para: ${normalized.publico}\n`;
    fullText += `📅 Quando: ${normalized.quando}\n`;
    fullText += `📍 Onde: ${normalized.onde}\n`;
    fullText += `📞 Contato: ${normalized.contato}\n\n`;
    fullText += `✅ Como entrar: ${normalized.como_entrar}\n\n`;
    fullText += `🔥 ${normalized.chamado_acao}`;
    
    navigator.clipboard.writeText(fullText);
    toast.success("Convite copiado!");
  };

  if (!hasContent) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Convite incompleto</p>
          <p className="text-sm text-muted-foreground mb-4">
            O convite não foi gerado corretamente. Tente regenerar.
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
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1" />
            <Button variant="ghost" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Badge variant="outline" className="w-fit mx-auto mb-3">
            {normalized.tipo_grupo}
          </Badge>
          <CardTitle className="text-2xl">{normalized.nome_grupo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground whitespace-pre-wrap">{normalized.descricao}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Para quem é</p>
                    <p className="text-sm text-muted-foreground mt-1">{normalized.publico}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Quando</p>
                    <p className="text-sm text-muted-foreground mt-1">{normalized.quando}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Onde</p>
                    <p className="text-sm text-muted-foreground mt-1">{normalized.onde}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Contato</p>
                    <p className="text-sm text-muted-foreground mt-1">{normalized.contato || '[Não informado]'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Como entrar no grupo:</h4>
            <p className="text-sm text-muted-foreground">{normalized.como_entrar}</p>
          </div>

          <div className="text-center p-4 bg-primary text-primary-foreground rounded-lg">
            <p className="font-semibold">{normalized.chamado_acao}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};