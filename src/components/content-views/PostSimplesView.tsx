import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import ImageGenerationModal from "@/components/ImageGenerationModal";

interface PostSimplesViewProps {
  conteudo?: {
    texto?: string;
    legenda?: string;
    hashtags?: string[];
  };
  imagem?: {
    descricao?: string;
    elementos?: string[];
  };
  // Suporte para ContentViewer
  data?: any;
  contentType?: string;
}

export function PostSimplesView({ conteudo, imagem, data, contentType }: PostSimplesViewProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Extrair valores com fallback para ContentViewer
  const actualConteudo = conteudo || data?.conteudo;
  const actualImagem = imagem || data?.imagem;
  
  const handleGenerateImage = () => {
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
      {/* Texto do Post */}
      {actualConteudo?.texto && (
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
                onClick={() => copyToClipboard(actualConteudo.texto!, "Texto")}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{actualConteudo.texto}</p>
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
                  {actualImagem.elementos.map((elemento, i) => (
                    <li key={i} className="text-xs text-muted-foreground break-words">{elemento}</li>
                  ))}
                </ul>
              </div>
            )}
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

      {/* Geração de Imagem Opcional */}
      <Card>
        <CardHeader className="p-2">
          <CardTitle className="text-xs font-semibold mb-2">Imagem (Opcional)</CardTitle>
          <Button
            variant={generatedImage ? "outline" : "default"}
            size="sm"
            onClick={handleGenerateImage}
            disabled={isGenerating}
            className="w-full h-8 text-xs"
          >
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
        copy={`${actualConteudo?.texto || ""}\n\n${actualConteudo?.legenda || ""}`}
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
    </div>
  );
}
