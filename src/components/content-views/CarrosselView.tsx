import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Image as ImageIcon, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ImageGenerationModal from "@/components/ImageGenerationModal";
import { normalizeCarrosselData } from "@/lib/normalizeContentData";

interface CarrosselViewProps {
  estrutura?: any;
  estrutura_visual?: any;
  conteudo?: any;
  dica_producao?: any;
  data?: any;
  contentType?: string;
  onRegenerate?: () => void;
}

export function CarrosselView({ estrutura, estrutura_visual, conteudo, dica_producao, data, contentType, onRegenerate }: CarrosselViewProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<{ numero: number; titulo: string; texto: string } | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [loadingCard, setLoadingCard] = useState<number | null>(null);
  const [copiedCard, setCopiedCard] = useState<number | null>(null);

  // Usar normalizador centralizado - combina todas as fontes de dados
  const rawData = data || { estrutura, estrutura_visual, conteudo, dica_producao };
  const normalized = normalizeCarrosselData(rawData);
  
  const { slides, legenda, dicaProducao } = normalized;
  const hasContent = slides.length > 0 || legenda;
  
  const handleGenerateImage = (cardData: { numero: number; titulo: string; texto: string }) => {
    setLoadingCard(cardData.numero);
    setSelectedCard(cardData);
    setImageModalOpen(true);
  };

  const copyToClipboard = (text: string, label: string, cardNum: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCard(cardNum);
    toast.success(`${label} copiado!`);
    setTimeout(() => setCopiedCard(null), 2000);
  };

  const copyAll = () => {
    let fullText = "";
    
    if (slides.length > 0) {
      fullText += "📱 CARDS DO CARROSSEL:\n\n";
      slides.forEach((slide, index) => {
        fullText += `Card ${index + 1}: ${slide.titulo}\n${slide.conteudo}\n\n`;
      });
    }
    
    if (legenda) {
      fullText += "\n📝 LEGENDA:\n" + legenda + "\n\n";
    }
    
    if (dicaProducao?.hashtags && dicaProducao.hashtags.length > 0) {
      fullText += "\n🏷️ HASHTAGS:\n" + dicaProducao.hashtags.join(" ") + "\n";
    }
    
    navigator.clipboard.writeText(fullText);
    toast.success("Conteúdo completo copiado!");
  };

  if (!hasContent) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Carrossel vazio</p>
          <p className="text-sm text-muted-foreground mb-4">
            Nenhum slide foi gerado. Tente regenerar o conteúdo.
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
    <div className="space-y-6 overflow-x-clip">
      {/* Estrutura Visual - Cards/Slides do Carrossel */}
      {slides.length > 0 && (
        <Card>
          <CardHeader className="p-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              {slides.length} Cards
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex items-center justify-center gap-2 mb-2 text-xs text-muted-foreground">
              <span>← Arraste para ver mais cards →</span>
            </div>
            <Carousel className="w-full max-w-full mx-auto px-8">
              <CarouselContent>
                {slides.map((slide, index) => {
                  return (
                    <CarouselItem key={index}>
                      <Card className="border-2" data-card={index + 1}>
                        <CardHeader className="bg-primary/5 p-2">
                          <CardTitle className="text-xs font-semibold line-clamp-2 leading-tight mb-2">
                            Card {index + 1}: {slide.titulo}
                          </CardTitle>
                          
                          {/* Botões SEMPRE empilhados verticalmente no mobile */}
                          <div className="space-y-1.5">
                            <Button
                              variant={generatedImages[index + 1] ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleGenerateImage({ 
                                numero: index + 1, 
                                titulo: slide.titulo, 
                                texto: slide.conteudo 
                              })}
                              disabled={loadingCard === index + 1}
                              className="w-full h-8 text-xs"
                            >
                              <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                              {loadingCard === index + 1 ? "Gerando..." : generatedImages[index + 1] ? "Regerar" : "Gerar Imagem"}
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(
                                `${slide.titulo}\n\n${slide.conteudo}`,
                                `Card ${index + 1}`,
                                index + 1
                              )}
                              className="w-full h-8 text-xs"
                            >
                              <Copy className="h-3.5 w-3.5 mr-1.5" />
                              {copiedCard === index + 1 ? "Copiado!" : "Copiar"}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 space-y-2">
                          {generatedImages[index + 1] && (
                            <div className="rounded-lg overflow-hidden bg-muted">
                              <img 
                                src={generatedImages[index + 1]} 
                                alt={`Card ${index + 1}`}
                                className="w-full h-auto"
                              />
                            </div>
                          )}
                          {/* Texto + CTA integrados para facilitar geração de imagem */}
                          <div className="text-xs leading-relaxed break-words whitespace-pre-wrap">
                            <p>{slide.conteudo}</p>
                            {slide.chamada_para_acao && (
                              <p className="mt-2 pt-2 border-t border-primary/20 font-medium text-primary">
                                {slide.chamada_para_acao}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
        </Card>
      )}

      {/* Legenda */}
      {legenda && (
        <Card>
          <CardHeader className="p-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Legenda para Instagram</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(legenda, "Legenda", 0)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="whitespace-pre-line text-sm">{legenda}</p>
          </CardContent>
        </Card>
      )}

      {/* Hashtags */}
      {dicaProducao?.hashtags && dicaProducao.hashtags.length > 0 && (
        <Card>
          <CardHeader className="p-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Hashtags Sugeridas</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(dicaProducao.hashtags!.join(" "), "Hashtags", 0)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex flex-wrap gap-2">
              {dicaProducao.hashtags.map((tag, i) => (
                <span key={i} className="text-sm text-primary">
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dicas de Produção */}
      {dicaProducao && (dicaProducao.formato || dicaProducao.estilo || dicaProducao.horario) && (
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-semibold">Dicas de Produção</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            {dicaProducao.formato && (
              <div>
                <strong className="text-sm">Formato:</strong>
                <p className="text-sm text-muted-foreground">{dicaProducao.formato}</p>
              </div>
            )}
            {dicaProducao.estilo && (
              <div>
                <strong className="text-sm">Estilo:</strong>
                <p className="text-sm text-muted-foreground">{dicaProducao.estilo}</p>
              </div>
            )}
            {dicaProducao.horario && (
              <div>
                <strong className="text-sm">Horário de Postagem:</strong>
                <p className="text-sm text-muted-foreground">{dicaProducao.horario}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Botão Copiar Tudo */}
      <div className="flex justify-center">
        <Button onClick={copyAll} variant="outline" size="lg">
          <Copy className="h-4 w-4 mr-2" />
          Copiar Tudo
        </Button>
      </div>

      {selectedCard && (
        <ImageGenerationModal
          open={imageModalOpen}
          onOpenChange={setImageModalOpen}
          copy={`${selectedCard.titulo}\n\n${selectedCard.texto}`}
          pilar={data?.pilar || "Edificar"}
          defaultFormat="feed_square"
          onImageGenerated={(imageUrl) => {
            setGeneratedImages(prev => ({
              ...prev,
              [selectedCard.numero]: imageUrl
            }));
            setLoadingCard(null);
            toast.success(`Imagem do Card ${selectedCard.numero} gerada!`);
            
            // Scroll suave até a imagem
            setTimeout(() => {
              const element = document.querySelector(`[data-card="${selectedCard.numero}"]`);
              element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
          }}
        />
      )}
    </div>
  );
}
