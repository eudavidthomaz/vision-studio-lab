import { Dialog, DialogContent } from "@/components/ui/dialog";
import { NormalizedContent } from "@/hooks/useContentFeed";
import { UnifiedContentDisplay } from "@/components/UnifiedContentDisplay";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface ContentFeedModalProps {
  content: NormalizedContent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContentFeedModal({ content, open, onOpenChange }: ContentFeedModalProps) {
  const navigate = useNavigate();

  if (!content) return null;

  const handleEdit = () => {
    const [type, uuid] = content.id.split("-");
    onOpenChange(false);
    if (type === "content") {
      navigate(`/conteudo/${uuid}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-hidden p-0">
        <div className="overflow-y-auto max-h-[90vh] p-3 sm:p-6 lg:p-8">
          <UnifiedContentDisplay content={content.rawData} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
