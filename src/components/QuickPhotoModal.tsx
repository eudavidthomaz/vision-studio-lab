import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Camera, Copy, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

interface QuickPhotoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type EstiloFoto = 'inspiracional' | 'versículo' | 'convite' | 'testemunho';

export const QuickPhotoModal = ({ open, onOpenChange }: QuickPhotoModalProps) => {
  const [tema, setTema] = useState("");
  const [estilo, setEstilo] = useState<EstiloFoto>('inspiracional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleGenerate = async () => {
    if (!tema.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, descreva a mensagem que deseja transmitir.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Por favor, faça login novamente.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-photo-idea', {
        body: { tema, estilo }
      });

      if (error) throw error;

      if (data?.content) {
        setGeneratedIdea(data.content);
        setShowPreview(true);
        toast({
          title: "Ideia gerada!",
          description: "Revise e copie ou salve.",
        });
      }
    } catch (error: any) {
      console.error('Error generating photo:', error);
      toast({
        title: "Erro ao gerar ideia",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAndSave = async () => {
    if (!generatedIdea) return;

    const textToCopy = `${generatedIdea.copy}\n\n${generatedIdea.sugestao_visual || ""}`;
    await navigator.clipboard.writeText(textToCopy);

    await saveToLibrary();

    toast({
      title: "📋 Copiado e salvo!",
      description: "Ideia copiada e salva na biblioteca.",
    });

    handleClose();
  };

  const saveToLibrary = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      await supabase.from('content_planners').insert({
        user_id: user.id,
        week_start_date: today,
        content: {
          [today]: [{
            id: crypto.randomUUID(),
            tipo: 'foto',
            copy: generatedIdea.copy,
            sugestao_visual: generatedIdea.sugestao_visual,
            estilo: estilo,
          }]
        }
      });
    } catch (error) {
      console.error('Error saving to library:', error);
    }
  };

  const handleRegenerate = () => {
    setGeneratedIdea(null);
    setShowPreview(false);
    handleGenerate();
  };

  const handleClose = () => {
    setTema("");
    setGeneratedIdea(null);
    setShowPreview(false);
    onOpenChange(false);
  };

  const modalContent = showPreview && generatedIdea ? (
    <div className="space-y-4 py-4">
      <div className="p-4 bg-muted rounded-lg space-y-3">
        <Badge variant="secondary" className="mb-2">
          {estilo}
        </Badge>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Texto:</p>
          <p className="text-sm whitespace-pre-wrap">{generatedIdea.copy}</p>
        </div>
        {generatedIdea.sugestao_visual && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1">Sugestão Visual:</p>
            <p className="text-sm italic">{generatedIdea.sugestao_visual}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={handleCopyAndSave}
          className="flex-1 min-h-[48px]"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copiar e Salvar
        </Button>
        <Button 
          onClick={handleRegenerate}
          variant="outline"
          disabled={isGenerating}
          className="min-h-[48px]"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  ) : (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="tema" className="text-sm sm:text-base">Qual mensagem transmitir?</Label>
        <Textarea
          id="tema"
          placeholder="Ex: Esperança em meio às dificuldades..."
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          rows={3}
          disabled={isGenerating}
          className="text-sm sm:text-base min-h-[80px] sm:min-h-[100px]"
          autoFocus={!isMobile}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="estilo" className="text-sm sm:text-base">Estilo do post</Label>
        <Select value={estilo} onValueChange={(value) => setEstilo(value as EstiloFoto)}>
          <SelectTrigger id="estilo" className="text-sm sm:text-base min-h-[44px] sm:min-h-[48px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inspiracional">Inspiracional</SelectItem>
            <SelectItem value="versículo">Versículo</SelectItem>
            <SelectItem value="convite">Convite</SelectItem>
            <SelectItem value="testemunho">Testemunho</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={handleGenerate} 
        disabled={isGenerating || !tema.trim()}
        className="w-full min-h-[44px] sm:min-h-[48px] text-sm sm:text-base"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <Camera className="w-4 h-4 mr-2" />
            Gerar Ideia
          </>
        )}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              {showPreview ? "Preview da Ideia" : "Criar Foto Rápida"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">
            {modalContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            {showPreview ? "Preview da Ideia" : "Criar Foto Rápida"}
          </DialogTitle>
        </DialogHeader>
        {modalContent}
      </DialogContent>
    </Dialog>
  );
};
