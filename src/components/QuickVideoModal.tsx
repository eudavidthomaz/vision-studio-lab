import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface QuickVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Duracao = '15s' | '30s' | '60s';

export const QuickVideoModal = ({ open, onOpenChange }: QuickVideoModalProps) => {
  const [mensagem, setMensagem] = useState("");
  const [duracao, setDuracao] = useState<Duracao>('30s');
  const [isGenerating, setIsGenerating] = useState(false);
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
        toast({
          title: "Roteiro criado com sucesso!",
          description: "Redirecionando para o planner...",
        });
        
        onOpenChange(false);
        setMensagem("");
        navigate('/planner');
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

  const modalContent = (
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
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              Criar Vídeo Curto
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Criar Vídeo Curto
          </DialogTitle>
        </DialogHeader>
        {modalContent}
      </DialogContent>
    </Dialog>
  );
};
