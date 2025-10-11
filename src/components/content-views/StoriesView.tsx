import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Layers, Image, Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ImageGenerationModal from "@/components/ImageGenerationModal";

interface StoriesViewProps {
  estrutura?: {
    slides: Array<{
      numero: number;
      titulo: string;
      texto: string;
      timing?: string;
      sugestao_visual?: string;
    }>;
  };
  conteudo?: {
    legenda?: string;
    hashtags?: string[];
  };
  data?: any;
  contentType?: string;
}

export function StoriesView({ estrutura, conteudo, data, contentType }: StoriesViewProps) {
  const actualEstrutura = estrutura || data?.estrutura;
  const actualConteudo = conteudo || data?.conteudo;
  
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<any>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [loadingSlide, setLoadingSlide] = useState<number | null>(null);
  const [copiedSlide, setCopiedSlide] = useState<number | null>(null);

  const copyToClipboard = (text: string, label: string, slideNum: number) => {
    navigator.clipboard.writeText(text);
    setCopiedSlide(slideNum);
    toast.success(`${label} copiado!`);
    setTimeout(() => setCopiedSlide(null), 2000);
  };

  const handleGenerateImage = (slide: typeof actualEstrutura.slides[0]) => {
    setLoadingSlide(slide.numero);
    setSelectedSlide(slide);
    setImageModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {actualEstrutura?.slides && actualEstrutura.slides.map((slide) => {
        const slideNum = slide.numero;
        const hasImage = generatedImages[slideNum];
        const isLoadingImage = loadingSlide === slideNum;

        return (
          <Card key={slideNum} data-slide={slideNum}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base flex items-center justify-between gap-2">
                <span>Story {slideNum}: {slide.titulo}</span>
                {slide.timing && <Badge variant="secondary" className="text-xs">{slide.timing}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line">
                {slide.texto}
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateImage(slide)}
                  disabled={isLoadingImage}
                  className="flex items-center gap-2"
                >
                  {isLoadingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Image className="h-4 w-4" />
                  )}
                  {isLoadingImage ? "Gerando..." : hasImage ? "Regerar Imagem" : "Gerar Imagem"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(slide.texto, `Story ${slideNum}`, slideNum)}
                  className="flex items-center gap-2"
                >
                  {copiedSlide === slideNum ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copiar
                </Button>
              </div>

              {hasImage && (
                <div className="mt-4">
                  <img src={generatedImages[slideNum]} alt={`Story ${slideNum}`} className="w-full rounded-lg shadow-md" />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {actualConteudo && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Call to Action</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
            {actualConteudo.legenda && (
              <div>
                <h3 className="font-semibold text-sm mb-2">Legenda</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{actualConteudo.legenda}</p>
              </div>
            )}
            {actualConteudo.hashtags && (
              <div>
                <h3 className="font-semibold text-sm mb-2">Hashtags</h3>
                <p className="text-sm text-muted-foreground">{actualConteudo.hashtags}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ImageGenerationModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        copy={selectedSlide ? `${selectedSlide.titulo}\n\n${selectedSlide.texto}` : ""}
        pilar="Alcançar"
        isStoryMode={true}
        onImageGenerated={(imageUrl) => {
          if (selectedSlide) {
            setGeneratedImages(prev => ({ ...prev, [selectedSlide.numero]: imageUrl }));
            setLoadingSlide(null);
            toast.success("Imagem gerada!");
            setTimeout(() => {
              const element = document.querySelector(`[data-slide="${selectedSlide.numero}"]`);
              element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
          }
        }}
      />
    </div>
  );
}
