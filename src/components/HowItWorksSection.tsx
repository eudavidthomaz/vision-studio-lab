import React from "react";
import { motion } from "framer-motion";
import { CardStack, type CardStackItem } from "@/components/ui/card-stack";
import { useIsMobile } from "@/hooks/use-mobile";
import stepAudio from "@/assets/step-1-audio.jpg";
import stepPack from "@/assets/step-2-pack.jpg";
import stepPlanner from "@/assets/step-3-planner.jpg";

const howItWorksCards: CardStackItem[] = [
  {
    id: "step-1",
    tag: "PASSO 1",
    title: "Envie sua pregação",
    description:
      "Grave ao vivo ou faça upload do áudio. A IA transcreve e mapeia versículos, temas e aplicações automaticamente.",
    imageSrc: stepAudio,
  },
  {
    id: "step-2",
    tag: "PASSO 2",
    title: "Receba o pack completo",
    description:
      "Em minutos: posts, stories, carrosséis, roteiros de vídeo, estudo bíblico e mais — tudo fiel à Palavra.",
    imageSrc: stepPack,
  },
  {
    id: "step-3",
    tag: "PASSO 3",
    title: "Organize e publique",
    description:
      "Ajuste o tom, escolha os dias e exporte. Sua equipe de mídia começa a semana pronta.",
    imageSrc: stepPlanner,
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
  },
};

const HowItWorksSection = () => {
  const isMobile = useIsMobile();
  return (
    <motion.section
      id="como-funciona"
      className="container mx-auto px-4 py-16 md:py-24"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-gunterz uppercase text-foreground text-center mb-4">
          Como Funciona?
        </h2>
        <p className="text-muted-foreground text-center mb-10 md:mb-16 text-base md:text-lg">
          3 passos simples para transformar sua pregação em conteúdo estratégico
        </p>

        <CardStack
          items={howItWorksCards}
          cardWidth={isMobile ? 300 : 560}
          cardHeight={isMobile ? 200 : 340}
          overlap={isMobile ? 0.5 : 0.45}
          spreadDeg={isMobile ? 20 : 40}
          depthPx={isMobile ? 60 : 120}
          tiltXDeg={isMobile ? 6 : 10}
          activeLiftPx={isMobile ? 10 : 18}
          activeScale={1.02}
          inactiveScale={0.92}
          autoAdvance
          intervalMs={4000}
          pauseOnHover
          loop
          maxVisible={3}
          showDots
        />
      </div>
    </motion.section>
  );
};

export default HowItWorksSection;
