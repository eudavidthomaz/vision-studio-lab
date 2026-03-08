import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Image as ImageIcon, RefreshCw, Crown, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import ImageGenerationModal from "@/components/ImageGenerationModal";
import { UpgradeModal } from "@/components/UpgradeModal";
import { normalizeCarrosselData, safeString, safeStringArray } from "@/lib/normalizeContentData";
import { FundamentoBiblicoCard } from "./shared/FundamentoBiblicoCard";
import { StrategicIdeaCard } from "./shared/StrategicIdeaCard";
import { useQuota } from "@/hooks/useQuota";
import { CircularCarousel3D, type CarouselSlideItem } from "@/components/ui/circular-carousel";

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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [expandedSlide, setExpandedSlide] = useState<CarouselSlideItem | null>(null);

  const { isFeatureAvailable } = useQuota();
  const canGenerateImages = isFeatureAvailable('images');

  const rawData = data || { estrutura, estrutura_visual, conteudo, dica_producao };
  const normalized = normalizeCarrosselData(rawData);
  const { slides, legenda, dicaProducao, fundamento, estrategia } = normalized;
  const hasContent = slides.length > 0 || legenda;

  // Map normalized slides to CircularCarousel3D items
  const carouselItems: CarouselSlideItem[] = slides.map((slide, index) => ({
    id: index + 1,
    titulo: slide.titulo,
    conteudo: safeString(slide.conteudo),
    chamada_para_acao: slide.chamada_para_acao ? safeString(slide.chamada_para_acao) : undefined,
  }));

  const handleGenerateImage = (cardData: { numero: number; titulo: string; texto: string }) => {
    if (!canGenerateImages) {
      setShowUpgradeModal(true);
      return;
    }
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

  const handleItemClick = (item: CarouselSlideItem) => {
    setExpandedSlide(item);
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
      {/* 3D Circular Carousel */}
      {carouselItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <ImageIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{carouselItems.length} Cards</span>
          </div>
          <CircularCarousel3D
            items={carouselItems}
            onItemClick={handleItemClick}
          />
        </div>
      )}

      {/* Expanded Card Overlay */}
      <AnimatePresence>
        {expandedSlide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setExpandedSlide(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl border border-primary/30 shadow-[0_0_40px_hsl(var(--primary)/0.15)]"
              style={{
                background: "linear-gradient(180deg, hsl(var(--card)) 0%, hsl(230 25% 8%) 100%)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Noise overlay */}
              <div className="card-noise-layer absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none z-[1] rounded-2xl" />

              {/* Bottom glow */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/3 rounded-full blur-3xl pointer-events-none z-0 carousel-glow-pulse"
                style={{
                  background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.2) 0%, transparent 70%)",
                }}
              />

              {/* Close button */}
              <button
                onClick={() => setExpandedSlide(null)}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>

              <div className="relative z-[3] p-6">
                {/* Card number */}
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-primary-foreground"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))",
                    }}
                  >
                    {expandedSlide.id}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                    Card {expandedSlide.id} de {carouselItems.length}
                  </span>
                </div>

                {/* Generated image */}
                {generatedImages[expandedSlide.id] && (
                  <div className="rounded-xl overflow-hidden mb-4 bg-muted">
                    <img
                      src={generatedImages[expandedSlide.id]}
                      alt={`Card ${expandedSlide.id}`}
                      className="w-full h-auto"
                    />
                  </div>
                )}

                {/* Title */}
                <h3 className="text-lg font-bold text-foreground mb-3 leading-snug">
                  {expandedSlide.titulo}
                </h3>

                {/* Full content */}
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap mb-4">
                  {expandedSlide.conteudo}
                </p>

                {/* CTA */}
                {expandedSlide.chamada_para_acao && (
                  <p className="text-sm font-medium text-primary mb-4 pt-3 border-t border-primary/20">
                    {expandedSlide.chamada_para_acao}
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant={generatedImages[expandedSlide.id] ? "outline" : "default"}
                    size="sm"
                    onClick={() =>
                      handleGenerateImage({
                        numero: expandedSlide.id,
                        titulo: expandedSlide.titulo,
                        texto: expandedSlide.chamada_para_acao
                          ? `${expandedSlide.conteudo}\n\n${expandedSlide.chamada_para_acao}`
                          : expandedSlide.conteudo,
                      })
                    }
                    disabled={loadingCard === expandedSlide.id}
                    className={`flex-1 ${!canGenerateImages ? "border-amber-500/50" : ""}`}
                  >
                    {!canGenerateImages && <Crown className="h-3.5 w-3.5 mr-1.5 text-amber-500" />}
                    <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                    {loadingCard === expandedSlide.id
                      ? "Gerando..."
                      : generatedImages[expandedSlide.id]
                      ? "Regerar"
                      : "Gerar Imagem"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `${expandedSlide.titulo}\n\n${expandedSlide.conteudo}${
                          expandedSlide.chamada_para_acao ? `\n\n${expandedSlide.chamada_para_acao}` : ""
                        }`,
                        `Card ${expandedSlide.id}`,
                        expandedSlide.id
                      )
                    }
                    className="flex-1"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    {copiedCard === expandedSlide.id ? "Copiado!" : "Copiar"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legenda */}
      {legenda && (
        <Card>
          <CardHeader className="p-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Legenda para Instagram</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(legenda, "Legenda", 0)}>
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

      {estrategia && <StrategicIdeaCard ideia={estrategia} />}
      {fundamento && <FundamentoBiblicoCard fundamento={fundamento} />}

      {/* Hashtags */}
      {dicaProducao?.hashtags && dicaProducao.hashtags.length > 0 && (
        <Card>
          <CardHeader className="p-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Hashtags Sugeridas</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(dicaProducao.hashtags!.join(" "), "Hashtags", 0)}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex flex-wrap gap-2">
              {safeStringArray(dicaProducao.hashtags).map((tag, i) => (
                <span key={i} className="text-sm text-primary">
                  {safeString(tag)}
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
          context="slide"
          pilar={data?.pilar || "Edificar"}
          defaultFormat="feed_square"
          onImageGenerated={(imageUrl) => {
            setGeneratedImages((prev) => ({
              ...prev,
              [selectedCard.numero]: imageUrl,
            }));
            setLoadingCard(null);
            toast.success(`Imagem do Card ${selectedCard.numero} gerada!`);
          }}
        />
      )}

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} feature="images" reason="feature_locked" />
    </div>
  );
}
