import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import WeeklyPackDisplay from "./WeeklyPackDisplay";
import IdeonChallengeCard from "./IdeonChallengeCard";

interface DetailModalProps {
  item: any;
  type: "pack" | "challenge";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DetailModal({ item, type, open, onOpenChange }: DetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Conteúdo</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {type === "pack" && (
            <WeeklyPackDisplay 
              pack={item.pack}
            />
          )}
          {type === "challenge" && <IdeonChallengeCard challenge={item.challenge} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}