import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Copy, RotateCcw, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

interface QuickPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickPostModal = ({ open, onOpenChange }: QuickPostModalProps) => {
  const [tema, setTema] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
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
        setGeneratedPost(data);
        setShowPreview(true);
        toast({
          title: "Post gerado!",
          description: "Revise e copie ou salve.",
        });
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

  const handleCopyAndSave = async () => {
    if (!generatedPost) return;

    const textToCopy = `${generatedPost.copy}\n\n${generatedPost.hashtags?.join(" ") || ""}`;
    await navigator.clipboard.writeText(textToCopy);

    await saveToLibrary();

    toast({
      title: "📋 Copiado e salvo!",
      description: "Conteúdo copiado e salvo na biblioteca.",
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
            tipo: 'post',
            copy: generatedPost.copy,
            hashtags: generatedPost.hashtags || [],
            pilar: generatedPost.pilar || '',
          }]
        }
      });
    } catch (error) {
      console.error('Error saving to library:', error);
    }
  };

  const handleRegenerate = () => {
    setGeneratedPost(null);
    setShowPreview(false);
    handleGenerate();
  };

  const handleClose = () => {
    setTema("");
    setGeneratedPost(null);
    setShowPreview(false);
    onOpenChange(false);
  };

  const modalContent = showPreview && generatedPost ? (
    <div className="space-y-4 py-4">
      <div className="p-4 bg-muted rounded-lg space-y-3">
        {generatedPost.pilar && (
          <Badge variant="secondary" className="mb-2">
            {generatedPost.pilar}
          </Badge>
        )}
        <p className="text-sm whitespace-pre-wrap">{generatedPost.copy}</p>
        {generatedPost.hashtags && (
          <div className="flex gap-1 flex-wrap pt-2 border-t">
            {generatedPost.hashtags.map((tag: string, idx: number) => (
              <span key={idx} className="text-xs text-primary">{tag}</span>
            ))}
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
        <Label htmlFor="tema" className="text-sm sm:text-base">Sobre o que você quer falar?</Label>
        <Textarea
          id="tema"
          placeholder="Ex: A importância da oração diária, fé em tempos difíceis..."
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          rows={4}
          disabled={isGenerating}
          className="text-sm sm:text-base min-h-[100px] sm:min-h-[120px]"
          autoFocus={!isMobile}
        />
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
            <Sparkles className="w-4 h-4 mr-2" />
            Gerar Agora
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
              <Sparkles className="w-5 h-5 text-primary" />
              {showPreview ? "Preview do Post" : "Criar Post Rápido"}
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
            <Sparkles className="w-5 h-5 text-primary" />
            {showPreview ? "Preview do Post" : "Criar Post Rápido"}
          </DialogTitle>
        </DialogHeader>
        {modalContent}
      </DialogContent>
    </Dialog>
  );
};
