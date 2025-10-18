import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Palette, Hash, Type, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ImageGenerationModal from "@/components/ImageGenerationModal";

interface FotoPostViewProps {
  conteudo_criativo: {
    descricao_visual: string;
    sugestoes_composicao: string[];
    legenda_sugerida: string;
  };
  dica_producao: {
    ferramentas?: string[];
    cores?: string[];
    hashtags: string[];
  };
}

export const FotoPostView = ({ conteudo_criativo, dica_producao }: FotoPostViewProps) => {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerateImage = () => {
    setIsGenerating(true);
    setImageModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Descrição Visual
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant={generatedImage ? "outline" : "default"}
              size="sm"
              onClick={handleGenerateImage}
              disabled={isGenerating}
              className="w-full sm:w-auto h-9"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {isGenerating ? "Gerando..." : generatedImage ? "Regerar Imagem" : "Gerar Imagem"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          {generatedImage && (
            <div id="generated-photo-image" className="rounded-lg overflow-hidden bg-muted">
              <img 
                src={generatedImage} 
                alt="Imagem gerada"
                className="w-full h-auto"
              />
            </div>
          )}
          <p className="text-sm whitespace-pre-line text-muted-foreground">{conteudo_criativo.descricao_visual}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Sugestões de Composição
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <ul className="space-y-1.5 list-disc list-inside text-sm text-muted-foreground">
            {conteudo_criativo.sugestoes_composicao.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Type className="h-4 w-4" />
            Legenda Sugerida
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-sm whitespace-pre-line text-muted-foreground">{conteudo_criativo.legenda_sugerida}</p>
        </CardContent>
      </Card>

      {dica_producao.cores && dica_producao.cores.length > 0 && (
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Paleta de Cores
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex flex-wrap gap-2">
              {dica_producao.cores.map((cor, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{cor}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Hashtags
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex flex-wrap gap-2">
            {dica_producao.hashtags.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs text-blue-600 border-blue-300">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <ImageGenerationModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        copy={`${conteudo_criativo.descricao_visual}\n\n${conteudo_criativo.legenda_sugerida}`}
        pilar="Edificar"
        defaultFormat="feed_square"
        onImageGenerated={(imageUrl) => {
          setGeneratedImage(imageUrl);
          setIsGenerating(false);
          toast.success("Imagem gerada!");
          
          // Scroll suave até a imagem
          setTimeout(() => {
            const element = document.getElementById('generated-photo-image');
            element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }}
      />
    </div>
  );
};
