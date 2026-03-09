import React from "react";
import { motion } from "framer-motion";
import RadialOrbitalTimeline from "@/components/RadialOrbitalTimeline";
import { BookOpen, Heart, Sparkles, Users, Star, Globe } from "lucide-react";
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
  Users,
  Star,
  Globe,
};

interface AboutSectionProps {
  config: ChurchSiteConfig;
}

export function AboutSection({ config }: AboutSectionProps) {
  const { about } = config;

  if (!about.description && about.values.length === 0) return null;

  // Transform values for RadialOrbitalTimeline
  const timelineData = about.values.map((value, index) => ({
    id: index + 1,
    icon: valueIcons[value.icon] || Heart,
    title: value.title,
    content: value.content,
  }));

  return (
    <section className="container mx-auto px-4 py-12 md:py-20">
      <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <motion.div variants={fadeIn} className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
            Quem somos
          </h2>
          {about.description && (
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              {about.description}
            </p>
          )}
        </motion.div>

        {timelineData.length > 0 && (
          <motion.div variants={fadeIn} className="max-w-3xl mx-auto">
            <RadialOrbitalTimeline timelineData={timelineData} />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

export default AboutSection;
