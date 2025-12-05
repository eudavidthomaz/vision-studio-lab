import { useState } from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";
import { useAnalytics } from "@/hooks/useAnalytics";

interface OnboardingTourProps {
  run: boolean;
  onComplete: () => void;
}

const OnboardingTour = ({ run, onComplete }: OnboardingTourProps) => {
  const { trackEvent } = useAnalytics();
  const [steps] = useState<Step[]>([
    {
      target: '[data-tour="ai-creator"]',
      content: "Comece criando conteúdo com IA! Descreva o que você quer e deixe a inteligência artificial criar posts, carrosseis, stories e muito mais.",
      disableBeacon: true,
      placement: "bottom",
    },
    {
      target: '[data-tour="audio-input"]',
      content: "Ou envie o áudio da sua pregação aqui. Ela será transcrita automaticamente e você poderá gerar conteúdos baseados nela.",
      placement: "top",
    },
    {
      target: '[data-tour="conteudos-button"]',
      content: "Acesse sua biblioteca com todo o conteúdo criado. Organize, edite e exporte quando precisar.",
      placement: "bottom",
    },
  ]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      if (status === STATUS.FINISHED) {
        trackEvent('tour_completed');
      } else if (status === STATUS.SKIPPED) {
        trackEvent('tour_skipped');
      }
      onComplete();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      styles={{
        options: {
          primaryColor: "hsl(var(--primary))",
          textColor: "hsl(var(--foreground))",
          backgroundColor: "hsl(var(--card))",
          overlayColor: "rgba(0, 0, 0, 0.7)",
          arrowColor: "hsl(var(--card))",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 8,
          padding: 20,
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          borderRadius: 6,
          padding: "8px 16px",
        },
        buttonBack: {
          color: "hsl(var(--muted-foreground))",
        },
        buttonSkip: {
          color: "hsl(var(--muted-foreground))",
        },
      }}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Finalizar",
        next: "Próximo",
        skip: "Pular Tour",
      }}
      callback={handleJoyrideCallback}
    />
  );
};

export default OnboardingTour;