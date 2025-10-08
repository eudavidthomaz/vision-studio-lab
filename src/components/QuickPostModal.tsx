import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface QuickPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickPostModal = ({ open, onOpenChange }: QuickPostModalProps) => {
  const [tema, setTema] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleGenerate = async () => {
    if (!tema.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, descreva o tema do post.",
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

      const { data, error } = await supabase.functions.invoke('generate-quick-post', {
        body: { tema, tipo: 'post' }
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Post criado com sucesso!",
          description: "Redirecionando para o planner...",
        });
        
        onOpenChange(false);
        setTema("");
        navigate('/planner');
      }
    } catch (error: any) {
      console.error('Error generating post:', error);
      toast({
        title: "Erro ao gerar post",
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
        <Label htmlFor="tema">Sobre o que você quer falar?</Label>
        <Textarea
          id="tema"
          placeholder="Ex: A importância da oração diária, fé em tempos difíceis..."
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          rows={4}
          disabled={isGenerating}
          className="text-base min-h-[120px]"
          autoFocus={isMobile}
        />
      </div>

      <Button 
        onClick={handleGenerate} 
        disabled={isGenerating || !tema.trim()}
        className="w-full min-h-[48px] text-base"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Gerar Agora
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
              <Sparkles className="w-5 h-5 text-primary" />
              Criar Post Rápido
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
            <Sparkles className="w-5 h-5 text-primary" />
            Criar Post Rápido
          </DialogTitle>
        </DialogHeader>
        {modalContent}
      </DialogContent>
    </Dialog>
  );
};
