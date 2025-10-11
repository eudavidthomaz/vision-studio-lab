import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ImageGenerationModal from "@/components/ImageGenerationModal";

interface CarrosselViewProps {
  estrutura?: {
    cards: Array<{
      numero: number;
      titulo: string;
      conteudo: string;
      emoji?: string;
    }>;
  };
  estrutura_visual?: {
    slides?: Array<{
      numero: number;
      titulo: string;
      conteudo: string;
    }>;
    cards?: Array<{
      numero: number;
      titulo: string;
      conteudo: string;
    }>;
  };
  conteudo?: {
    legenda?: string;
    hashtags_sugeridas?: string[];
  };
  dica_producao?: {
    dicas?: string[];
    hashtags?: string[];
    formato?: string;
    estilo?: string;
    horario?: string;
  };
  // Suporte para ContentViewer
  data?: any;
  contentType?: string;
}

export function CarrosselView({ estrutura, estrutura_visual, conteudo, dica_producao, data, contentType }: CarrosselViewProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<{ numero: number; titulo: string; texto: string } | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [loadingCard, setLoadingCard] = useState<number | null>(null);
  const [copiedCard, setCopiedCard] = useState<number | null>(null);

  // Extrair valores com fallback para ContentViewer
  const actualEstrutura = estrutura || data?.estrutura || data?.estrutura_visual;
  const actualEstruturaVisual = estrutura_visual || data?.estrutura_visual;
  const actualConteudo = conteudo || data?.conteudo;
  const actualDicaProducao = dica_producao || data?.dica_producao;
  
  // Unificar slides/cards - priorizar estrutura_visual.slides, depois cards
  const items = actualEstruturaVisual?.slides || actualEstruturaVisual?.cards || actualEstrutura?.cards || [];
  
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
    
    if (items.length > 0) {
      fullText += "📱 CARDS DO CARROSSEL:\n\n";
      items.forEach((item: any, index) => {
        const titulo = item.titulo_slide || item.titulo;
        const texto = item.conteudo || item.texto;
        fullText += `Card ${index + 1}: ${titulo}\n${texto}\n\n`;
      });
    }
    
    if (actualConteudo?.legenda) {
      fullText += "\n📝 LEGENDA:\n" + actualConteudo.legenda + "\n\n";
    }
    
    if (actualDicaProducao?.hashtags && actualDicaProducao.hashtags.length > 0) {
      fullText += "\n🏷️ HASHTAGS:\n" + actualDicaProducao.hashtags.join(" ") + "\n";
    }
    
    navigator.clipboard.writeText(fullText);
    toast.success("Conteúdo completo copiado!");
  };

  return (
    <div className="space-y-6">
      {/* Estrutura Visual - Cards/Slides do Carrossel */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Estrutura Visual - {items.length} Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Carousel className="w-full max-w-3xl mx-auto">
              <CarouselContent>
                {items.map((item: any, index) => {
                  const titulo = item.titulo_slide || item.titulo;
                  const texto = item.conteudo || item.texto;
                  const imagemSugerida = item.imagem_sugerida;
                  const cta = item.chamada_para_acao;
                  
                  return (
                    <CarouselItem key={index}>
                      <Card className="border-2" data-card={index + 1}>
                        <CardHeader className="bg-primary/5 p-3 sm:p-4 md:p-6">
                          <CardTitle className="text-xs sm:text-sm md:text-base leading-tight">
                            Card {index + 1}: {titulo}
                          </CardTitle>
                          <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <Button
                              variant={generatedImages[index + 1] ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleGenerateImage({ 
                                numero: index + 1, 
                                titulo, 
                                texto 
                              })}
                              disabled={loadingCard === index + 1}
                              className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
                            >
                              <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                              {loadingCard === index + 1 ? "Gerando..." : generatedImages[index + 1] ? "Regerar" : "Gerar Imagem"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(
                                `${titulo}\n\n${texto}`,
                                `Card ${index + 1}`,
                                index + 1
                              )}
                              className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
                            >
                              <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                              Copiar
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-3 sm:pt-4 md:pt-6 space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
                          {generatedImages[index + 1] && (
                            <div className="rounded-lg overflow-hidden bg-muted">
                              <img 
                                src={generatedImages[index + 1]} 
                                alt={`Card ${index + 1}`}
                                className="w-full h-auto"
                              />
                            </div>
                          )}
                          <p className="text-xs sm:text-sm whitespace-pre-line leading-relaxed">{texto}</p>
                          {imagemSugerida && (
                            <div className="p-2 sm:p-3 bg-muted rounded-md">
                              <strong className="text-xs sm:text-sm">Sugestão de Imagem:</strong>
                              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{imagemSugerida}</p>
                            </div>
                          )}
                          {cta && (
                            <div className="p-2 sm:p-3 bg-primary/5 rounded-md border-l-4 border-primary">
                              <strong className="text-xs sm:text-sm">CTA:</strong>
                              <p className="text-xs sm:text-sm mt-1">{cta}</p>
                            </div>
                          )}
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
      {actualConteudo?.legenda && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Legenda para Instagram</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(actualConteudo.legenda!, "Legenda", 0)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm">{actualConteudo.legenda}</p>
          </CardContent>
        </Card>
      )}

      {/* Hashtags */}
      {actualDicaProducao?.hashtags && actualDicaProducao.hashtags.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Hashtags Sugeridas</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(actualDicaProducao.hashtags!.join(" "), "Hashtags", 0)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {actualDicaProducao.hashtags.map((tag, i) => (
                <span key={i} className="text-sm text-primary">
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dicas de Produção */}
      {actualDicaProducao && (
        <Card>
          <CardHeader>
            <CardTitle>Dicas de Produção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {actualDicaProducao.formato && (
              <div>
                <strong className="text-sm">Formato:</strong>
                <p className="text-sm text-muted-foreground">{actualDicaProducao.formato}</p>
              </div>
            )}
            {actualDicaProducao.estilo && (
              <div>
                <strong className="text-sm">Estilo:</strong>
                <p className="text-sm text-muted-foreground">{actualDicaProducao.estilo}</p>
              </div>
            )}
            {actualDicaProducao.horario && (
              <div>
                <strong className="text-sm">Horário de Postagem:</strong>
                <p className="text-sm text-muted-foreground">{actualDicaProducao.horario}</p>
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
