import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RegenerateContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: {
    id: string;
    titulo: string;
    tipo: string;
    pilar: string;
    copy: string;
  } | null;
  onRegenerated: (newContent: any) => void;
}

export default function RegenerateContentDialog({
  open,
  onOpenChange,
  content,
  onRegenerated,
}: RegenerateContentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [instructions, setInstructions] = useState("");
  const { toast } = useToast();

  const handleRegenerate = async () => {
    if (!content) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-content-idea",
        {
          body: {
            pilar: content.pilar,
            tipo: content.tipo,
            instructions: instructions || `Regenerar o conteúdo "${content.titulo}" com uma nova abordagem`,
          },
        }
      );

      if (error) throw error;

      onRegenerated({
        ...data,
        id: content.id, // Keep same ID
      });

      toast({
        title: "✨ Regenerado!",
        description: "Conteúdo foi regenerado com sucesso.",
      });

      onOpenChange(false);
      setInstructions("");
    } catch (error: any) {
      console.error("Error regenerating content:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível regenerar o conteúdo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Regenerar Conteúdo
          </DialogTitle>
          <DialogDescription>
            A IA criará uma nova versão deste conteúdo mantendo o mesmo tipo e
            pilar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {content && (
            <div className="bg-muted rounded-lg p-3 space-y-1">
              <p className="text-sm font-medium">{content.titulo}</p>
              <p className="text-xs text-muted-foreground">
                {content.tipo} • {content.pilar}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="instructions">
              Instruções (opcional)
            </Label>
            <Textarea
              id="instructions"
              placeholder="Ex: Deixe mais curto, adicione humor, foque em jovens..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Deixe em branco para uma regeneração completa
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleRegenerate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Regenerando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
