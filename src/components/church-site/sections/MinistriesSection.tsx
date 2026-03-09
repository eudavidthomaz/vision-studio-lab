import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import MinistryGlowCard from "@/components/bio/MinistryGlowCard";
import {
  Baby,
  Users,
  Handshake,
  BookOpen,
  Music,
  Heart,
  Church,
  Star,
  Globe,
  ArrowRight,
} from "lucide-react";
import type { ChurchSiteConfig, ChurchSiteMinistry } from "@/types/churchSite";

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

// Icon mapping for ministries
const ministryIcons: Record<string, React.ElementType> = {
  Baby,
  Users,
  Handshake,
  BookOpen,
  Music,
  Heart,
  Church,
  Star,
  Globe,
};

interface MinistriesSectionProps {
  config: ChurchSiteConfig;
}

export function MinistriesSection({ config }: MinistriesSectionProps) {
  const { ministries, contact } = config;

  if (ministries.length === 0) return null;

  return (
    <section className="container mx-auto px-4 pb-16 md:pb-24">
      <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <motion.div variants={fadeIn} className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
            Há um lugar para você aqui
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            A vida da igreja acontece de muitas formas ao longo da semana.
          </p>
        </motion.div>

        <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {ministries.map((ministry) => {
            const Icon = ministryIcons[ministry.icon] || Heart;
            return (
              <MinistryGlowCard
                key={ministry.id}
                title={ministry.title}
                description={ministry.description}
                icon={<Icon className="w-5 h-5" />}
              />
            );
          })}
        </motion.div>

        {contact.whatsapp && (
          <motion.div variants={fadeIn} className="flex justify-center mt-8">
            <Button variant="outline" asChild className="min-h-[48px]">
              <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">
                Quero saber mais <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

export default MinistriesSection;
