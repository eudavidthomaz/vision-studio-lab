import React from "react";
import { motion } from "framer-motion";
import RadialOrbitalTimeline from "@/components/RadialOrbitalTimeline";
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
}

export function AboutSection({ config }: AboutSectionProps) {
  const { about, sectionTitles } = config;
  const titles = sectionTitles?.about;

  // Skip if no description and no values
  if (!about.description && about.values.length === 0) return null;

  // Transform values to timeline format
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
            {titles?.title || "Quem somos"}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {about.description || titles?.subtitle || "Somos uma igreja comprometida com o evangelho de Jesus, com a centralidade da Palavra e com uma vida cristã vivida em comunidade."}
          </p>
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
