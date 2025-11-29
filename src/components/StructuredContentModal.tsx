import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { StructuredContentTabs } from "./StructuredContentTabs";

interface StructuredContentModalProps {
  open: boolean;
  onClose: () => void;
  modalidades: Record<string, any>;
  checklist?: Record<string, any>;
  title?: string;
}

export function StructuredContentModal({ open, onClose, modalidades, checklist, title }: StructuredContentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{title || "Conteúdo estruturado"}</DialogTitle>
        </DialogHeader>
        <StructuredContentTabs modalidades={modalidades} checklist={checklist} />
      </DialogContent>
    </Dialog>
  );
}
