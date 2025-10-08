import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { Mic, Sparkles, Calendar, Zap, Target, CheckCircle2, ArrowRight, Play, BookOpen, Users, Layout, BookMarked } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: "Teologia Sólida, Linguagem Viva",
      description: "Nada de \"IA sem noção\". O conteúdo nasce com referências bíblicas claras e aplicações que respeitam a ortodoxia."
    },
    {
      icon: Users,
      title: "Feito para Equipes de Mídia",
      description: "Roteiros, carrosséis e legends prontos para design e edição. Menos retrabalho, mais consistência."
    },
    {
      icon: Zap,
      title: "Rápido de Verdade",
      description: "De uma pregação para 7 dias de conteúdo em minutos."
    },
    {
      icon: Layout,
      title: "Planner Visual",
      description: "Arraste e solte, ajuste o tom (pastoral, jovem, institucional, evangelístico) e publique com ritmo."
    },
    {
      icon: Target,
      title: "Foco em Crescimento",
      description: "Conteúdos alinhados aos 5 pilares: Edificar, Alcançar, Conectar, Servir e Anunciar."
    },
    {
      icon: BookMarked,
      title: "Biblioteca Inteligente",
      description: "Tudo salvo, pesquisável por tema/verso/série e pronto para reaproveitar."
    }
  ];

  const benefits = [
    "Posts completos para Instagram e Facebook",
    "Stories interativos (enquetes, perguntas, caixinhas)",
    "Roteiros de Reels/Shorts com ganchos e CTAs",
    "Carrosséis educativos com estrutura de slide pronta",
    "Legendas com variações de tom (jovem, pastoral, institucional)",
    "Frases de impacto e clips destacados da mensagem",
    "Hashtags e CTAs otimizados",
    "Sugestões de dias e horários para postar",
    "Estudo bíblico + contexto histórico + aplicação",
    "Exportação em PDF/Imagem (pronto pra enviar no grupo da equipe)"
  ];

  const testimonials = [
    {
      name: "Pr. João",
      role: "Igreja Batista Central",
      content: "O Ide.On nos deu constância. Em minutos temos uma semana pronta — e fiel ao que pregamos.",
      image: "👨‍💼"
    },
    {
      name: "Pastora Maria",
      role: "Comunidade Evangélica",
      content: "A IA entende o coração da mensagem e traduz para a linguagem da internet. Nosso engajamento triplicou.",
      image: "👩‍💼"
    },
    {
      name: "Pedro",
      role: "Líder de Mídia",
      content: "Ferramenta indispensável para quem lidera mídia. O planner acabou com as nossas madrugadas de domingo.",
      image: "👨‍💻"
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
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="max-w-5xl mx-auto text-center animate-fade-in">
          <div className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 border border-primary/20 rounded-full">
            <span className="text-primary text-xs sm:text-sm font-semibold">Beta Aberto · Uso 100% Gratuito</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 animate-scale-in">
            Do Altar à Timeline:<br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
              sua pregação vira uma semana de conteúdo.
            </span>
          </h1>
          {/* Headline alternativa para A/B test:
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 animate-scale-in">
            Prega no domingo.<br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
              Posta a semana inteira. Sem sofrimento.
            </span>
          </h1>
          */}
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
            O Ide.On usa IA com base bíblica validada para transformar a mensagem do culto em posts, carrosséis, reels e legends que falam a língua da internet — sem perder a fidelidade ao Evangelho.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-sm sm:text-base lg:text-lg px-6 py-4 sm:px-8 sm:py-6 bg-primary hover:bg-primary/90 group"
            >
              Começar Grátis
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm sm:text-base lg:text-lg px-6 py-4 sm:px-8 sm:py-6"
            >
              <Play className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              Ver como funciona
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col xs:flex-row flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-muted-foreground px-4">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <span>Setup em 2 minutos</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <span>Uso liberado no Beta</span>
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
                <h3 className="text-xl font-bold text-white mb-3">Grave ou Envie o Áudio</h3>
                <p className="text-muted-foreground">
                  Grave ao vivo no Ide.On ou faça upload do arquivo. A IA transcreve e identifica versículos, temas, ênfases e chamadas da sua pregação.
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
                <h3 className="text-xl font-bold text-white mb-3">Gere o Pack da Semana</h3>
                <p className="text-muted-foreground">
                  Em minutos, você recebe estudo bíblico, resumo, frases de impacto, carrossel, roteiros de reels/shorts, legendas e hashtags — tudo coerente com a doutrina cristã histórica.
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
                  Use o planner visual para ajustar o tom, escolher os dias e exportar em PDF/Imagem ou direto para seus fluxos (Canva/CapCut/agenda de posts).
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
            Por que o Ide.On?
          </h2>
          <p className="text-muted-foreground text-center mb-12 text-lg">
            Tecnologia com propósito e teologia sólida
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card/30 backdrop-blur border-border/50 hover:border-primary/50 transition-all">
                <CardContent className="pt-4 sm:pt-6">
                  <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">{feature.description}</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card/30 backdrop-blur border-border/50">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                      {testimonial.image}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm sm:text-base truncate">{testimonial.name}</p>
                      <p className="text-muted-foreground text-xs sm:text-sm truncate">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm italic">"{testimonial.content}"</p>
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
                Pronto para transformar suas pregações em impacto digital?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Domingo você prega. Na segunda a mídia já tem tudo pronto.
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
                Sem cartão • Setup em 2 minutos • Beta com uso liberado
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20 bg-card/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-muted-foreground text-center mb-12 text-lg">
            Respostas rápidas sobre como o Ide.On funciona
          </p>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem 
              value="item-1"
              className="bg-card/50 backdrop-blur border border-border/50 rounded-lg px-6"
            >
              <AccordionTrigger className="text-left font-semibold text-white hover:text-primary">
                A IA inventa versículos?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Não. O Ide.On exige referência e exibe a versão bíblica usada. Você revisa antes de publicar.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="item-2"
              className="bg-card/50 backdrop-blur border border-border/50 rounded-lg px-6"
            >
              <AccordionTrigger className="text-left font-semibold text-white hover:text-primary">
                Funciona sem gravar ao vivo?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Sim. É só fazer upload do áudio que já tem.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="item-3"
              className="bg-card/50 backdrop-blur border border-border/50 rounded-lg px-6"
            >
              <AccordionTrigger className="text-left font-semibold text-white hover:text-primary">
                Posso definir o estilo teológico?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Sim. Presets de tom e guard-rails doutrinários para manter fidelidade.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="item-4"
              className="bg-card/50 backdrop-blur border border-border/50 rounded-lg px-6"
            >
              <AccordionTrigger className="text-left font-semibold text-white hover:text-primary">
                Quanto custa no Beta?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Grátis durante a validação. Depois, planos acessíveis para igrejas de todos os tamanhos.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
