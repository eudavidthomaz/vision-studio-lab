import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface QuickPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickPostModal = ({ open, onOpenChange }: QuickPostModalProps) => {
  const [tema, setTema] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Criar Post Rápido
          </DialogTitle>
        </DialogHeader>
        
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
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !tema.trim()}
            className="w-full"
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
      </DialogContent>
    </Dialog>
  );
};
