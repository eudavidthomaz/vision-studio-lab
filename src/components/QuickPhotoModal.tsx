import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface QuickPhotoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type EstiloFoto = 'inspiracional' | 'versículo' | 'convite' | 'testemunho';

export const QuickPhotoModal = ({ open, onOpenChange }: QuickPhotoModalProps) => {
  const [tema, setTema] = useState("");
  const [estilo, setEstilo] = useState<EstiloFoto>('inspiracional');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

      if (data) {
        toast({
          title: "Ideia de foto criada!",
          description: "Redirecionando para o planner...",
        });
        
        onOpenChange(false);
        setTema("");
        navigate('/planner');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Criar Foto Rápida
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tema">Qual mensagem transmitir?</Label>
            <Textarea
              id="tema"
              placeholder="Ex: Esperança em meio às dificuldades..."
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              rows={3}
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estilo">Estilo do post</Label>
            <Select value={estilo} onValueChange={(value) => setEstilo(value as EstiloFoto)}>
              <SelectTrigger id="estilo">
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
            className="w-full"
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
      </DialogContent>
    </Dialog>
  );
};
