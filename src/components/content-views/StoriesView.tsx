import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Layers, Image } from "lucide-react";
import { toast } from "sonner";
import ImageGenerationModal from "@/components/ImageGenerationModal";

interface StoriesViewProps {
  estrutura?: {
    slides: Array<{
      numero: number;
      titulo: string;
      texto: string;
      sugestao_visual?: string;
    }>;
  };
  conteudo?: {
    cta?: string;
  };
  // Suporte para ContentViewer
  data?: any;
  contentType?: string;
}

export function StoriesView({ estrutura, conteudo, data, contentType }: StoriesViewProps) {
  // Extrair valores com fallback para ContentViewer
  const actualEstrutura = estrutura || data?.estrutura;
  const actualConteudo = conteudo || data?.conteudo;
  
  // Estado para controlar modal e imagens geradas
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<{
    numero: number;
    titulo: string;
    texto: string;
  } | null>(null);
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
    <div className="space-y-6">
      {/* Slides dos Stories */}
      {actualEstrutura?.slides && actualEstrutura.slides.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
              Sequência de Stories - {actualEstrutura.slides.length} Slides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {actualEstrutura.slides.map((slide) => (
              <Card key={slide.numero} className="border" data-slide={slide.numero}>
                <CardHeader className="pb-3 space-y-3">
                  <CardTitle className="text-sm sm:text-base">
                    Slide {slide.numero}: {slide.titulo}
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {slide.texto}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      variant={generatedImages[slide.numero] ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleGenerateImage(slide)}
                      disabled={loadingSlide === slide.numero}
                      className="w-full sm:w-auto"
                    >
                      <Image className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      {loadingSlide === slide.numero ? "Gerando..." : generatedImages[slide.numero] ? "Regerar" : "Gerar Imagem"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(
                        `${slide.titulo}\n\n${slide.texto}`,
                        `Slide ${slide.numero}`,
                        slide.numero
                      )}
                      className="w-full sm:w-auto"
                    >
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                </CardHeader>
                {generatedImages[slide.numero] && (
                  <CardContent className="pt-0">
                    <div className="rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={generatedImages[slide.numero]} 
                        alt={`Slide ${slide.numero}`}
                        className="w-full h-auto"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      {actualConteudo?.cta && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Call to Action</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(actualConteudo.cta!, "CTA", 0)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{actualConteudo.cta}</p>
          </CardContent>
        </Card>
      )}

      {/* Modal de Geração de Imagem */}
      {selectedSlide && (
        <ImageGenerationModal
          open={imageModalOpen}
          onOpenChange={setImageModalOpen}
        copy={`${selectedSlide.titulo}\n\n${selectedSlide.texto}`}
        pilar={data?.pilar || "Edificar"}
        isStoryMode={true}
        onImageGenerated={(imageUrl) => {
            setGeneratedImages(prev => ({
              ...prev,
              [selectedSlide.numero]: imageUrl
            }));
            setLoadingSlide(null);
            toast.success(`Imagem do Slide ${selectedSlide.numero} gerada com sucesso!`);
            
            // Scroll suave até a imagem
            setTimeout(() => {
              const element = document.querySelector(`[data-slide="${selectedSlide.numero}"]`);
              element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
          }}
        />
      )}
    </div>
  );
}
