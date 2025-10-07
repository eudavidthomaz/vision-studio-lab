import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAnalytics } from "@/hooks/useAnalytics";
import { toast } from "sonner";

interface NPSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NPSModal = ({ isOpen, onClose }: NPSModalProps) => {
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const { trackEvent } = useAnalytics();

  const handleScoreClick = (value: number) => {
    setScore(value);
    setShowFeedback(true);
  };

  const handleSubmit = async () => {
    if (score === null) return;

    await trackEvent('nps_submitted', {
      score,
      feedback: feedback.trim() || null,
      category: score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor'
    });

    toast.success("Obrigado pelo seu feedback!");
    onClose();
  };

  const handleSkip = () => {
    if (score !== null) {
      handleSubmit();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Como está sua experiência?</DialogTitle>
          <DialogDescription>
            De 0 a 10, quanto você recomendaria o Ide.On para outro pastor ou líder?
          </DialogDescription>
        </DialogHeader>

        {!showFeedback ? (
          <div className="space-y-4">
            <div className="grid grid-cols-11 gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <Button
                  key={value}
                  variant={score === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleScoreClick(value)}
                  className="h-10 w-full p-0"
                >
                  {value}
                </Button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Nada provável</span>
              <span>Muito provável</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary mb-2">Nota: {score}</p>
              <p className="text-sm text-muted-foreground">
                {score! >= 9 
                  ? "Que ótimo! O que você mais gostou?" 
                  : score! >= 7 
                  ? "Obrigado! Como podemos melhorar?" 
                  : "Sentimos muito. O que podemos melhorar?"}
              </p>
            </div>
            <Textarea
              placeholder="Seu feedback aqui (opcional)..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSkip} className="flex-1">
                {feedback.trim() ? "Enviar depois" : "Pular"}
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                Enviar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NPSModal;
