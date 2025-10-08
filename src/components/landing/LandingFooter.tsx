import { Instagram, Youtube, MessageCircle } from "lucide-react";

export const LandingFooter = () => {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Main Content */}
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h3 className="font-display text-3xl font-bold text-foreground">
                Ide.On
              </h3>
              <p className="text-muted-foreground font-body max-w-2xl mx-auto">
                Levando o evangelho ao mundo digital, um post de cada vez.
                <br />
                <span className="italic text-sm mt-2 block">
                  "Ide por todo o mundo e pregai o evangelho a toda criatura." — Marcos 16:15
                </span>
              </p>
            </div>

            {/* Social Media */}
            <div className="flex gap-4 justify-center">
              <a
                href="#"
                className="w-12 h-12 rounded-full bg-background hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-12 h-12 rounded-full bg-background hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-12 h-12 rounded-full bg-background hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t text-center space-y-2">
            <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground font-body">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacidade
              </a>
              <span>•</span>
              <a href="#" className="hover:text-foreground transition-colors">
                Termos de Uso
              </a>
              <span>•</span>
              <a href="#" className="hover:text-foreground transition-colors">
                Contato
              </a>
            </div>
            <p className="text-sm text-muted-foreground font-body">
              © 2025 Ide.On. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
