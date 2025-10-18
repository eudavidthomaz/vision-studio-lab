import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Phone, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import ImageGenerationModal from "@/components/ImageGenerationModal";

interface ConviteViewProps {
  convite: {
    titulo_evento: string;
    data: string;
    horario: string;
    local: string;
    descricao: string;
    publico_alvo: string;
    como_participar: string;
    contato?: string;
    chamado_acao: string;
  };
}

export const ConviteView = ({ convite }: ConviteViewProps) => {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerateImage = () => {
    setIsGenerating(true);
    setImageModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader className="text-center p-2">
          <CardTitle className="text-sm font-semibold line-clamp-2 leading-tight">{convite.titulo_evento}</CardTitle>
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
            <Badge variant="outline" className="gap-1.5 text-xs">
              <Calendar className="h-3 w-3" />
              {convite.data}
            </Badge>
            <Badge variant="outline" className="gap-1.5 text-xs">
              <Clock className="h-3 w-3" />
              {convite.horario}
            </Badge>
            <Badge variant="outline" className="gap-1.5 text-xs">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{convite.local}</span>
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
            <p className="text-xs text-muted-foreground break-words whitespace-pre-wrap leading-relaxed">{convite.descricao}</p>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-2">
              <div className="flex items-start gap-2">
                <Users className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs">Para quem é?</p>
                  <p className="text-xs text-muted-foreground mt-1 break-words">{convite.publico_alvo}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-xs">Como participar:</h4>
            <p className="text-xs text-muted-foreground break-words">{convite.como_participar}</p>
          </div>

          {convite.contato && (
            <Card className="bg-muted/50">
              <CardContent className="p-2">
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="h-3 w-3 text-primary flex-shrink-0" />
                  <span className="font-medium">Contato:</span>
                  <span className="text-muted-foreground break-all">{convite.contato}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center p-2 bg-primary text-primary-foreground rounded-lg">
            <p className="text-xs font-semibold break-words">{convite.chamado_acao}</p>
          </div>
        </CardContent>
      </Card>

      <ImageGenerationModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        copy={`${convite.titulo_evento}\n\n${convite.descricao}\n\n${convite.data} às ${convite.horario}\n${convite.local}`}
        pilar="Alcançar"
        defaultFormat="feed_square"
        onImageGenerated={(imageUrl) => {
          setGeneratedImage(imageUrl);
          setIsGenerating(false);
          toast.success("Arte do convite gerada!");
          
          // Scroll suave até a imagem
          setTimeout(() => {
            const element = document.getElementById('generated-invite-image');
            element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }}
      />
    </div>
  );
};
