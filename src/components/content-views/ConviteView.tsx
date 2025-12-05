import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Phone, Image as ImageIcon, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import ImageGenerationModal from "@/components/ImageGenerationModal";
import { normalizeConviteData } from "@/lib/normalizeContentData";

interface ConviteViewProps {
  convite?: any;
  data?: any;
  onRegenerate?: () => void;
}

export const ConviteView = ({ convite, data, onRegenerate }: ConviteViewProps) => {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Normalizar dados de múltiplas fontes
  const rawData = convite || data?.convite || data;
  const normalized = normalizeConviteData(rawData);
  
  const hasContent = normalized.titulo_evento && (normalized.descricao || normalized.chamado_acao);

  const handleGenerateImage = () => {
    setIsGenerating(true);
    setImageModalOpen(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const copyAll = () => {
    let fullText = `🎉 ${normalized.titulo_evento}\n\n`;
    fullText += `📅 ${normalized.data} às ${normalized.horario}\n`;
    fullText += `📍 ${normalized.local}\n\n`;
    fullText += `${normalized.descricao}\n\n`;
    fullText += `👥 Para: ${normalized.publico_alvo}\n`;
    fullText += `✅ Como participar: ${normalized.como_participar}\n`;
    if (normalized.contato) fullText += `📞 Contato: ${normalized.contato}\n`;
    fullText += `\n🔥 ${normalized.chamado_acao}`;
    
    copyToClipboard(fullText, "Convite completo");
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
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader className="text-center p-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1" />
            <Button variant="ghost" size="sm" onClick={copyAll}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-sm font-semibold line-clamp-2 leading-tight">
            {normalized.titulo_evento}
          </CardTitle>
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
            <Badge variant="outline" className="gap-1.5 text-xs">
              <Calendar className="h-3 w-3" />
              {normalized.data}
            </Badge>
            <Badge variant="outline" className="gap-1.5 text-xs">
              <Clock className="h-3 w-3" />
              {normalized.horario}
            </Badge>
            <Badge variant="outline" className="gap-1.5 text-xs">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{normalized.local}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-2">
          <Button
            variant={generatedImage ? "outline" : "default"}
            onClick={handleGenerateImage}
            disabled={isGenerating}
            className="w-full h-8 text-xs"
          >
            <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
            {isGenerating ? "Gerando..." : generatedImage ? "Regerar" : "Gerar Arte"}
          </Button>

          {generatedImage && (
            <div id="generated-invite-image" className="rounded-lg overflow-hidden bg-muted">
              <img 
                src={generatedImage} 
                alt="Arte do convite"
                className="w-full h-auto"
              />
            </div>
          )}

          <div>
            <p className="text-xs text-muted-foreground break-words whitespace-pre-wrap leading-relaxed">
              {normalized.descricao}
            </p>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-2">
              <div className="flex items-start gap-2">
                <Users className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs">Para quem é?</p>
                  <p className="text-xs text-muted-foreground mt-1 break-words">{normalized.publico_alvo}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-xs">Como participar:</h4>
            <p className="text-xs text-muted-foreground break-words">{normalized.como_participar}</p>
          </div>

          {normalized.contato && (
            <Card className="bg-muted/50">
              <CardContent className="p-2">
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="h-3 w-3 text-primary flex-shrink-0" />
                  <span className="font-medium">Contato:</span>
                  <span className="text-muted-foreground break-all">{normalized.contato}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center p-2 bg-primary text-primary-foreground rounded-lg">
            <p className="text-xs font-semibold break-words">{normalized.chamado_acao}</p>
          </div>
        </CardContent>
      </Card>

      <ImageGenerationModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        copy={`${normalized.titulo_evento}\n\n${normalized.descricao}\n\n${normalized.data} às ${normalized.horario}\n${normalized.local}`}
        pilar="Alcançar"
        defaultFormat="feed_square"
        onImageGenerated={(imageUrl) => {
          setGeneratedImage(imageUrl);
          setIsGenerating(false);
          toast.success("Arte do convite gerada!");
          
          setTimeout(() => {
            const element = document.getElementById('generated-invite-image');
            element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }}
      />
    </div>
  );
};