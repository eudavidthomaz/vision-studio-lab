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
  mode?: 'single' | 'carousel';
  slides?: Array<{ texto: string }>;
  onImageGenerated?: (imageUrl: string) => void;
}

const ImageGenerationModal = ({ 
  open, 
  onOpenChange, 
  copy, 
  pilar,
  mode = 'single',
  slides,
  onImageGenerated 
}: ImageGenerationModalProps) => {
  const [formato, setFormato] = useState("feed_square");
  const [estilo, setEstilo] = useState("minimalista");
  const [tema, setTema] = useState("minimalista_gospel");
  const [editedCopy, setEditedCopy] = useState(copy);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const { toast } = useToast();
  const { invokeFunction } = useSecureApi();
  const { canUse, incrementUsage } = useQuota();

  const temas = [
    { value: "minimalista_gospel", label: "Minimalista Gospel", description: "Limpo, elegante, com muito espaço em branco" },
    { value: "vibrante_jovem", label: "Vibrante Jovem", description: "Colorido, moderno, energético" },
    { value: "elegante_classico", label: "Elegante Clássico", description: "Sofisticado, atemporal, cores neutras" },
    { value: "moderno_urbano", label: "Moderno Urbano", description: "Contemporâneo, clean, tipografia forte" }
  ];

  // Função para normalizar o formato do pilar com mapeamento inteligente
  const normalizePilar = (pilar: string): string => {
    const pilarMap: Record<string, string> = {
      // Pilares principais
      'EDIFICAR': 'Edificar',
      'ALCANÇAR': 'Alcançar',
      'PERTENCER': 'Pertencer',
      'SERVIR': 'Servir',
      // Mapeamentos inteligentes
      'CONVITE': 'Alcançar',
      'CONVIDAR': 'Alcançar',
      'EVENTO': 'Alcançar',
      'DEVOÇÃO': 'Edificar',
      'DEVOCIONAL': 'Edificar',
      'REFLEXÃO': 'Edificar',
      'COMUNIDADE': 'Pertencer',
      'FAMÍLIA': 'Pertencer',
      'GRUPO': 'Pertencer',
      'VOLUNTARIADO': 'Servir',
      'AJUDA': 'Servir',
      'MISSÃO': 'Servir',
    };
    return pilarMap[pilar.toUpperCase()] || 'Edificar';
  };

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
      if (mode === 'carousel' && slides) {
        // Geração em lote para carrosséis
        const images: string[] = [];
        for (let i = 0; i < slides.length; i++) {
          const data = await invokeFunction<{ image_url: string }>('generate-post-image', {
            formato: 'feed_square',
            copy: slides[i].texto,
            estilo: tema.split('_')[0], // usa primeira palavra do tema
            pilar: normalizePilar(pilar),
          });

          if (data) {
            images.push(data.image_url);
            incrementUsage('images');
          }
        }
        setGeneratedImages(images);
        toast({
          title: `${images.length} imagens geradas!`,
          description: "Todas as imagens do carrossel foram criadas.",
        });
      } else {
        // Geração única
        const data = await invokeFunction<{ image_url: string }>('generate-post-image', {
          formato,
          copy: editedCopy,
          estilo: tema.split('_')[0],
          pilar: normalizePilar(pilar),
        });

        if (!data) {
          return;
        }

        setGeneratedImage(data.image_url);
        incrementUsage('images');
        
        if (onImageGenerated) {
          onImageGenerated(data.image_url);
        }

        toast({
          title: "Imagem gerada!",
          description: "Sua imagem foi criada com sucesso.",
        });
      }
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
    setGeneratedImages([]);
  };

  const handleClose = () => {
    setGeneratedImage(null);
    setGeneratedImages([]);
    setEditedCopy(copy);
    setFormato("feed_square");
    setEstilo("minimalista");
    setTema("minimalista_gospel");
    onOpenChange(false);
  };

  const handleDownloadAll = () => {
    generatedImages.forEach((img, idx) => {
      const link = document.createElement('a');
      link.href = img;
      link.download = `carrossel-slide-${idx + 1}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    toast({
      title: "Downloads iniciados",
      description: `${generatedImages.length} imagens estão sendo baixadas.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerar Imagem para Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!generatedImage && generatedImages.length === 0 ? (
            <>
              {mode === 'single' && (
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
                    <Label htmlFor="copy">Texto do Post</Label>
                    <Textarea
                      id="copy"
                      value={editedCopy}
                      onChange={(e) => setEditedCopy(e.target.value)}
                      rows={6}
                      className="resize-none"
                      placeholder="Digite o texto do seu post aqui..."
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="tema">Tema Visual</Label>
                <Select value={tema} onValueChange={setTema}>
                  <SelectTrigger id="tema">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {temas.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{t.label}</span>
                          <span className="text-xs text-muted-foreground">{t.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {mode === 'carousel' && slides && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Preview do Carrossel:</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {slides.map((slide, idx) => (
                      <div key={idx} className="text-xs p-2 bg-background rounded border">
                        <span className="font-semibold">Slide {idx + 1}:</span> {slide.texto.substring(0, 50)}...
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando{mode === 'carousel' ? ` (${generatedImages.length}/${slides?.length})` : ''}...
                    </>
                  ) : mode === 'carousel' ? (
                    `Gerar ${slides?.length} Imagens`
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
          ) : generatedImages.length > 0 ? (
            <>
              <div className="space-y-4">
                <p className="text-sm font-medium">{generatedImages.length} imagens geradas:</p>
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {generatedImages.map((img, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden bg-muted">
                      <img src={img} alt={`Slide ${idx + 1}`} className="w-full h-auto" />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        Slide {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleDownloadAll} className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Baixar Todas
                  </Button>
                  <Button onClick={handleRegenerate} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerar
                  </Button>
                </div>

                <Button onClick={handleClose} variant="ghost" className="w-full">
                  Fechar
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
