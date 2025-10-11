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
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Capa do Reel
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant={generatedCoverImage ? "outline" : "default"}
              size="sm"
              onClick={handleGenerateCover}
              disabled={isGenerating}
              className="w-full sm:w-auto h-10"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {isGenerating ? "Gerando..." : generatedCoverImage ? "Regerar Capa" : "Gerar Capa do Reel"}
            </Button>
          </div>
        </CardHeader>
        {generatedCoverImage && (
          <CardContent className="p-4 pt-0">
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
      {roteiro?.cenas && roteiro.cenas.length > 0 && (
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Video className="h-4 w-4" />
              Roteiro do Reel - {roteiro.cenas.length} Cenas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            {roteiro.cenas.map((cena) => (
              <Card key={cena.numero} className="border">
                <CardHeader className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm">
                      Cena {cena.numero} ({cena.duracao})
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(
                        `Cena ${cena.numero}\nDuração: ${cena.duracao}\n\nVisual: ${cena.visual}\n\nÁudio: ${cena.audio}`,
                        `Cena ${cena.numero}`
                      )}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm p-3 pt-0">
                  <div>
                    <strong>Visual:</strong>
                    <p className="text-muted-foreground">{cena.visual}</p>
                  </div>
                  <div>
                    <strong>Áudio/Texto:</strong>
                    <p className="text-muted-foreground">{cena.audio}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Legenda */}
      {conteudo?.legenda && (
        <Card>
          <CardHeader className="p-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Legenda para Instagram</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(conteudo.legenda!, "Legenda")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="whitespace-pre-line text-sm">{conteudo.legenda}</p>
          </CardContent>
        </Card>
      )}

      {/* Hashtags */}
      {actualConteudo?.hashtags && actualConteudo.hashtags.length > 0 && (
        <Card>
          <CardHeader className="p-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Hashtags</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(conteudo.hashtags!.join(" "), "Hashtags")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-wrap gap-2">
              {actualConteudo.hashtags.map((tag, i) => (
                <span key={i} className="text-sm text-primary">
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
