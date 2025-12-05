import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, RefreshCw, ImageIcon, Sparkles, Upload, X, Pencil, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSecureApi } from "@/hooks/useSecureApi";
import { useQuota } from "@/hooks/useQuota";
import ImageOverlayEditor from "./ImageOverlayEditor";
import { type OverlayData } from "@/lib/overlayPositions";

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
  const [activeTab, setActiveTab] = useState<string>("generate");
  const [formato, setFormato] = useState(
    isStoryMode ? "story" : (defaultFormat || "feed_square")
  );
  const [estilo, setEstilo] = useState("minimalista");
  const [editedCopy, setEditedCopy] = useState(copy);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceFileName, setReferenceFileName] = useState<string | null>(null);
  const [overlayData, setOverlayData] = useState<OverlayData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { invokeFunction } = useSecureApi();
  const { canUse, incrementUsage } = useQuota();

  const normalizePilar = (pilar: string): string => {
    const pilarMap: Record<string, string> = {
      'EDIFICAR': 'Edificar',
      'ALCANÇAR': 'Alcançar',
      'PERTENCER': 'Pertencer',
      'SERVIR': 'Servir',
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

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem (PNG, JPG, WEBP).',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 4MB.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setReferenceImage(base64);
      setReferenceFileName(file.name);
      setOverlayData(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveReference = () => {
    setReferenceImage(null);
    setReferenceFileName(null);
    setOverlayData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Generate new image with GPT Image 1
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

      const data = await invokeFunction<{ image_url: string }>('generate-post-image', payload);

      if (!data) return;

      setGeneratedImage(data.image_url);
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

  // Analyze image for overlay suggestions
  const handleAnalyzeForOverlay = async () => {
    if (!referenceImage) {
      toast({
        title: 'Imagem necessária',
        description: 'Por favor, envie uma imagem primeiro.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const data = await invokeFunction<OverlayData>('generate-image-overlay', {
        imageBase64: referenceImage,
        tema: editedCopy || 'Post para igreja',
        pilar: normalizePilar(pilar),
        formato,
      });

      if (!data) return;

      setOverlayData(data);

      toast({
        title: "Análise concluída!",
        description: "Sugestões de overlay geradas. Edite como preferir.",
      });
    } catch (error) {
      console.error('Analyze error:', error);
      toast({
        title: 'Erro na análise',
        description: 'Não foi possível analisar a imagem.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOverlayExport = (imageUrl: string) => {
    setGeneratedImage(imageUrl);
    if (onImageGenerated) {
      onImageGenerated(imageUrl);
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
    setOverlayData(null);
    setActiveTab("generate");
    onOpenChange(false);
  };

  // Image upload component (reused in both tabs)
  const ImageUploadSection = ({ required = false }: { required?: boolean }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {required ? 'Sua Imagem' : 'Imagem de Referência (opcional)'}
      </Label>
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
          <span className="text-sm">Clique para enviar uma imagem</span>
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
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto rounded-xl shadow-2xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Criar Imagem para Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!generatedImage ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="generate" className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Gerar Nova
                </TabsTrigger>
                <TabsTrigger value="overlay" className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  Editar Foto
                </TabsTrigger>
              </TabsList>

              {/* Tab: Generate New Image */}
              <TabsContent value="generate" className="space-y-4">
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
                  <Label htmlFor="copy" className="text-sm font-medium">Texto do Post</Label>
                  <Textarea
                    id="copy"
                    value={editedCopy}
                    onChange={(e) => setEditedCopy(e.target.value)}
                    rows={4}
                    className="resize-none text-sm"
                    placeholder="Digite o texto do seu post aqui..."
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 A IA vai criar uma imagem baseada neste texto
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex-1 h-10 sm:h-11 shadow-lg hover:shadow-xl transition-all"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Gerar Imagem
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
              </TabsContent>

              {/* Tab: Edit Photo with Overlays */}
              <TabsContent value="overlay" className="space-y-4">
                <ImageUploadSection required />

                {!isStoryMode && (
                  <div className="space-y-2">
                    <Label htmlFor="formato-overlay" className="text-sm font-medium">Formato</Label>
                    <Select value={formato} onValueChange={setFormato}>
                      <SelectTrigger id="formato-overlay" className="h-10">
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
                  <Label htmlFor="tema" className="text-sm font-medium">Tema/Contexto</Label>
                  <Textarea
                    id="tema"
                    value={editedCopy}
                    onChange={(e) => setEditedCopy(e.target.value)}
                    rows={3}
                    className="resize-none text-sm"
                    placeholder="Ex: Culto de jovens sábado às 19h..."
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 A IA vai sugerir textos e posições baseados no tema
                  </p>
                </div>

                {!overlayData ? (
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleAnalyzeForOverlay}
                      disabled={isAnalyzing || !referenceImage}
                      className="flex-1 h-10 sm:h-11 shadow-lg hover:shadow-xl transition-all"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Analisar e Sugerir
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleClose}
                      variant="outline"
                      disabled={isAnalyzing}
                      className="h-10 sm:h-11"
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <ImageOverlayEditor
                    userImage={referenceImage!}
                    overlayData={overlayData}
                    onOverlayUpdate={setOverlayData}
                    onExport={handleOverlayExport}
                    formato={formato}
                  />
                )}
              </TabsContent>
            </Tabs>
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
