import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Video, Youtube } from "lucide-react";
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

interface MediaSectionProps {
  config: ChurchSiteConfig;
  isPreview?: boolean;
}

export function MediaSection({ config, isPreview = false }: MediaSectionProps) {
  const { media, socialLinks, branding, sectionTitles } = config;
  const titles = sectionTitles?.media;

  if (!media.youtubeEmbedUrl && !socialLinks.youtube) return null;

  const motionProps = isPreview
    ? { initial: false as const }
    : { initial: "hidden" as const, whileInView: "visible" as const, viewport: { once: true } };

  return (
    <section className="container mx-auto px-4 py-12 md:py-20">
      <motion.div variants={stagger} {...motionProps}>
        <motion.div variants={isPreview ? undefined : fadeIn} className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
            {titles?.title || "Assista e conheça mais"}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {titles?.subtitle || "Acompanhe nossas mensagens, cultos e conteúdos para conhecer melhor a visão da igreja."}
          </p>
        </motion.div>

        {media.youtubeEmbedUrl && (
          <motion.div variants={isPreview ? undefined : fadeIn} className="max-w-3xl mx-auto">
            <Card className="overflow-hidden">
              <div className="aspect-video">
                <iframe
                  src={media.youtubeEmbedUrl}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  title={`Mensagens - ${branding.name}`}
                />
              </div>
            </Card>
          </motion.div>
        )}

        {socialLinks.youtube && (
          <motion.div variants={isPreview ? undefined : fadeIn} className="flex flex-wrap justify-center gap-3 mt-8">
            <Button variant="solid" size="sm" asChild className="min-h-[44px]">
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                <Play className="w-4 h-4" /> Assistir ao vivo
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild className="min-h-[44px]">
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                <Video className="w-4 h-4" /> Ver mensagens
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild className="min-h-[44px]">
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                <Youtube className="w-4 h-4" /> YouTube
              </a>
            </Button>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

export default MediaSection;
