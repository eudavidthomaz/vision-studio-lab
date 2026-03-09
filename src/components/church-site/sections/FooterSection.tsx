import React from "react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { StaticGridPattern } from "@/components/ui/static-grid-pattern";
import { cn } from "@/lib/utils";
import { Instagram, Youtube, MessageCircle, MapPin, Facebook } from "lucide-react";
import type { ChurchSiteConfig } from "@/types/churchSite";

interface FooterSectionProps {
  config: ChurchSiteConfig;
  isPreview?: boolean;
}

export function FooterSection({ config, isPreview = false }: FooterSectionProps) {
  const { branding, contact, socialLinks, schedule } = config;

  const scheduleText = schedule
    .map((s) => `${s.day} ${s.times.join(" e ")}`)
    .join(" · ");

  const socialItems = [
    { icon: Instagram, href: socialLinks.instagram, label: "Instagram" },
    { icon: Youtube, href: socialLinks.youtube, label: "YouTube" },
    { icon: Facebook, href: socialLinks.facebook, label: "Facebook" },
    { icon: MessageCircle, href: contact.whatsapp, label: "WhatsApp" },
    { icon: MapPin, href: contact.mapsUrl, label: "Mapa" },
  ].filter(item => item.href);

  return (
    <footer className="relative border-t border-border/30 py-10 md:py-14">
      <AnimatedGridPattern
        numSquares={15}
        maxOpacity={0.06}
        duration={5}
        className={cn(
          "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
          "fill-church-primary/10 stroke-church-primary/10"
        )}
      />
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 max-w-4xl mx-auto">
          <div className="text-center md:text-left flex flex-col items-center md:items-start gap-2">
            {/* Church Logo + Name */}
            <div className="flex items-center gap-3">
              {branding.logoUrl && (
                <img
                  src={branding.logoUrl}
                  alt={`Logo ${branding.name}`}
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-lg"
                />
              )}
              <h3 className="font-bold text-foreground text-base sm:text-lg">{branding.name}</h3>
            </div>
            {contact.address && (
              <p className="text-muted-foreground text-xs sm:text-sm">{contact.address}</p>
            )}
            {scheduleText && (
              <p className="text-muted-foreground text-xs sm:text-sm">{scheduleText}</p>
            )}
          </div>
          
          {socialItems.length > 0 && (
            <div className="flex items-center gap-3">
              {socialItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="p-2.5 rounded-full border border-border/30 hover:border-church-primary/30 hover:bg-church-primary/5 transition-colors"
                >
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="text-center mt-8">
          <p className="text-muted-foreground/50 text-[10px] sm:text-xs">
            © {new Date().getFullYear()} {branding.name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default FooterSection;
