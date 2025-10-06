import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContentIdeaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPilar?: string;
  onIdeaGenerated: (idea: any) => void;
}

export default function ContentIdeaModal({ 
  open, 
  onOpenChange, 
  defaultPilar = "Edificar",
  onIdeaGenerated 
}: ContentIdeaModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [tipo, setTipo] = useState("Reel");
  const [tema, setTema] = useState("");
  const [tom, setTom] = useState("Inspirador");
  const [pilar, setPilar] = useState(defaultPilar);
  const [contexto, setContexto] = useState("");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!tema.trim()) {
      toast({
        title: "Tema obrigatório",
        description: "Por favor, informe o tema do conteúdo.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content-idea`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            tipo_conteudo: tipo,
            tema,
            tom,
            pilar,
            contexto_adicional: contexto
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao gerar ideia');
      }

      const idea = await response.json();
      onIdeaGenerated(idea);
      onOpenChange(false);
      
      // Reset form
      setTema("");
      setContexto("");
      
      toast({
        title: "Ideia gerada!",
        description: "Nova ideia de conteúdo criada com sucesso.",
      });
    } catch (error) {
      console.error('Error generating idea:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a ideia. Tente novamente.",
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
          <DialogTitle>Gerar Nova Ideia de Conteúdo</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para gerar uma ideia personalizada
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Conteúdo</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger id="tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Reel">Reel</SelectItem>
                <SelectItem value="Carrossel">Carrossel</SelectItem>
                <SelectItem value="Story">Story</SelectItem>
                <SelectItem value="Post">Post</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tema">Tema *</Label>
            <Input
              id="tema"
              placeholder="Ex: Perdão, Fé, Esperança, Oração..."
              value={tema}
              onChange={(e) => setTema(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tom">Tom</Label>
            <Select value={tom} onValueChange={setTom}>
              <SelectTrigger id="tom">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Acolhedor">Acolhedor</SelectItem>
                <SelectItem value="Desafiador">Desafiador</SelectItem>
                <SelectItem value="Inspirador">Inspirador</SelectItem>
                <SelectItem value="Humorístico">Humorístico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pilar">Pilar Estratégico</Label>
            <Select value={pilar} onValueChange={setPilar}>
              <SelectTrigger id="pilar">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Edificar">Edificar</SelectItem>
                <SelectItem value="Alcançar">Alcançar</SelectItem>
                <SelectItem value="Pertencer">Pertencer</SelectItem>
                <SelectItem value="Servir">Servir</SelectItem>
                <SelectItem value="Convite">Convite</SelectItem>
                <SelectItem value="Comunidade">Comunidade</SelectItem>
                <SelectItem value="Cobertura">Cobertura</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contexto">Contexto Adicional (opcional)</Label>
            <Textarea
              id="contexto"
              placeholder="Ex: Para grupo de jovens, Domingo de Páscoa, Campanha de Natal..."
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              "Gerar Ideia"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
