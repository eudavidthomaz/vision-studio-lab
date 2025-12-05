import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Video, Image as ImageIcon, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import ImageGenerationModal from "@/components/ImageGenerationModal";
import { normalizeReelData } from "@/lib/normalizeContentData";

interface ReelViewProps {
  roteiro?: any;
  conteudo?: any;
  data?: any;
  contentType?: string;
  onRegenerate?: () => void;
}

export function ReelView({ roteiro, conteudo, data, contentType, onRegenerate }: ReelViewProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [generatedCoverImage, setGeneratedCoverImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Usar normalizador centralizado - combina todas as fontes de dados
  const rawData = data || { roteiro, conteudo };
  const normalized = normalizeReelData(rawData);
  
  const { cenas, legenda, hashtags, hook, duracao } = normalized;
  
  const handleGenerateCover = () => {
    setIsGenerating(true);
    setImageModalOpen(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  // Se não tem cenas estruturadas mas tem legenda, mostrar como roteiro simples
  const hasStructuredContent = cenas.length > 0;
  const hasSimpleContent = !hasStructuredContent && (legenda || hook);
  const hasAnyContent = hasStructuredContent || hasSimpleContent;

  if (!hasAnyContent) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Reel incompleto</p>
          <p className="text-sm text-muted-foreground mb-4">
            Nenhum conteúdo foi gerado. Tente regenerar.
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

      {/* Hook (se disponível) */}
      {hook && (
        <Card>
          <CardHeader className="p-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-xs font-semibold flex-1 min-w-0 truncate">🎯 Hook</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(hook, "Hook")}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <p className="text-xs leading-relaxed whitespace-pre-wrap break-words font-medium">{hook}</p>
          </CardContent>
        </Card>
      )}

      {/* Roteiro de Vídeo - Cenas Estruturadas */}
      {hasStructuredContent && (
        <Card>
          <CardHeader className="p-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5" />
              Roteiro - {cenas.length} Cenas {duracao && `(${duracao})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-2 pt-0">
            {cenas.map((cena) => (
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
                  {cena.texto_overlay && (
                    <div>
                      <strong>Texto na Tela:</strong>
                      <p className="text-muted-foreground break-words">{cena.texto_overlay}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Conteúdo Simples (quando não tem cenas estruturadas) */}
      {hasSimpleContent && !hasStructuredContent && (
        <Card>
          <CardHeader className="p-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5" />
              Roteiro
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{legenda}</p>
          </CardContent>
        </Card>
      )}

      {/* Legenda (separada se tem cenas) */}
      {hasStructuredContent && legenda && (
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
              {hashtags.map((tag, i) => (
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
        copy={`${data?.titulo || "Reel"}\n\n${hook || ""}\n\n${cenas[0]?.visual || ""}\n\n${legenda || ""}`}
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
