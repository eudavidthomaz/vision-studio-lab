import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Video, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import ImageGenerationModal from "@/components/ImageGenerationModal";

interface ReelViewProps {
  roteiro?: {
    cenas: Array<{
      numero: number;
      duracao: string;
      visual: string;
      audio: string;
    }>;
  };
  conteudo?: {
    legenda?: string;
    hashtags?: string[];
  };
  // Suporte para ContentViewer
  data?: any;
  contentType?: string;
}

export function ReelView({ roteiro, conteudo, data, contentType }: ReelViewProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [generatedCoverImage, setGeneratedCoverImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Extrair valores com fallback para ContentViewer
  const actualRoteiro = roteiro || data?.roteiro || data?.roteiro_video;
  const actualConteudo = conteudo || data?.conteudo;
  
  const handleGenerateCover = () => {
    setIsGenerating(true);
    setImageModalOpen(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success(`${label} copiado!`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="p-2">
          <CardTitle className="text-xs font-semibold flex items-center gap-1.5 mb-2">
            <ImageIcon className="h-3.5 w-3.5" />
            Capa do Reel
          </CardTitle>
          <Button
            variant={generatedCoverImage ? "outline" : "default"}
            size="sm"
            onClick={handleGenerateCover}
            disabled={isGenerating}
            className="w-full h-8 text-xs"
          >
            <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
            {isGenerating ? "Gerando..." : generatedCoverImage ? "Regerar" : "Gerar Capa"}
          </Button>
        </CardHeader>
        {generatedCoverImage && (
          <CardContent className="p-3 pt-0">
            <div id="generated-reel-cover" className="rounded-lg overflow-hidden bg-muted">
              <img 
                src={generatedCoverImage} 
                alt="Capa do reel"
                className="w-full h-auto"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Roteiro de Vídeo */}
      {actualRoteiro?.cenas && actualRoteiro.cenas.length > 0 && (
        <Card>
          <CardHeader className="p-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5" />
              Roteiro - {actualRoteiro.cenas.length} Cenas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-2 pt-0">
            {actualRoteiro.cenas.map((cena) => (
              <Card key={cena.numero} className="border">
                <CardHeader className="p-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-xs font-semibold line-clamp-2 leading-tight flex-1 min-w-0">
                      Cena {cena.numero} ({cena.duracao})
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(
                        `Cena ${cena.numero}\nDuração: ${cena.duracao}\n\nVisual: ${cena.visual}\n\nÁudio: ${cena.audio}`,
                        `Cena ${cena.numero}`
                      )}
                      className="h-7 w-7 p-0 flex-shrink-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs p-2 pt-0">
                  <div>
                    <strong>Visual:</strong>
                    <p className="text-muted-foreground break-words">{cena.visual}</p>
                  </div>
                  <div>
                    <strong>Áudio/Texto:</strong>
                    <p className="text-muted-foreground break-words">{cena.audio}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Legenda */}
      {actualConteudo?.legenda && (
        <Card>
          <CardHeader className="p-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-xs font-semibold flex-1 min-w-0 truncate">Legenda</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(actualConteudo.legenda!, "Legenda")}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{actualConteudo.legenda}</p>
          </CardContent>
        </Card>
      )}

      {/* Hashtags */}
      {actualConteudo?.hashtags && actualConteudo.hashtags.length > 0 && (
        <Card>
          <CardHeader className="p-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-xs font-semibold flex-1 min-w-0 truncate">Hashtags</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(actualConteudo.hashtags!.join(" "), "Hashtags")}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <div className="flex flex-wrap gap-2">
              {actualConteudo.hashtags.map((tag, i) => (
                <span key={i} className="text-xs text-primary break-all">
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ImageGenerationModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        copy={`${data?.titulo || "Reel"}\n\n${actualRoteiro?.cenas?.[0]?.visual || ""}\n\n${actualConteudo?.legenda || ""}`}
        pilar="Alcançar"
        defaultFormat="reel_cover"
        onImageGenerated={(imageUrl) => {
          setGeneratedCoverImage(imageUrl);
          setIsGenerating(false);
          toast.success("Capa do reel gerada!");
          
          // Scroll suave até a imagem
          setTimeout(() => {
            const element = document.getElementById('generated-reel-cover');
            element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }}
      />
    </div>
  );
}
