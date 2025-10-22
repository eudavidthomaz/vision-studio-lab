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

  // Validação: verificar se há slides disponíveis
  const slides = actualEstrutura?.slides;
  const hasSlides = slides && Array.isArray(slides) && slides.length > 0;

  console.log("StoriesView data:", { estrutura, conteudo, data, hasSlides, slides });

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
      {!hasSlides ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-2">❌ Nenhum conteúdo de Stories encontrado</p>
            <p className="text-sm text-muted-foreground">
              Os dados podem estar vazios ou mal formatados. Tente regenerar o conteúdo.
            </p>
            <pre className="mt-4 text-xs text-left bg-muted p-3 rounded overflow-auto">
              {JSON.stringify({ estrutura, data }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : (
        slides.map((slide) => {
        const slideNum = slide.numero;
        const hasImage = generatedImages[slideNum];
        const isLoadingImage = loadingSlide === slideNum;

        return (
          <Card key={slideNum} data-slide={slideNum}>
            <CardHeader className="p-2">
              <CardTitle className="text-xs font-semibold flex items-center justify-between gap-2">
                <span className="line-clamp-2 leading-tight flex-1 min-w-0">Story {slideNum}: {slide.titulo}</span>
                {slide.timing && <Badge variant="secondary" className="text-xs flex-shrink-0">{slide.timing}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0 space-y-2">
              <p className="text-xs text-muted-foreground break-words whitespace-pre-wrap leading-relaxed">
                {slide.texto}
              </p>

              <div className="space-y-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateImage(slide)}
                  disabled={isLoadingImage}
                  className="w-full h-8 text-xs"
                >
                  {isLoadingImage ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Image className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {isLoadingImage ? "Gerando..." : hasImage ? "Regerar" : "Gerar Imagem"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(slide.texto, `Story ${slideNum}`, slideNum)}
                  className="w-full h-8 text-xs"
                >
                  {copiedSlide === slideNum ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                  {copiedSlide === slideNum ? "Copiado!" : "Copiar"}
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
      })
      )}

      {actualConteudo && (
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-semibold">Call to Action</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
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
