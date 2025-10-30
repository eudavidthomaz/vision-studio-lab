import { Button } from "@/components/ui/button";
import { Library, User } from "lucide-react";
interface HeroHeaderProps {
  onNavigateToContent: () => void;
  onNavigateToProfile: () => void;
  onLogout: () => void;
}
export const HeroHeader = ({
  onNavigateToContent,
  onNavigateToProfile,
  onLogout
}: HeroHeaderProps) => {
  return <header className="relative overflow-hidden mb-8 sm:mb-12 lg:mb-16">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background rounded-2xl sm:rounded-3xl blur-3xl -z-10 opacity-80" />
      
      {/* Layer 1 - Navigation Bar */}
      <div className="relative bg-card/90 backdrop-blur-md border border-border/60 rounded-t-xl sm:rounded-t-2xl px-3 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-4 shadow-lg">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-primary via-accent to-primary shadow-[0_0_20px_rgba(124,58,237,0.5)] flex items-center justify-center animate-pulse">
              <span className="text-white font-bold text-xs sm:text-sm md:text-base">I.O</span>
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-[gradient_8s_ease_infinite] bg-[length:200%_auto]">
              Ide.On
            </h1>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onNavigateToProfile} 
              className="gap-1.5 sm:gap-2 hover:bg-primary/10 hover:border-primary/50 hover:scale-105 transition-all duration-300 h-8 sm:h-9 px-2 sm:px-3"
            >
              <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline text-xs sm:text-sm">Perfil</span>
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={onNavigateToContent} 
              className="gap-1.5 sm:gap-2 hover:bg-primary/10 hover:border-primary/50 hover:scale-105 transition-all duration-300 h-8 sm:h-9 px-2 sm:px-3" 
              data-tour="conteudos-button"
            >
              <Library className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline text-xs sm:text-sm">Biblioteca</span>
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogout} 
              className="hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive hover:scale-105 transition-all duration-300 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
            >
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Layer 2 - Hero Message */}
      <div className="relative bg-card/60 backdrop-blur-md border border-t-0 border-border/60 rounded-b-xl sm:rounded-b-2xl px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10 lg:py-16 shadow-xl">
        <div className="text-center space-y-3 sm:space-y-4 animate-fade-in animation-delay-200">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
            <span className="inline-block animate-fade-in bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_6s_ease_infinite]">
              Ide por todo o mundo,
            </span>
            <br />
            <span className="inline-block animate-fade-in animation-delay-300 bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_8s_ease_infinite]">
              inclusive no digital
            </span>
            {" "}
            <span className="inline-block animate-pulse text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
              ❤️‍🔥
            </span>
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in animation-delay-500 leading-relaxed">
            Transforme suas mensagens em conteúdo digital que alcança multidões
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-accent/20 rounded-full blur-3xl -z-10 animate-pulse animation-delay-1000" />
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
    </header>;
};