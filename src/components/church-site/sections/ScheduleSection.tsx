import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, MessageCircle } from "lucide-react";
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

interface ScheduleSectionProps {
  config: ChurchSiteConfig;
}

export function ScheduleSection({ config }: ScheduleSectionProps) {
  const { schedule, contact } = config;

  if (schedule.length === 0 && !contact.address) return null;

  return (
    <section className="container mx-auto px-4 pb-16 md:pb-24">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
      >
        {schedule.length > 0 && (
          <motion.div variants={fadeIn}>
            <GlassCard glowColor="primary" className="p-6 sm:p-8 h-full">
              <div className="relative z-[10]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg">Horários dos cultos</h3>
                </div>
                <div className="space-y-3">
                  {schedule.map((s, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-border/20 pb-3 last:border-0">
                      <span className="text-foreground font-medium text-sm sm:text-base">{s.day}</span>
                      <span className="text-primary font-semibold text-sm sm:text-base">{s.times.join(" e ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {contact.address && (
          <motion.div variants={fadeIn}>
            <GlassCard glowColor="cyan" className="p-6 sm:p-8 h-full">
              <div className="relative z-[10]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg">Endereço</h3>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">
                  {contact.address}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {contact.mapsUrl && (
                    <Button variant="solid" size="sm" asChild className="min-h-[44px] w-full sm:w-auto">
                      <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer">
                        <MapPin className="w-4 h-4" /> Abrir no mapa
                      </a>
                    </Button>
                  )}
                  {contact.whatsapp && (
                    <Button variant="outline" size="sm" asChild className="min-h-[44px] w-full sm:w-auto">
                      <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-4 h-4" /> WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

export default ScheduleSection;
