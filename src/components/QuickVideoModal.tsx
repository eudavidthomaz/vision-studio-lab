import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Video, Copy, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

interface QuickVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Duracao = '15s' | '30s' | '60s';

export const QuickVideoModal = ({ open, onOpenChange }: QuickVideoModalProps) => {
  const [mensagem, setMensagem] = useState("");
  const [duracao, setDuracao] = useState<Duracao>('30s');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleGenerate = async () => {
    if (!mensagem.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, descreva a mensagem principal do vídeo.",
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

      const { data, error } = await supabase.functions.invoke('generate-video-script', {
        body: { mensagem_principal: mensagem, duracao }
      });

      if (error) throw error;

      if (data) {
        setGeneratedScript(data);
        setShowPreview(true);
        toast({
          title: "Roteiro gerado!",
          description: "Revise e copie ou salve.",
        });
      }
    } catch (error: any) {
      console.error('Error generating video:', error);
      toast({
        title: "Erro ao gerar roteiro",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAndSave = async () => {
    if (!generatedScript) return;

    const textToCopy = `HOOK: ${generatedScript.hook}\n\nROTEIRO:\n${generatedScript.roteiro}\n\nCTA: ${generatedScript.cta || ""}`;
    await navigator.clipboard.writeText(textToCopy);

    await saveToLibrary();

    toast({
      title: "📋 Copiado e salvo!",
      description: "Roteiro copiado e salvo na biblioteca.",
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
            tipo: 'video',
            hook: generatedScript.hook,
            roteiro: generatedScript.roteiro,
            cta: generatedScript.cta,
            duracao: duracao,
          }]
        }
      });
    } catch (error) {
      console.error('Error saving to library:', error);
    }
  };

  const handleRegenerate = () => {
    setGeneratedScript(null);
    setShowPreview(false);
    handleGenerate();
  };

  const handleClose = () => {
    setMensagem("");
    setGeneratedScript(null);
    setShowPreview(false);
    onOpenChange(false);
  };

  const modalContent = showPreview && generatedScript ? (
    <div className="space-y-4 py-4">
      <div className="p-4 bg-muted rounded-lg space-y-3">
        <Badge variant="secondary" className="mb-2">
          {duracao}
        </Badge>
        
        <div>
          <p className="text-xs text-muted-foreground mb-1 font-semibold">Hook:</p>
          <p className="text-sm">{generatedScript.hook}</p>
        </div>
        
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-1 font-semibold">Roteiro:</p>
          <p className="text-sm whitespace-pre-wrap">{generatedScript.roteiro}</p>
        </div>
        
        {generatedScript.cta && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1 font-semibold">CTA:</p>
            <p className="text-sm">{generatedScript.cta}</p>
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
        <Label htmlFor="mensagem">Qual o ponto central?</Label>
        <Textarea
          id="mensagem"
          placeholder="Ex: Como a fé nos fortalece nas adversidades..."
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={3}
          disabled={isGenerating}
          className="text-base min-h-[100px]"
          autoFocus={isMobile}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duracao">Duração do vídeo</Label>
        <Select value={duracao} onValueChange={(value) => setDuracao(value as Duracao)}>
          <SelectTrigger id="duracao" className="text-base min-h-[48px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15s">15 segundos</SelectItem>
            <SelectItem value="30s">30 segundos</SelectItem>
            <SelectItem value="60s">60 segundos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={handleGenerate} 
        disabled={isGenerating || !mensagem.trim()}
        className="w-full min-h-[48px] text-base"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <Video className="w-4 h-4 mr-2" />
            Gerar Roteiro
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
              <Video className="w-5 h-5 text-primary" />
              {showPreview ? "Preview do Roteiro" : "Criar Vídeo Curto"}
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
            <Video className="w-5 h-5 text-primary" />
            {showPreview ? "Preview do Roteiro" : "Criar Vídeo Curto"}
          </DialogTitle>
        </DialogHeader>
        {modalContent}
      </DialogContent>
    </Dialog>
  );
};
