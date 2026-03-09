import React from "react";
import { motion } from "framer-motion";
import RadialOrbitalTimeline from "@/components/RadialOrbitalTimeline";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  Heart,
  Sparkles,
  Star,
  Globe,
  Users,
  Flame,
  Church,
  Music,
  HandHeart,
} from "lucide-react";
import type { ChurchSiteConfig, ChurchSiteValue } from "@/types/churchSite";

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

// Icon mapping for values
const valueIcons: Record<string, React.ElementType> = {
  BookOpen,
  Heart,
  Sparkles,
  Star,
  Globe,
  Users,
  Flame,
  Church,
  Music,
  HandHeart,
  Cross: Church,
};

interface AboutSectionProps {
  config: ChurchSiteConfig;
  isPreview?: boolean;
}

export function AboutSection({ config, isPreview = false }: AboutSectionProps) {
  const { about, sectionTitles } = config;
  const titles = sectionTitles?.about;

  if (!about.description && about.values.length === 0) return null;

  const timelineData = about.values.map((value, index) => ({
    id: index + 1,
    icon: valueIcons[value.icon] || Heart,
    title: value.title,
    content: value.content,
  }));

  const motionProps = isPreview
    ? { initial: false as const }
    : { initial: "hidden" as const, whileInView: "visible" as const, viewport: { once: true } };

  return (
    <section className="container mx-auto px-4 py-12 md:py-20">
      <motion.div variants={stagger} {...motionProps}>
        <motion.div variants={isPreview ? undefined : fadeIn} className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
            {titles?.title || "Quem somos"}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {titles?.subtitle || "Somos uma igreja comprometida com o evangelho de Jesus, com a centralidade da Palavra e com uma vida cristã vivida em comunidade."}
          </p>
          {about.description && (
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mt-3">
              {about.description}
            </p>
          )}
        </motion.div>

        {timelineData.length > 0 && (
          <motion.div variants={isPreview ? undefined : fadeIn} className="max-w-3xl mx-auto">
            {isPreview ? (
              // Static list for preview — no RadialOrbitalTimeline animation overhead
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {timelineData.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card key={item.id} className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-church-primary/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-church-primary" />
                        </div>
                        <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.content}</p>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <RadialOrbitalTimeline timelineData={timelineData} />
            )}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

export default AboutSection;
