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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const handleGenerateImage = (slide: typeof actualEstrutura.slides[0]) => {
    setSelectedSlide(slide);
    setImageModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Slides dos Stories */}
      {estrutura?.slides && estrutura.slides.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Sequência de Stories - {estrutura.slides.length} Slides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {estrutura.slides.map((slide) => (
              <Card key={slide.numero} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Slide {slide.numero}: {slide.titulo}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={generatedImages[slide.numero] ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleGenerateImage(slide)}
                        className={generatedImages[slide.numero] ? "" : "bg-gradient-to-r from-primary to-accent"}
                      >
                        <Image className="h-4 w-4 mr-2" />
                        {generatedImages[slide.numero] ? "Regerar" : "Gerar Imagem"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(
                          `${slide.titulo}\n\n${slide.texto}${slide.sugestao_visual ? `\n\nVisual: ${slide.sugestao_visual}` : ''}`,
                          `Slide ${slide.numero}`
                        )}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">{slide.texto}</p>
                  {slide.sugestao_visual && (
                    <div className="mt-3 pt-3 border-t">
                      <strong>Sugestão Visual:</strong>
                      <p className="text-muted-foreground">{slide.sugestao_visual}</p>
                    </div>
                  )}
                  {generatedImages[slide.numero] && (
                    <div className="mt-4 pt-4 border-t">
                      <strong>Imagem Gerada:</strong>
                      <img 
                        src={generatedImages[slide.numero]} 
                        alt={`Slide ${slide.numero}`}
                        className="mt-2 rounded-lg w-full max-w-sm"
                      />
                    </div>
                  )}
                </CardContent>
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
                onClick={() => copyToClipboard(actualConteudo.cta!, "CTA")}
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
          onImageGenerated={(imageUrl) => {
            setGeneratedImages(prev => ({
              ...prev,
              [selectedSlide.numero]: imageUrl
            }));
            toast.success(`Imagem do Slide ${selectedSlide.numero} gerada com sucesso!`);
          }}
        />
      )}
    </div>
  );
}
