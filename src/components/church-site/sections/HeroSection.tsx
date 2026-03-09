import React from "react";
import { ContainerScrollHero } from "@/components/ContainerScrollHero";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { StaticGridPattern } from "@/components/ui/static-grid-pattern";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MapPin, Clock, Youtube, MessageCircle, ImageIcon } from "lucide-react";
import type { ChurchSiteConfig } from "@/types/churchSite";

interface HeroSectionProps {
  config: ChurchSiteConfig;
  isPreview?: boolean;
}

export function HeroSection({ config, isPreview = false }: HeroSectionProps) {
  const { branding, hero, contact, socialLinks, schedule } = config;

  const scheduleText = schedule
    .map((s) => `${s.day} ${s.times.join(" e ")}`)
    .join(" · ");

  const gridClassName = cn(
    "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
    "fill-church-primary/20 stroke-church-primary/20"
  );

  // Shared title content — identical in both modes
  const titleContent = (
    <div className="flex flex-col items-center gap-3 sm:gap-4 px-4">
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
        {hero.subtitle}
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
          contact.whatsapp ? (
            <Button variant="solid" size="sm" asChild className="min-h-[44px]">
              <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">
                Quero visitar
              </a>
            </Button>
          ) : (
            <Button
              variant="solid"
              size="sm"
              className="min-h-[44px]"
              onClick={() => {
                document.getElementById('church-contact-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Quero visitar
            </Button>
          )
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
  );

  // Shared media content — identical in both modes
  const mediaContent = config.media.youtubeEmbedUrl ? (
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
  );

  // Preview mode: static layout faithfully replicating ContainerScrollHero visual
  if (isPreview) {
    return (
      <div className="relative">
        <StaticGridPattern
          numSquares={30}
          maxOpacity={0.15}
          className={gridClassName}
        />
        <div className="py-16 md:py-24 flex items-center justify-center relative p-2 md:p-20">
          <div className="w-full relative" style={{ perspective: "1000px" }}>
            {/* Title — same wrapper as ContainerScrollHero Header */}
            <div className="max-w-5xl mx-auto text-center">
              {titleContent}
            </div>
            {/* Card — exact same classes as ContainerScrollHero Card */}
            <div
              className="max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-border/30 p-2 md:p-6 bg-card rounded-[30px] shadow-2xl"
              style={{
                boxShadow:
                  "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
              }}
            >
              <div className="h-full w-full overflow-hidden rounded-2xl bg-background md:rounded-2xl md:p-4">
                {mediaContent}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Public mode: full ContainerScrollHero with animations
  return (
    <div className="relative">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.15}
        duration={3}
        repeatDelay={1}
        className={gridClassName}
      />
      <ContainerScrollHero titleComponent={titleContent}>
        {mediaContent}
      </ContainerScrollHero>
    </div>
  );
}

export default HeroSection;
