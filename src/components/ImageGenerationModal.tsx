import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Download, RefreshCw, ImageIcon, Sparkles, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSecureApi } from "@/hooks/useSecureApi";
import { useQuota } from "@/hooks/useQuota";

interface ImageGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  copy: string;
  pilar: string;
  isStoryMode?: boolean;
  defaultFormat?: string;
  onImageGenerated?: (imageUrl: string) => void;
}

const ImageGenerationModal = ({ 
  open, 
  onOpenChange, 
  copy, 
  pilar,
  isStoryMode,
  defaultFormat,
  onImageGenerated 
}: ImageGenerationModalProps) => {
  const [formato, setFormato] = useState(
    isStoryMode ? "story" : (defaultFormat || "feed_square")
  );
  const [estilo, setEstilo] = useState("minimalista");
  const [editedCopy, setEditedCopy] = useState(copy);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceFileName, setReferenceFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { invokeFunction } = useSecureApi();
  const { canUse, incrementUsage } = useQuota();

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem (PNG, JPG, WEBP).',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 4MB for OpenAI)
    if (file.size > 4 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 4MB.',
        variant: 'destructive',
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setReferenceImage(base64);
      setReferenceFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveReference = () => {
    setReferenceImage(null);
    setReferenceFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      const payload: Record<string, unknown> = {
        formato,
        copy: editedCopy,
        estilo,
        pilar: normalizePilar(pilar),
      };

      // Add reference image if provided
      if (referenceImage) {
        payload.referenceImage = referenceImage;
      }

      const data = await invokeFunction<{ image_url: string }>('generate-post-image', payload);

      if (!data) {
        return;
      }

      setGeneratedImage(data.image_url);
      
      // Increment quota usage
      incrementUsage('images');
      
      if (onImageGenerated) {
        onImageGenerated(data.image_url);
      }

      toast({
        title: referenceImage ? "Imagem editada!" : "Imagem gerada!",
        description: referenceImage 
          ? "Sua imagem foi editada com sucesso." 
          : "Sua imagem foi criada com sucesso.",
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
    setReferenceImage(null);
    setReferenceFileName(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto rounded-xl shadow-2xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            {referenceImage ? 'Editar Imagem' : 'Gerar Imagem para Post'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          {!generatedImage ? (
            <>
              {/* Upload de imagem de referência */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Imagem de Referência (opcional)</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {!referenceImage ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 hover:bg-muted/50 transition-colors flex flex-col items-center gap-2 text-muted-foreground"
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-sm">Clique para enviar uma imagem base</span>
                    <span className="text-xs">PNG, JPG ou WEBP (máx. 4MB)</span>
                  </button>
                ) : (
                  <div className="relative rounded-lg overflow-hidden bg-muted border border-border">
                    <img
                      src={referenceImage}
                      alt="Imagem de referência"
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <span className="text-xs text-white truncate max-w-[200px]">
                        {referenceFileName}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={handleRemoveReference}
                        className="h-7 px-2"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  💡 Envie uma imagem para editar/aprimorar com IA
                </p>
              </div>

              {!isStoryMode && (
                <div className="space-y-2">
                  <Label htmlFor="formato" className="text-sm font-medium">Formato</Label>
                  <Select value={formato} onValueChange={setFormato}>
                    <SelectTrigger id="formato" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="feed_square">📱 Feed Quadrado (1:1)</SelectItem>
                      <SelectItem value="feed_portrait">📱 Feed Vertical (4:5)</SelectItem>
                      <SelectItem value="story">📱 Story (9:16)</SelectItem>
                      <SelectItem value="reel_cover">🎬 Capa de Reel (9:16)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="estilo" className="text-sm font-medium">Estilo</Label>
                <Select value={estilo} onValueChange={setEstilo}>
                  <SelectTrigger id="estilo" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="minimalista">✨ Minimalista</SelectItem>
                    <SelectItem value="tipografico">📝 Tipográfico</SelectItem>
                    <SelectItem value="fotografico">📸 Fotográfico</SelectItem>
                    <SelectItem value="ilustrativo">🎨 Ilustrativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="copy" className="text-sm font-medium">
                  {referenceImage ? 'Instruções de Edição' : 'Texto do Post'}
                </Label>
                <Textarea
                  id="copy"
                  value={editedCopy}
                  onChange={(e) => setEditedCopy(e.target.value)}
                  rows={6}
                  className="resize-none text-sm"
                  placeholder={referenceImage 
                    ? "Descreva como quer editar a imagem..." 
                    : "Digite o texto do seu post aqui..."}
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  💡 {referenceImage 
                    ? 'Descreva as alterações desejadas na imagem' 
                    : 'Você pode editar o texto antes de gerar'}
                </p>
              </div>

              <div className="flex gap-2 pt-3 sm:pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 h-10 sm:h-11 shadow-lg hover:shadow-xl transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {referenceImage ? 'Editando...' : 'Gerando...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {referenceImage ? 'Editar Imagem' : 'Gerar Imagem'}
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  disabled={isGenerating}
                  className="h-10 sm:h-11"
                >
                  Cancelar
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3 sm:space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-muted shadow-2xl">
                  <img
                    src={generatedImage}
                    alt="Imagem gerada"
                    className="w-full h-auto"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleDownload}
                    className="flex-1 h-10 sm:h-11 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    onClick={handleRegenerate}
                    variant="outline"
                    className="h-10 sm:h-11 hover:bg-primary/10 hover:border-primary/50 transition-all"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Regenerar</span>
                  </Button>
                </div>

                <Button
                  onClick={handleClose}
                  variant="ghost"
                  className="w-full h-10 hover:bg-muted transition-colors"
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
