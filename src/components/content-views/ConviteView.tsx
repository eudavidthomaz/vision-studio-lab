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
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="text-center p-3 sm:p-4 md:p-6">
          <CardTitle className="text-lg sm:text-xl md:text-2xl leading-tight">{convite.titulo_evento}</CardTitle>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4">
            <Badge variant="outline" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              {convite.data}
            </Badge>
            <Badge variant="outline" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              {convite.horario}
            </Badge>
            <Badge variant="outline" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
              {convite.local}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5 md:space-y-6 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant={generatedImage ? "outline" : "default"}
              onClick={handleGenerateImage}
              disabled={isGenerating}
              className="w-full sm:w-auto h-10 sm:h-11 text-xs sm:text-sm"
            >
              <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              {isGenerating ? "Gerando..." : generatedImage ? "Regerar Arte" : "Gerar Arte do Convite"}
            </Button>
          </div>

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
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">{convite.descricao}</p>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Para quem é?</p>
                  <p className="text-sm text-muted-foreground mt-1">{convite.publico_alvo}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Como participar:</h4>
            <p className="text-sm text-muted-foreground">{convite.como_participar}</p>
          </div>

          {convite.contato && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="font-medium">Contato:</span>
                  <span className="text-muted-foreground">{convite.contato}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center p-4 bg-primary text-primary-foreground rounded-lg">
            <p className="text-sm sm:text-base font-semibold">{convite.chamado_acao}</p>
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
