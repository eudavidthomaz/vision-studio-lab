import { Globe, Layers, CalendarDays, CheckCircle2 } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useChurchSite } from "@/hooks/useChurchSite";
import { GlassCard } from "@/components/ui/glass-card";

interface ChurchSiteCreatorCardProps {
  onClick: () => void;
}

export const ChurchSiteCreatorCard = ({ onClick }: ChurchSiteCreatorCardProps) => {
  const { site, isLoading } = useChurchSite();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  const hasStats = !isLoading && site;
  const ministriesCount = site?.ministries?.length ?? 0;
  const eventsCount = site?.events?.length ?? 0;

  return (
    <div ref={ref}>
      <GlassCard glowColor="cyan" as="button" onClick={onClick} className="w-full text-left">
        <div className="p-4 sm:p-5 md:p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-[hsl(188_95%_50%/0.12)]">
              <Globe className="w-6 h-6 text-[hsl(188_95%_50%)]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base sm:text-lg text-foreground">
                Site da Igreja
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                Crie e publique um site profissional para sua comunidade. Editável, responsivo e pronto para compartilhar.
              </p>
            </div>
          </div>

          {hasStats && inView && (
            <div className="mt-4 flex flex-wrap gap-3 sm:gap-4">
              <div
                className="flex items-center gap-1.5 text-xs text-muted-foreground animate-fade-in"
                style={{ animationDelay: "0ms", animationFillMode: "both" }}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${site.isPublished ? "text-emerald-400" : "text-[hsl(188_95%_50%)]"}`} />
                <span>{site.isPublished ? "Publicado" : "Rascunho"}</span>
              </div>
              {ministriesCount > 0 && (
                <div
                  className="flex items-center gap-1.5 text-xs text-muted-foreground animate-fade-in"
                  style={{ animationDelay: "100ms", animationFillMode: "both" }}
                >
                  <Layers className="w-3.5 h-3.5 text-[hsl(188_95%_50%)]" />
                  <span>{ministriesCount} ministério{ministriesCount !== 1 ? "s" : ""}</span>
                </div>
              )}
              {eventsCount > 0 && (
                <div
                  className="flex items-center gap-1.5 text-xs text-muted-foreground animate-fade-in"
                  style={{ animationDelay: "200ms", animationFillMode: "both" }}
                >
                  <CalendarDays className="w-3.5 h-3.5 text-[hsl(188_95%_50%)]" />
                  <span>{eventsCount} evento{eventsCount !== 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
