import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { MessageCircle } from "lucide-react";
import type { ChurchSiteConfig } from "@/types/churchSite";

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

interface FirstTimeSectionProps {
  config: ChurchSiteConfig;
  isPreview?: boolean;
}

export function FirstTimeSection({ config, isPreview = false }: FirstTimeSectionProps) {
  const { faq, contact, sectionTitles } = config;
  const titles = sectionTitles?.firstTime;

  if (faq.length === 0) return null;

  const motionProps = isPreview
    ? { initial: false as const }
    : { initial: "hidden" as const, whileInView: "visible" as const, viewport: { once: true } };

  return (
    <section className="container mx-auto px-4 py-12 md:py-20">
      <motion.div variants={stagger} {...motionProps}>
        <motion.div variants={isPreview ? undefined : fadeIn} className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
            {titles?.title || "É sua primeira vez por aqui?"}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {titles?.subtitle || "Queremos tornar sua visita leve, simples e acolhedora. Aqui você encontra uma comunidade que ama a Deus, ama pessoas e deseja caminhar com você."}
          </p>
        </motion.div>

        <motion.div variants={isPreview ? undefined : fadeIn} className="max-w-2xl mx-auto">
          <GlassCard className="p-6 sm:p-8" isStatic={isPreview}>
            <Accordion type="single" collapsible className="w-full">
              {faq.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-border/20">
                  <AccordionTrigger className="text-sm sm:text-base text-foreground hover:text-church-primary hover:no-underline py-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </GlassCard>
        </motion.div>

        {contact.whatsapp && (
          <motion.div variants={isPreview ? undefined : fadeIn} className="flex justify-center mt-8">
            <Button variant="solid" asChild className="min-h-[48px]">
              <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4" /> Quero planejar minha visita
              </a>
            </Button>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

export default FirstTimeSection;
