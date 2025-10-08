import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSecureApi } from "@/hooks/useSecureApi";
import { useQuota } from "@/hooks/useQuota";

interface ImageGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  copy: string;
  pilar: string;
  onImageGenerated?: (imageUrl: string) => void;
}

const ImageGenerationModal = ({ 
  open, 
  onOpenChange, 
  copy, 
  pilar,
  onImageGenerated 
}: ImageGenerationModalProps) => {
  const [formato, setFormato] = useState("feed_square");
  const [estilo, setEstilo] = useState("minimalista");
  const [editedCopy, setEditedCopy] = useState(copy);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();
  const { invokeFunction } = useSecureApi();
  const { canUse, incrementUsage } = useQuota();

  const handleGenerate = async () => {
    if (!canUse('images')) {
      toast({
        title: 'Limite atingido',
        description: 'Você atingiu o limite mensal de imagens geradas.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const data = await invokeFunction<{ image_url: string }>('generate-post-image', {
        formato,
        copy: editedCopy,
        estilo,
        pilar,
      });

      if (!data) {
        // Error already handled by useSecureApi
        return;
      }

      setGeneratedImage(data.image_url);
      
      // Increment quota usage
      incrementUsage('images');
      
      if (onImageGenerated) {
        onImageGenerated(data.image_url);
      }

      toast({
        title: "Imagem gerada!",
        description: "Sua imagem foi criada com sucesso.",
      });
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ide-on-${formato}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download iniciado",
      description: "A imagem está sendo baixada.",
    });
  };

  const handleRegenerate = () => {
    setGeneratedImage(null);
  };

  const handleClose = () => {
    setGeneratedImage(null);
    setEditedCopy(copy);
    setFormato("feed_square");
    setEstilo("minimalista");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerar Imagem para Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!generatedImage ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="formato">Formato</Label>
                <Select value={formato} onValueChange={setFormato}>
                  <SelectTrigger id="formato">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feed_square">Feed Quadrado (1:1)</SelectItem>
                    <SelectItem value="feed_portrait">Feed Vertical (4:5)</SelectItem>
                    <SelectItem value="story">Story (9:16)</SelectItem>
                    <SelectItem value="reel_cover">Capa de Reel (9:16)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estilo">Estilo</Label>
                <Select value={estilo} onValueChange={setEstilo}>
                  <SelectTrigger id="estilo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimalista">Minimalista</SelectItem>
                    <SelectItem value="tipografico">Tipográfico</SelectItem>
                    <SelectItem value="fotografico">Fotográfico</SelectItem>
                    <SelectItem value="ilustrativo">Ilustrativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="copy">Texto do Post</Label>
                <Textarea
                  id="copy"
                  value={editedCopy}
                  onChange={(e) => setEditedCopy(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Você pode editar o texto se desejar
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    "Gerar Imagem"
                  )}
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  disabled={isGenerating}
                >
                  Cancelar
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-muted">
                  <img
                    src={generatedImage}
                    alt="Imagem gerada"
                    className="w-full h-auto"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleDownload}
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    onClick={handleRegenerate}
                    variant="outline"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerar
                  </Button>
                </div>

                <Button
                  onClick={handleClose}
                  variant="ghost"
                  className="w-full"
                >
                  Fechar
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageGenerationModal;
