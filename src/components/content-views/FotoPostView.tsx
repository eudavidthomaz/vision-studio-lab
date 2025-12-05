import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Palette, Hash, Type, Image as ImageIcon, Copy, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ImageGenerationModal from "@/components/ImageGenerationModal";

interface FotoPostViewProps {
  conteudo_criativo?: any;
  dica_producao?: any;
  data?: any;
  onRegenerate?: () => void;
}

export const FotoPostView = ({ conteudo_criativo, dica_producao, data, onRegenerate }: FotoPostViewProps) => {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Normalizar dados de múltiplas fontes
  const rawData = data || { conteudo_criativo, dica_producao };
  const cc = rawData?.conteudo_criativo || rawData?.conteudo || rawData;
  const dp = rawData?.dica_producao || rawData?.dicas || {};
  
  const normalized = {
    descricao_visual: cc?.descricao_visual || cc?.descricao || cc?.visual || '',
    sugestoes_composicao: cc?.sugestoes_composicao || cc?.sugestoes || cc?.dicas_foto || [],
    legenda_sugerida: cc?.legenda_sugerida || cc?.legenda || cc?.texto || '',
    ferramentas: dp?.ferramentas || [],
    cores: dp?.cores || dp?.paleta || [],
    hashtags: dp?.hashtags || [],
  };
  
  const hasContent = normalized.descricao_visual || normalized.legenda_sugerida;

  const handleGenerateImage = () => {
    setIsGenerating(true);
    setImageModalOpen(true);
  };

  const copyAll = () => {
    let fullText = `📸 IDEIA DE FOTO\n\n`;
    fullText += `📹 Visual: ${normalized.descricao_visual}\n\n`;
    if (normalized.sugestoes_composicao.length > 0) {
      fullText += `💡 Sugestões:\n`;
      normalized.sugestoes_composicao.forEach((s: string) => fullText += `• ${s}\n`);
      fullText += '\n';
    }
    fullText += `📝 Legenda:\n${normalized.legenda_sugerida}\n\n`;
    if (normalized.hashtags.length > 0) {
      fullText += `#️⃣ ${normalized.hashtags.join(' ')}`;
    }
    
    navigator.clipboard.writeText(fullText);
    toast.success("Conteúdo copiado!");
  };

  if (!hasContent) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Foto Post incompleto</p>
          <p className="text-sm text-muted-foreground mb-4">
            O conteúdo não foi gerado corretamente. Tente regenerar.
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
        <CardHeader className="p-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Descrição Visual
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={copyAll}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
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
          <p className="text-sm whitespace-pre-line text-muted-foreground">{normalized.descricao_visual}</p>
        </CardContent>
      </Card>

      {normalized.sugestoes_composicao.length > 0 && (
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Sugestões de Composição
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ul className="space-y-1.5 list-disc list-inside text-sm text-muted-foreground">
              {normalized.sugestoes_composicao.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {normalized.legenda_sugerida && (
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Type className="h-4 w-4" />
              Legenda Sugerida
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-sm whitespace-pre-line text-muted-foreground">{normalized.legenda_sugerida}</p>
          </CardContent>
        </Card>
      )}

      {normalized.cores.length > 0 && (
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Paleta de Cores
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex flex-wrap gap-2">
              {normalized.cores.map((cor: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs">{cor}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {normalized.hashtags.length > 0 && (
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Hashtags
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex flex-wrap gap-2">
              {normalized.hashtags.map((tag: string, i: number) => (
                <Badge key={i} variant="outline" className="text-xs text-blue-600 border-blue-300">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ImageGenerationModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        copy={`${normalized.descricao_visual}\n\n${normalized.legenda_sugerida}`}
        pilar="Edificar"
        defaultFormat="feed_square"
        onImageGenerated={(imageUrl) => {
          setGeneratedImage(imageUrl);
          setIsGenerating(false);
          toast.success("Imagem gerada!");
          
          setTimeout(() => {
            const element = document.getElementById('generated-photo-image');
            element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }}
      />
    </div>
  );
};