import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Mic, Sparkles, Calendar, Zap, Clock, Target, CheckCircle2, ArrowRight, Play } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Mic,
      title: "Transcrição Automática",
      description: "Grave ou faça upload de suas pregações. Nossa IA transcreve tudo automaticamente."
    },
    {
      icon: Sparkles,
      title: "Conteúdo Profissional",
      description: "Geração de posts, stories, reels e carrosséis otimizados para engajamento."
    },
    {
      icon: Calendar,
      title: "Planner Visual",
      description: "Organize e agende todo o seu conteúdo da semana de forma interativa."
    },
    {
      icon: Zap,
      title: "Rápido e Eficiente",
      description: "De uma pregação para 7 dias de conteúdo em apenas alguns minutos."
    },
    {
      icon: Clock,
      title: "Economize Tempo",
      description: "Reduza horas de trabalho manual para criar conteúdo de qualidade."
    },
    {
      icon: Target,
      title: "Estratégico",
      description: "Conteúdo baseado em 5 pilares estratégicos para crescimento."
    }
  ];

  const benefits = [
    "Posts completos para Instagram e Facebook",
    "Stories interativos com enquetes e perguntas",
    "Roteiros de Reels e Shorts prontos",
    "Carrosséis educativos sobre os temas",
    "Hashtags e CTAs otimizados",
    "Desafios Ide.On para engajamento",
    "Sugestões de dias e horários ideais",
    "Exportação em PDF ou imagem"
  ];

  const testimonials = [
    {
      name: "Pastor João Silva",
      role: "Igreja Batista Central",
      content: "O Ide.On transformou completamente nossa estratégia de redes sociais. Antes levávamos horas criando conteúdo, agora em minutos temos uma semana inteira pronta!",
      image: "👨‍💼"
    },
    {
      name: "Pastora Maria Santos",
      role: "Comunidade Evangélica",
      content: "Incrível como a IA entende o contexto das pregações e cria conteúdo relevante. Nosso engajamento triplicou em 2 meses!",
      image: "👩‍💼"
    },
    {
      name: "Líder de Mídia - Pedro Costa",
      role: "Igreja Assembly of God",
      content: "Ferramenta indispensável para qualquer igreja que quer crescer nas redes sociais. O planner visual é simplesmente perfeito!",
      image: "🎯"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Ide.On</h1>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/auth")}
              className="text-white"
            >
              Entrar
            </Button>
            <Button 
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90"
            >
              Começar Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center animate-fade-in">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
            <span className="text-primary text-sm font-semibold">🚀 Fase de Validação - Uso 100% Gratuito</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-scale-in">
            Transforme Suas Pregações<br />
            Em <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
              Semanas de Conteúdo
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            A primeira plataforma de IA que converte seus sermões em conteúdo profissional para redes sociais em minutos
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 group"
            >
              Começar Agora Grátis
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-lg px-8 py-6"
            >
              <Play className="mr-2" />
              Ver Como Funciona
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Setup em 2 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Uso ilimitado</span>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="container mx-auto px-4 py-20 bg-card/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Como Funciona?
          </h2>
          <p className="text-muted-foreground text-center mb-12 text-lg">
            Transforme sua pregação em uma semana completa de conteúdo em 3 passos simples
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card/50 backdrop-blur border-border/50 relative overflow-hidden group hover:border-primary/50 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <CardContent className="pt-8 relative z-10">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Mic className="w-8 h-8 text-primary" />
                </div>
                <div className="text-primary font-bold text-sm mb-2">PASSO 1</div>
                <h3 className="text-xl font-bold text-white mb-3">Grave ou Faça Upload</h3>
                <p className="text-muted-foreground">
                  Grave sua pregação diretamente no Ide.On ou faça upload de um arquivo de áudio. Nossa IA transcreve automaticamente.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50 relative overflow-hidden group hover:border-primary/50 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <CardContent className="pt-8 relative z-10">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <div className="text-primary font-bold text-sm mb-2">PASSO 2</div>
                <h3 className="text-xl font-bold text-white mb-3">IA Gera Conteúdo</h3>
                <p className="text-muted-foreground">
                  Em minutos, receba posts, stories, reels, carrosséis e desafios personalizados baseados na sua pregação.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50 relative overflow-hidden group hover:border-primary/50 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <CardContent className="pt-8 relative z-10">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <div className="text-primary font-bold text-sm mb-2">PASSO 3</div>
                <h3 className="text-xl font-bold text-white mb-3">Organize e Publique</h3>
                <p className="text-muted-foreground">
                  Use o planner visual para organizar, editar e agendar suas publicações. Exporte tudo em PDF ou imagem.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Tudo o Que Você Precisa
          </h2>
          <p className="text-muted-foreground text-center mb-12 text-lg">
            Uma plataforma completa para gestão de conteúdo ministerial
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card/30 backdrop-blur border-border/50 hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <feature.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* O Que Você Recebe */}
      <section className="container mx-auto px-4 py-20 bg-card/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            O Que Você Recebe
          </h2>
          <p className="text-muted-foreground text-center mb-12 text-lg">
            Cada pregação gera um pacote completo de conteúdo
          </p>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-8">
              <div className="grid md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-white">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            O Que Dizem Nossos Usuários
          </h2>
          <p className="text-muted-foreground text-center mb-12 text-lg">
            Igrejas e ministérios que já transformaram sua presença digital
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card/30 backdrop-blur border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-2xl">
                      {testimonial.image}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{testimonial.name}</p>
                      <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/20 to-cyan-400/20 backdrop-blur border-primary/50">
            <CardContent className="pt-12 pb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Pronto Para Transformar Suas Pregações?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Junte-se a centenas de igrejas que já estão criando conteúdo profissional em minutos
              </p>
              <Button 
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-lg px-12 py-6 bg-primary hover:bg-primary/90 group"
              >
                Começar Agora Grátis
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Sem cartão de crédito • Setup em 2 minutos • Uso ilimitado durante validação
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Ide.On</h3>
              <p className="text-muted-foreground text-sm">
                Transformando pregações em conteúdo poderoso
              </p>
            </div>
            <div className="text-muted-foreground text-sm text-center md:text-right">
              <p>© 2025 Ide.On. Todos os direitos reservados.</p>
              <p className="mt-1">Feito com ❤️ para igrejas e ministérios</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
