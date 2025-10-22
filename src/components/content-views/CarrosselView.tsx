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
    <div className="space-y-6 overflow-x-clip">
      {/* Estrutura Visual - Cards/Slides do Carrossel */}
      {items.length > 0 && (
        <Card>
          <CardHeader className="p-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              {items.length} Cards
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex items-center justify-center gap-2 mb-2 text-xs text-muted-foreground">
              <span>← Arraste para ver mais cards →</span>
            </div>
            <Carousel className="w-full max-w-full mx-auto px-8">
              <CarouselContent>
                {items.map((item: any, index) => {
                  const titulo = item.titulo_slide || item.titulo;
                  const texto = item.conteudo || item.texto;
                  const imagemSugerida = item.imagem_sugerida;
                  const cta = item.chamada_para_acao;
                  
                  return (
                    <CarouselItem key={index}>
                      <Card className="border-2" data-card={index + 1}>
                        <CardHeader className="bg-primary/5 p-2">
                          <CardTitle className="text-xs font-semibold line-clamp-2 leading-tight mb-2">
                            Card {index + 1}: {titulo}
                          </CardTitle>
                          
                          {/* Botões SEMPRE empilhados verticalmente no mobile */}
                          <div className="space-y-1.5">
                            <Button
                              variant={generatedImages[index + 1] ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleGenerateImage({ 
                                numero: index + 1, 
                                titulo, 
                                texto 
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
                                `${titulo}\n\n${texto}`,
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
                            <p>{texto}</p>
                            {cta && (
                              <p className="mt-2 pt-2 border-t border-primary/20 font-medium text-primary">
                                {cta}
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
      {actualConteudo?.legenda && (
        <Card>
          <CardHeader className="p-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Legenda para Instagram</CardTitle>
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
          <CardContent className="p-3 pt-0">
            <p className="whitespace-pre-line text-sm">{actualConteudo.legenda}</p>
          </CardContent>
        </Card>
      )}

      {/* Hashtags */}
      {actualDicaProducao?.hashtags && actualDicaProducao.hashtags.length > 0 && (
        <Card>
          <CardHeader className="p-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Hashtags Sugeridas</CardTitle>
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
          <CardContent className="p-3 pt-0">
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
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-semibold">Dicas de Produção</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
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
