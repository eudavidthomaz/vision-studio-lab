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
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Texto do Post
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(conteudo.texto!, "Texto")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="whitespace-pre-line text-sm">{conteudo.texto}</p>
          </CardContent>
        </Card>
      )}

      {/* Legenda */}
      {actualConteudo?.legenda && (
        <Card>
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Legenda</CardTitle>
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
          <CardContent className="p-4">
            <p className="whitespace-pre-line text-sm">{conteudo.legenda}</p>
          </CardContent>
        </Card>
      )}

      {/* Sugestão de Imagem */}
      {actualImagem?.descricao && (
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-base">Sugestão de Imagem</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground">{imagem.descricao}</p>
            {imagem.elementos && imagem.elementos.length > 0 && (
              <div>
                <strong className="text-sm">Elementos visuais:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {imagem.elementos.map((elemento, i) => (
                    <li key={i} className="text-sm text-muted-foreground">{elemento}</li>
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
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
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
          <CardContent className="p-4">
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

      {/* Geração de Imagem Opcional */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base">Imagem (Opcional)</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant={generatedImage ? "outline" : "default"}
              size="sm"
              onClick={handleGenerateImage}
              disabled={isGenerating}
              className="w-full sm:w-auto h-10"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {isGenerating ? "Gerando..." : generatedImage ? "Regerar Imagem" : "Gerar Imagem"}
            </Button>
          </div>
        </CardHeader>
        {generatedImage && (
          <CardContent className="p-4">
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
