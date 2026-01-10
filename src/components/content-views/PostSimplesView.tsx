import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, FileText, Image as ImageIcon, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ImageGenerationModal from "@/components/ImageGenerationModal";
import { UpgradeModal } from "@/components/UpgradeModal";
import { normalizePostData, safeString, safeStringArray } from "@/lib/normalizeContentData";
import { FundamentoBiblicoCard } from "./shared/FundamentoBiblicoCard";
import { StrategicIdeaCard } from "./shared/StrategicIdeaCard";
import { useQuota } from "@/hooks/useQuota";

interface PostSimplesViewProps {
  conteudo?: any;
  imagem?: any;
  data?: any;
  contentType?: string;
}

export function PostSimplesView({ conteudo, imagem, data, contentType }: PostSimplesViewProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { isFeatureAvailable } = useQuota();
  const canGenerateImages = isFeatureAvailable('images');

  // Usar normalizador centralizado
  const rawData = data || { conteudo };
  const normalized = normalizePostData(rawData);
  const { texto, legenda, hashtags, fundamento, estrategia } = normalized;
  
  // Dados de imagem
  const actualImagem = imagem || data?.imagem;
  
  const handleGenerateImage = () => {
    if (!canGenerateImages) {
      setShowUpgradeModal(true);
      return;
    }
    setIsGenerating(true);
    setImageModalOpen(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  return (
    <div className="space-y-4">
      {/* Texto do Post */}
      {texto && (
        <Card>
          <CardHeader className="p-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5 flex-1 min-w-0">
                <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">Texto do Post</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(texto, "Texto")}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{texto}</p>
          </CardContent>
        </Card>
      )}

      {/* Legenda (se diferente do texto) */}
      {legenda && legenda !== texto && (
        <Card>
          <CardHeader className="p-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-xs font-semibold flex-1 min-w-0 truncate">Legenda</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(legenda, "Legenda")}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{legenda}</p>
          </CardContent>
        </Card>
      )}

      {/* Sugestão de Imagem */}
      {actualImagem?.descricao && (
        <Card>
          <CardHeader className="p-2">
            <CardTitle className="text-xs font-semibold">Sugestão de Imagem</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 space-y-2">
            <p className="text-xs text-muted-foreground break-words">{actualImagem.descricao}</p>
            {actualImagem.elementos && actualImagem.elementos.length > 0 && (
              <div>
                <strong className="text-xs">Elementos visuais:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {actualImagem.elementos.map((elemento: string, i: number) => (
                    <li key={i} className="text-xs text-muted-foreground break-words">{elemento}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hashtags */}
      {hashtags && hashtags.length > 0 && (
        <Card>
          <CardHeader className="p-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-xs font-semibold flex-1 min-w-0 truncate">Hashtags</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(hashtags.join(" "), "Hashtags")}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <div className="flex flex-wrap gap-2">
              {safeStringArray(hashtags).map((tag, i) => (
                <span key={i} className="text-xs text-primary break-all">
                  {safeString(tag)}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {estrategia && <StrategicIdeaCard ideia={estrategia} />}

      {fundamento && <FundamentoBiblicoCard fundamento={fundamento} />}

      {/* Geração de Imagem Opcional */}
      <Card>
        <CardHeader className="p-2">
          <CardTitle className="text-xs font-semibold mb-2">Imagem (Opcional)</CardTitle>
          <Button
            variant={generatedImage ? "outline" : "default"}
            size="sm"
            onClick={handleGenerateImage}
            disabled={isGenerating}
            className={`w-full h-8 text-xs ${!canGenerateImages ? 'opacity-80' : ''}`}
          >
            {!canGenerateImages && (
              <Badge variant="secondary" className="mr-1.5 bg-amber-500 text-white text-[10px] px-1 py-0">
                <Crown className="h-2.5 w-2.5 mr-0.5" />
                PRO
              </Badge>
            )}
            <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
            {isGenerating ? "Gerando..." : generatedImage ? "Regerar" : "Gerar Imagem"}
          </Button>
        </CardHeader>
        {generatedImage && (
          <CardContent className="p-3 pt-0">
            <div id="generated-post-image" className="rounded-lg overflow-hidden bg-muted">
              <img 
                src={generatedImage} 
                alt="Imagem do post"
                className="w-full h-auto"
              />
            </div>
          </CardContent>
        )}
      </Card>

      <ImageGenerationModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        copy={`${texto || ""}\n\n${legenda || ""}`}
        pilar="Edificar"
        defaultFormat="feed_square"
        onImageGenerated={(imageUrl) => {
          setGeneratedImage(imageUrl);
          setIsGenerating(false);
          toast.success("Imagem do post gerada!");
          
          // Scroll suave até a imagem
          setTimeout(() => {
            const element = document.getElementById('generated-post-image');
            element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
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