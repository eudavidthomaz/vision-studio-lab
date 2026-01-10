import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Image, Check, Loader2, RefreshCw, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ImageGenerationModal from "@/components/ImageGenerationModal";
import { UpgradeModal } from "@/components/UpgradeModal";
import { normalizeStoriesData, NormalizedStory, safeString, safeStringArray } from "@/lib/normalizeContentData";
import { FundamentoBiblicoCard } from "./shared/FundamentoBiblicoCard";
import { StrategicIdeaCard } from "./shared/StrategicIdeaCard";
import { useQuota } from "@/hooks/useQuota";

interface StoriesViewProps {
  estrutura?: any;
  conteudo?: any;
  data?: any;
  contentType?: string;
  onRegenerate?: () => void;
}

export function StoriesView({ estrutura, conteudo, data, contentType, onRegenerate }: StoriesViewProps) {
  // Usar normalizador centralizado - combina todas as fontes de dados
  const rawData = data || { estrutura, conteudo };
  const normalized = normalizeStoriesData(rawData);
  
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<NormalizedStory | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [loadingSlide, setLoadingSlide] = useState<number | null>(null);
  const [copiedSlide, setCopiedSlide] = useState<number | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { isFeatureAvailable } = useQuota();
  const canGenerateImages = isFeatureAvailable('images');

  const { slides, hashtags, fundamento, estrategia } = normalized;
  const hasSlides = slides.length > 0;

  const copyToClipboard = (text: string, label: string, slideNum: number) => {
    navigator.clipboard.writeText(text);
    setCopiedSlide(slideNum);
    toast.success(`${label} copiado!`);
    setTimeout(() => setCopiedSlide(null), 2000);
  };

  const handleGenerateImage = (slide: NormalizedStory) => {
    if (!canGenerateImages) {
      setShowUpgradeModal(true);
      return;
    }
    setLoadingSlide(slide.numero);
    setSelectedSlide(slide);
    setImageModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {!hasSlides ? (
        <Card className="border-yellow-500/50">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-2">⚠️ Nenhum conteúdo de Stories encontrado</p>
            <p className="text-sm text-muted-foreground mb-4">
              Os dados podem estar vazios ou em formato incompatível. Tente regenerar o conteúdo especificando "stories" no pedido.
            </p>
            {onRegenerate && (
              <Button onClick={onRegenerate} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerar
              </Button>
            )}
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
                  <span className="line-clamp-2 leading-tight flex-1 min-w-0">
                    Story {slideNum}: {slide.titulo}
                  </span>
                  {slide.timing && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {slide.timing}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0 space-y-2">
                <p className="text-xs text-muted-foreground break-words whitespace-pre-wrap leading-relaxed">
                  {slide.texto}
                </p>
                
                {slide.versiculo && (
                  <div className="text-xs text-primary font-medium pt-1 border-t border-border">
                    📖 {slide.versiculo}
                  </div>
                )}
                
                {slide.call_to_action && (
                  <div className="text-xs text-muted-foreground italic pt-1">
                    💬 {slide.call_to_action}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateImage(slide)}
                    disabled={isLoadingImage}
                    className={`w-full h-8 text-xs ${!canGenerateImages ? 'opacity-70' : ''}`}
                  >
                    {!canGenerateImages && (
                      <Badge variant="secondary" className="mr-1.5 bg-amber-500 text-white text-[10px] px-1 py-0">
                        <Crown className="h-2.5 w-2.5 mr-0.5" />
                        PRO
                      </Badge>
                    )}
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
                    {copiedSlide === slideNum ? (
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    {copiedSlide === slideNum ? "Copiado!" : "Copiar"}
                  </Button>
                </div>

                {hasImage && (
                  <div className="mt-4">
                    <img
                      src={generatedImages[slideNum]}
                      alt={`Story ${slideNum}`}
                      className="w-full rounded-lg shadow-md"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}

      {hashtags && hashtags.length > 0 && (
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-semibold">Hashtags</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex flex-wrap gap-2">
              {safeStringArray(hashtags).map((tag, i) => (
                <span key={i} className="text-xs text-primary">
                  {safeString(tag)}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {estrategia && <StrategicIdeaCard ideia={estrategia} />}

      {fundamento && <FundamentoBiblicoCard fundamento={fundamento} />}

      <ImageGenerationModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        copy={selectedSlide ? `${selectedSlide.titulo}\n\n${selectedSlide.texto}` : ""}
        pilar="Alcançar"
        isStoryMode={true}
        onImageGenerated={(imageUrl) => {
          if (selectedSlide) {
            setGeneratedImages((prev) => ({ ...prev, [selectedSlide.numero]: imageUrl }));
            setLoadingSlide(null);
            toast.success("Imagem gerada!");
            setTimeout(() => {
              const element = document.querySelector(`[data-slide="${selectedSlide.numero}"]`);
              element?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }, 100);
          }
        }}
      />

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        feature="images"
        reason="feature_locked"
      />
    </div>
  );
}