import { Dialog, DialogContent } from "@/components/ui/dialog";
import { NormalizedContent } from "@/hooks/useContentFeed";
import { ContentResultDisplay } from "@/components/ContentResultDisplay";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import WeeklyPackDisplay from "@/components/WeeklyPackDisplay";

interface ContentFeedModalProps {
  content: NormalizedContent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContentFeedModal({ content, open, onOpenChange }: ContentFeedModalProps) {
  const navigate = useNavigate();

  if (!content) return null;

  const handleSave = () => {
    toast({
      title: "✅ Já salvo!",
      description: "Este conteúdo já está salvo na sua biblioteca",
    });
  };

  const handleEdit = () => {
    const [type, uuid] = content.id.split("-");
    onOpenChange(false);
    if (type === "ai") {
      navigate(`/conteudo/${uuid}`);
    }
  };

  // Renderizar conteúdo de IA
  if (content.source === "ai-creator") {
    const formattedContent = {
      fundamento_biblico: content.rawData.fundamento_biblico,
      conteudo: content.rawData.conteudo,
      estrutura_visual: content.rawData.estrutura_visual,
      dica_producao: content.rawData.dica_producao,
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

  // Renderizar Pack Semanal
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto">
        <WeeklyPackDisplay pack={content.rawData} />
      </DialogContent>
    </Dialog>
  );
}
