import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { SparklesCore } from "@/components/ui/sparkles";
import { HandHeart, Heart } from "lucide-react";
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

interface PrayerSectionProps {
  config: ChurchSiteConfig;
}

export function PrayerSection({ config }: PrayerSectionProps) {
  const { contact, sectionTitles } = config;
  const titles = sectionTitles?.prayer;

  if (!contact.whatsapp) return null;

  const subtitle = titles?.subtitle || "Você não precisa caminhar sozinho. Envie seu pedido de oração. Nossa equipe terá alegria em interceder pela sua vida.";

  return (
    <section className="container mx-auto px-4 py-12 md:py-20">
      <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <motion.div variants={fadeIn} className="max-w-2xl mx-auto">
          <GlassCard glowColor="cyan" className="p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 z-[4] pointer-events-none">
              <SparklesCore
                background="transparent"
                minSize={0.4}
                maxSize={1.2}
                particleDensity={25}
                particleColor="#06b6d4"
                speed={1.5}
                className="w-full h-full"
              />
            </div>
            <div className="relative z-[10]">
              <div className="flex justify-center mb-5">
                <div className="p-3 rounded-xl bg-church-primary/10">
                  <HandHeart className="w-7 h-7 text-church-primary" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                {titles?.title || "Podemos orar por você?"}
              </h2>
              {firstPart && (
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-2">
                  {firstPart}
                </p>
              )}
              {secondPart && (
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8">
                  {secondPart}
                </p>
              )}
              {!secondPart && firstPart && <div className="mb-8" />}
              <Button variant="solid" asChild className="min-h-[48px]">
                <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">
                  <Heart className="w-4 h-4" /> Enviar pedido de oração
                </a>
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default PrayerSection;
