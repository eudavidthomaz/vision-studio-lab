import { Button } from "@/components/ui/button";
import { Library } from "lucide-react";
import { RateLimitIndicator } from "@/components/RateLimitIndicator";
import { QuotaIndicator } from "@/components/QuotaIndicator";

interface HeroHeaderProps {
  onNavigateToContent: () => void;
  onLogout: () => void;
}

export const HeroHeader = ({ onNavigateToContent, onLogout }: HeroHeaderProps) => {
  return (
    <header className="relative overflow-hidden mb-12 sm:mb-16">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background rounded-3xl blur-3xl -z-10" />
      
      <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8 lg:p-12">
        {/* Top Bar - Logo and Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg sm:text-xl">I.O</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-[gradient_8s_ease_infinite] bg-[length:200%_auto]">
              Ide.On
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <RateLimitIndicator />
            <QuotaIndicator />
            
            <Button
              variant="outline"
              onClick={onNavigateToContent}
              className="gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all"
              data-tour="conteudos-button"
            >
              <Library className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Meus Conteúdos</span>
              <span className="xs:hidden">✨</span>
            </Button>

            <Button
              variant="outline"
              onClick={onLogout}
              className="gap-2 hover:bg-destructive/10 hover:border-destructive/50 transition-all"
            >
              <span className="hidden xs:inline">Sair</span>
              <span className="xs:hidden">👤</span>
            </Button>
          </div>
        </div>

        {/* Hero Message */}
        <div className="text-center space-y-4 animate-fade-in animation-delay-200">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
            <span className="inline-block animate-fade-in bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_6s_ease_infinite]">
              Ide por todo o mundo,
            </span>
            <br />
            <span className="inline-block animate-fade-in animation-delay-300 bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_8s_ease_infinite]">
              inclusive no digital
            </span>
            {" "}
            <span className="inline-block animate-pulse text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
              ❤️‍🔥
            </span>
          </h2>
          
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in animation-delay-500">
            Transforme suas mensagens em conteúdo digital que alcança multidões
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -z-10 animate-pulse animation-delay-1000" />
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        
        .animation-delay-500 {
          animation-delay: 500ms;
        }
        
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </header>
  );
};
