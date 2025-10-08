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

      if (data?.content) {
        setGeneratedPost(data.content);
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
    <div className="space-y-3">
      <div className="p-3 bg-muted rounded-lg space-y-2 max-h-[40vh] overflow-y-auto">
        {generatedPost.pilar && (
          <Badge variant="secondary" className="mb-1">
            {generatedPost.pilar}
          </Badge>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{generatedPost.copy}</p>
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
          className="flex-1 h-11 text-sm"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copiar e Salvar
        </Button>
        <Button 
          onClick={handleRegenerate}
          variant="outline"
          disabled={isGenerating}
          className="h-11 w-11 p-0"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  ) : (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="tema" className="text-sm">Sobre o que você quer falar?</Label>
        <Textarea
          id="tema"
          placeholder="Ex: A importância da oração diária, fé em tempos difíceis..."
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          onFocus={(e) => {
            setTimeout(() => {
              e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          }}
          rows={3}
          disabled={isGenerating}
          className="text-base max-h-[120px] resize-none"
          autoFocus={!isMobile}
          inputMode="text"
        />
      </div>

      <Button 
        onClick={handleGenerate} 
        disabled={isGenerating || !tema.trim()}
        className="w-full h-11 text-sm"
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
        <DrawerContent className="max-h-[85dvh] flex flex-col touch-manipulation">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {showPreview ? "Preview do Post" : "Criar Post Rápido"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-safe overflow-y-auto flex-1 overscroll-contain">
            {modalContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {showPreview ? "Preview do Post" : "Criar Post Rápido"}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          {modalContent}
        </div>
      </DialogContent>
    </Dialog>
  );
};
