import React from "react";
import { motion } from "framer-motion";
import { ContainerScrollHero } from "@/components/ContainerScrollHero";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MapPin, Clock, Youtube, MessageCircle, ImageIcon } from "lucide-react";
import type { ChurchSiteConfig } from "@/types/churchSite";

interface HeroSectionProps {
  config: ChurchSiteConfig;
}

export function HeroSection({ config }: HeroSectionProps) {
  const { branding, hero, contact, socialLinks, schedule } = config;

  const scheduleText = schedule
    .map((s) => `${s.day} ${s.times.join(" e ")}`)
    .join(" · ");

  return (
    <div className="relative">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.15}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
          "fill-church-primary/20 stroke-church-primary/20"
        )}
      />
      <ContainerScrollHero
        titleComponent={
          <div className="flex flex-col items-center gap-3 sm:gap-4 px-4">
            {/* Church Logo */}
            {branding.logoUrl && (
              <img
                src={branding.logoUrl}
                alt={`Logo ${branding.name}`}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl"
              />
            )}

            <span className="text-xs sm:text-sm text-muted-foreground uppercase tracking-[0.2em] font-medium">
              {hero.welcomeLabel || 'Bem-vindo'}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50 leading-tight text-center">
              {hero.title || branding.name}
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-md text-center leading-relaxed">
              {hero.subtitle || branding.tagline}
            </p>

            {schedule.length > 0 && (
              <div className="flex flex-col items-center gap-1 mt-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-church-primary" />
                  <span>{scheduleText}</span>
                </div>
                {contact.address && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-church-primary" />
                    <span>{contact.address.split(",")[0]}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {hero.showVisitButton && (
                <Button variant="solid" size="sm" className="min-h-[44px]">
                  Quero visitar
                </Button>
              )}
              {hero.showMapButton && contact.mapsUrl && (
                <Button variant="outline" size="sm" asChild className="min-h-[44px]">
                  <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer">
                    <MapPin className="w-4 h-4" /> Como chegar
                  </a>
                </Button>
              )}
              {hero.showYoutubeButton && socialLinks.youtube && (
                <Button variant="outline" size="sm" asChild className="min-h-[44px]">
                  <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                    <Youtube className="w-4 h-4" /> Assistir online
                  </a>
                </Button>
              )}
              {hero.showWhatsappButton && contact.whatsapp && (
                <Button variant="outline" size="sm" asChild className="min-h-[44px]">
                  <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </Button>
              )}
            </div>

            {config.media.youtubeEmbedUrl && (
              <Badge
                variant="outline"
                className="bg-white/10 border-white/10 backdrop-blur-sm text-xs text-muted-foreground px-4 py-1.5 mt-2"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" /> última transmissão
              </Badge>
            )}
          </div>
        }
      >
        {config.media.youtubeEmbedUrl ? (
          <iframe
            src={config.media.youtubeEmbedUrl}
            className="w-full h-full rounded-2xl border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title={`Última transmissão - ${branding.name}`}
          />
        ) : hero.coverImageUrl ? (
          <img
            src={hero.coverImageUrl}
            alt={branding.name}
            className="w-full h-full object-cover rounded-2xl"
          />
        ) : (
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 flex flex-col items-center justify-center gap-3">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
            <span className="text-sm text-muted-foreground/40">Adicione um vídeo ou imagem de capa</span>
          </div>
        )}
      </ContainerScrollHero>
    </div>
  );
}

export default HeroSection;
