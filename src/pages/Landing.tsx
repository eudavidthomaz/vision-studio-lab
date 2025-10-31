import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      {/* Header - CTA único */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Ide.On</h1>
          <Button 
            onClick={() => navigate("/auth")}
            className="bg-primary hover:bg-primary/90"
          >
            Começar Grátis
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="max-w-5xl mx-auto text-center animate-fade-in">
          <div className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 border border-primary/20 rounded-full">
            <span className="text-primary text-xs sm:text-sm font-semibold">Beta Aberto · Uso 100% Gratuito</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 animate-scale-in leading-tight">
            A câmera desliga.
          </h1>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 animate-scale-in leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
              A missão continua.
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-3xl mx-auto px-2">
            Do altar ao feed: o Ide.On transforma sua pregação em uma semana de conteúdo. 
            Carrosséis, roteiros de reels e legendas, tudo com fundamento bíblico, 
            citações visíveis e linguagem que fala com a cidade.
          </p>

          {/* Vídeo Trailer - YouTube Embed */}
          <div className="w-full max-w-4xl mx-auto px-4 mb-8 sm:mb-10 animate-fade-in">
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <iframe
                src="https://www.youtube.com/embed/SGRIma5ElbY?rel=0&modestbranding=1"
                title="Ide.On - Do Altar ao Feed"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                loading="lazy"
              />
            </div>
          </div>

          {/* CTA Único */}
          <div className="flex justify-center mb-12 sm:mb-16 px-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-base sm:text-lg lg:text-xl px-8 py-5 sm:px-12 sm:py-7 bg-primary hover:bg-primary/90 group w-full sm:w-auto"
            >
              Começar Grátis
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>

          {/* Social Proof - Inline mobile */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground px-4">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              Mais Bíblia no feed
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              Posts que engajam
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              Alcance com propósito
            </span>
          </div>
        </div>
      </section>

      {/* Como Funciona - Mobile optimized */}
      <section id="como-funciona" className="container mx-auto px-4 py-12 md:py-20 bg-card/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Como Funciona?
          </h2>
          <p className="text-muted-foreground text-center mb-8 md:mb-12 text-base md:text-lg">
            3 passos simples para transformar sua pregação em conteúdo estratégico
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <Card className="bg-card/50 backdrop-blur border-border/50 relative overflow-hidden group hover:border-primary/50 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <CardContent className="pt-6 md:pt-8 relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <div className="text-primary font-bold text-sm mb-2">PASSO 1</div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-3">Grave ou Envie o Áudio</h3>
                <p className="text-muted-foreground text-sm md:text-base">
                  Grave ao vivo no Ide.On ou faça upload do arquivo. A IA transcreve e identifica versículos, temas, ênfases e chamadas da sua pregação.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50 relative overflow-hidden group hover:border-primary/50 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <CardContent className="pt-6 md:pt-8 relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <div className="text-primary font-bold text-sm mb-2">PASSO 2</div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-3">Gere o Pack da Semana</h3>
                <p className="text-muted-foreground text-sm md:text-base">
                  Em minutos, você recebe estudo bíblico, resumo, frases de impacto, carrossel, roteiros de reels/shorts, legendas e hashtags — tudo coerente com a doutrina cristã histórica.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50 relative overflow-hidden group hover:border-primary/50 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <CardContent className="pt-6 md:pt-8 relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <div className="text-primary font-bold text-sm mb-2">PASSO 3</div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-3">Organize e Publique</h3>
                <p className="text-muted-foreground text-sm md:text-base">
                  Use o planner visual para ajustar o tom, escolher os dias e exportar em PDF/Imagem ou direto para seus fluxos (Canva/CapCut/agenda de posts).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Consolidated: Resources + Deliverables with Tabs */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Tudo que você precisa
          </h2>
          <p className="text-muted-foreground text-center mb-8 md:mb-12 text-base md:text-lg">
            Recursos poderosos e entregáveis prontos para usar
          </p>

          <Tabs defaultValue="recursos" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="recursos">Recursos</TabsTrigger>
              <TabsTrigger value="entregaveis">Entregáveis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recursos" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {features.map((feature, index) => (
                  <Card key={index} className="bg-card/30 backdrop-blur border-border/50 hover:border-primary/50 transition-all">
                    <CardContent className="pt-4 md:pt-6">
                      <feature.icon className="w-8 h-8 md:w-10 md:h-10 text-primary mb-3 md:mb-4" />
                      <h3 className="text-base md:text-lg font-bold text-white mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-xs md:text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="entregaveis" className="mt-0">
              <Card className="bg-card/50 backdrop-blur border-border/50 max-w-4xl mx-auto">
                <CardContent className="pt-6 md:pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-2 md:gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-white text-sm md:text-base">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Testimonials - Mobile optimized */}
      <section className="container mx-auto px-4 py-12 md:py-20 bg-card/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            O Que Dizem Nossos Usuários
          </h2>
          <p className="text-muted-foreground text-center mb-8 md:mb-12 text-base md:text-lg">
            Líderes de todo o Brasil já estão transformando suas pregações em impacto digital
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card/30 backdrop-blur border-border/50">
                <CardContent className="pt-4 md:pt-6">
                  <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-full flex items-center justify-center text-xl md:text-2xl flex-shrink-0">
                      {testimonial.image}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm md:text-base truncate">{testimonial.name}</p>
                      <p className="text-muted-foreground text-xs md:text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs md:text-sm italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final - Simplified */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/20 to-cyan-400/20 backdrop-blur border-primary/50">
            <CardContent className="pt-8 pb-8 md:pt-12 md:pb-12 text-center">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                Pronto para transformar suas pregações em impacto digital?
              </h2>
              <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
                Domingo você prega. Na segunda a mídia já tem tudo pronto.
              </p>
              <Button 
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-base md:text-lg px-8 py-5 md:px-12 md:py-6 bg-primary hover:bg-primary/90 group"
              >
                Começar Agora Grátis
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-xs md:text-sm text-muted-foreground mt-4">
                Beta com uso liberado
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section - Reduced to 3 questions, mobile optimized */}
      <section className="container mx-auto px-4 py-12 md:py-20 bg-card/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-muted-foreground text-center mb-8 md:mb-12 text-base md:text-lg">
            Tudo que você precisa saber
          </p>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem 
              value="item-1"
              className="bg-card/50 backdrop-blur border border-border/50 rounded-lg px-4 md:px-6"
            >
              <AccordionTrigger className="text-left font-semibold text-white hover:text-primary text-sm md:text-base py-4">
                A IA inventa versículos?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm md:text-base">
                Não. O Ide.On exige referência e exibe a versão bíblica usada. Você revisa antes de publicar.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="item-2"
              className="bg-card/50 backdrop-blur border border-border/50 rounded-lg px-4 md:px-6"
            >
              <AccordionTrigger className="text-left font-semibold text-white hover:text-primary text-sm md:text-base py-4">
                Posso definir o estilo teológico?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm md:text-base">
                Sim. Presets de tom e guard-rails doutrinários para manter fidelidade.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem 
              value="item-3"
              className="bg-card/50 backdrop-blur border border-border/50 rounded-lg px-4 md:px-6"
            >
              <AccordionTrigger className="text-left font-semibold text-white hover:text-primary text-sm md:text-base py-4">
                Quanto custa no Beta?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm md:text-base">
                Grátis durante a validação. Depois, planos acessíveis para igrejas de todos os tamanhos.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer - Mobile optimized */}
      <footer className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center text-muted-foreground">
            <p className="text-xs md:text-sm">
              © 2024 Ide.On. Todos os direitos reservados.
            </p>
            <p className="text-xs mt-2">
              Transformando pregações em impacto digital
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
