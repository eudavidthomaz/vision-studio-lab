import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ChurchSiteConfig, ChurchSiteEvent } from "@/types/churchSite";

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

interface EventsSectionProps {
  config: ChurchSiteConfig;
  isPreview?: boolean;
}

function formatEventDate(dateStr: string): { day: string; month: string } {
  try {
    const date = parseISO(dateStr);
    return {
      day: format(date, "d", { locale: ptBR }),
      month: format(date, "MMM", { locale: ptBR }).replace(".", ""),
    };
  } catch {
    return { day: dateStr.split("-")[2] || "?", month: "???" };
  }
}

export function EventsSection({ config, isPreview = false }: EventsSectionProps) {
  const { events, sectionTitles } = config;
  const titles = sectionTitles?.events;

  if (events.length === 0) return null;

  const motionProps = isPreview
    ? { initial: false as const }
    : { initial: "hidden" as const, whileInView: "visible" as const, viewport: { once: true } };

  return (
    <section className="container mx-auto px-4 pb-16 md:pb-24">
      <motion.div variants={stagger} {...motionProps}>
        <motion.div variants={fadeIn} className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
            {titles?.title || "Próximos encontros"}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {titles?.subtitle || "Fique por dentro dos próximos cultos e eventos especiais."}
          </p>
        </motion.div>

        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible max-w-5xl mx-auto">
          {events.map((event, i) => {
            const { day, month } = formatEventDate(event.date);
            return (
              <motion.div
                key={event.id || i}
                variants={fadeIn}
                className="snap-center flex-shrink-0 w-[260px] sm:w-[280px] md:w-auto"
              >
                <Card className="p-5 sm:p-6 h-full">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-church-primary/10 shrink-0">
                        <span className="text-church-primary font-bold text-base leading-none">
                          {day}
                        </span>
                        <span className="text-church-primary/70 text-[10px] uppercase">
                          {month}
                        </span>
                      </div>
                      {event.tag && (
                        <Badge variant="outline" className="text-[10px]">{event.tag}</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">{event.title}</h3>
                    {event.time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground text-xs">{event.time}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

export default EventsSection;
