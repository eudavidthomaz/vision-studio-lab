import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Zap, Calendar, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingFlowProps {
  open: boolean;
  onComplete: () => void;
}

const steps = [
  {
    title: 'Bem-vindo ao Pastor.IA! 🎉',
    description: 'Vamos fazer um tour rápido pelas principais funcionalidades.',
    icon: Sparkles,
  },
  {
    title: 'Crie Packs Semanais',
    description: 'Gere conteúdo completo para suas redes sociais a partir de uma mensagem ou transcrição de áudio.',
    icon: Sparkles,
  },
  {
    title: 'Desafios Ide.On',
    description: 'Crie desafios criativos de evangelização em vídeo para engajar sua comunidade.',
    icon: Zap,
  },
  {
    title: 'Planejador de Conteúdo',
    description: 'Organize e agende seu conteúdo em um calendário visual e intuitivo.',
    icon: Calendar,
  },
];

export const OnboardingFlow = ({ open, onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        onComplete();
        navigate('/dashboard');
      }, 500);
    }
  };

  const handleSkip = () => {
    onComplete();
    navigate('/dashboard');
  };

  const step = steps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={open}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-md max-h-[90dvh] overflow-y-auto overflow-x-hidden" data-prevent-zoom>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Progress value={progress} className="h-1" />
            <p className="text-xs text-muted-foreground text-center">
              Passo {currentStep + 1} de {steps.length}
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-scale-in">
              <Icon className="h-8 w-8 text-primary" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{step.title}</h2>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
              >
                Voltar
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {currentStep < steps.length - 1 ? (
                'Próximo'
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Começar
                </>
              )}
            </Button>
          </div>

          {currentStep === 0 && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="w-full text-xs"
            >
              Pular tutorial
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
