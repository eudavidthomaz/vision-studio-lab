import { useEffect, useState } from "react";
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
      target: '[data-tour="audio-input"]',
      content: "Comece gravando ou fazendo upload da sua pregação aqui. O áudio será transcrito automaticamente.",
      disableBeacon: true,
      placement: "bottom",
    },
    {
      target: '[data-tour="weekly-pack"]',
      content: "Após a transcrição, todo o conteúdo da semana será gerado aqui. Você terá posts, stories, reels e muito mais!",
      placement: "top",
    },
    {
      target: '[data-tour="biblioteca-button"]',
      content: "Acesse sua biblioteca com todo o conteúdo criado, organize e edite quando precisar.",
      placement: "bottom",
    },
  ]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      // Track completion or skip
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
