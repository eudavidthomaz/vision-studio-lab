import { ContainerScrollHero } from "@/components/ContainerScrollHero";
import { Badge } from "@/components/ui/badge";

const Bio = () => {
  return (
    <div className="min-h-screen bg-background">
      <ContainerScrollHero
        titleComponent={
          <div className="flex flex-col items-center gap-4">
            <span className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
              Bem-vindo
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50 leading-tight">
              Igreja Presbiteriana
              <br />
              Bethaville
            </h1>
            <Badge
              variant="outline"
              className="bg-white/10 border-white/10 backdrop-blur-sm text-xs text-muted-foreground px-4 py-1.5"
            >
              🔴 última transmissão
            </Badge>
          </div>
        }
      >
        <iframe
          src="https://www.youtube-nocookie.com/embed/ed8EzWU056M"
          className="w-full h-full rounded-2xl border-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Última transmissão - Igreja Presbiteriana Bethaville"
        />
      </ContainerScrollHero>
    </div>
  );
};

export default Bio;
