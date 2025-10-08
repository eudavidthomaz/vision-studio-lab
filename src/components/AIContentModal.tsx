import { Dialog, DialogContent } from "./ui/dialog";
import { AIContentItem } from "./AIContentCard";
import { ContentResultDisplay } from "./ContentResultDisplay";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface AIContentModalProps {
  item: AIContentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIContentModal({ item, open, onOpenChange }: AIContentModalProps) {
  const navigate = useNavigate();

  if (!item) return null;

  // Formatar o conteúdo para o formato esperado pelo ContentResultDisplay
  const formattedContent = {
    fundamento_biblico: item.fundamento_biblico,
    conteudo: item.conteudo,
    estrutura_visual: item.estrutura_visual,
    dica_producao: item.dica_producao,
  };

  const handleSave = () => {
    toast({
      title: "✅ Já salvo!",
      description: "Este conteúdo já está salvo na sua biblioteca",
    });
  };

  const handleEdit = () => {
    // Extrair o ID real do content_planner do id composto
    const plannerId = item.id.split("-")[1];
    onOpenChange(false);
    navigate(`/conteudo/${plannerId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-hidden p-0">
        <div className="overflow-y-auto max-h-[90vh]">
          <ContentResultDisplay
            content={formattedContent}
            onSave={handleSave}
            onRegenerate={handleEdit}
            isSaving={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
