import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Sparkles, Calendar, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

const Welcome = () => {
  const navigate = useNavigate();
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  useEffect(() => {
    // Check if user has seen welcome before
    const seen = localStorage.getItem("ide-on-welcome-seen");
    if (seen) {
      navigate("/dashboard", { replace: true });
    }
    
    // Launch confetti on mount
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, [navigate]);

  const handleStart = () => {
    localStorage.setItem("ide-on-welcome-seen", "true");
    setHasSeenWelcome(true);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full animate-fade-in">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 animate-scale-in">
            Bem-vindo ao <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Ide.On</span>! 🎉
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transforme suas pregações em conteúdo profissional para redes sociais em apenas 3 passos
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all hover:scale-105">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">1. Grave sua Pregação</h3>
              <p className="text-muted-foreground">
                Use o gravador de áudio ou faça upload de um arquivo existente
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all hover:scale-105">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">2. Gere o Conteúdo</h3>
              <p className="text-muted-foreground">
                Nossa IA cria automaticamente posts, stories, reels e muito mais
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all hover:scale-105">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">3. Organize e Publique</h3>
              <p className="text-muted-foreground">
                Use o planner visual para agendar e publicar seu conteúdo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card className="bg-card/50 backdrop-blur border-border/50 mb-8">
          <CardContent className="pt-6">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">O que você vai receber:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary text-xs">✓</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Posts para Feed</p>
                  <p className="text-muted-foreground text-sm">Legendas completas com hashtags e CTAs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary text-xs">✓</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Stories Interativos</p>
                  <p className="text-muted-foreground text-sm">Enquetes, caixas de perguntas e mensagens</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary text-xs">✓</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Reels e Shorts</p>
                  <p className="text-muted-foreground text-sm">Roteiros detalhados com hooks e CTAs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary text-xs">✓</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Desafios Ide.On</p>
                  <p className="text-muted-foreground text-sm">Engajamento e crescimento da comunidade</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button 
            onClick={handleStart}
            size="lg"
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 group"
          >
            Começar Agora
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
