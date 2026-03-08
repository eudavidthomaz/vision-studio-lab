import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, Sparkles, Calendar, Zap, Target, CheckCircle2, ArrowRight, BookOpen, Users, Layout, BookMarked } from "lucide-react";
import logoIdeon from "@/assets/logo-ideon.png";
import { ContainerScrollHero } from "@/components/ContainerScrollHero";
import { GlassCard } from "@/components/ui/glass-card";
import { SparklesCore } from "@/components/ui/sparkles";

const YOUTUBE_ID = "SGRIma5ElbY";
const YOUTUBE_EMBED = `https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}`;

const glowCycle = ["primary", "blue", "cyan"] as const;

const steps = [
  {
    icon: Mic,
    label: "PASSO 1",
    title: "Grave ou Envie o Áudio",
    description: "Grave ao vivo no Ide.On ou faça upload do arquivo. A IA transcreve e identifica versículos, temas, ênfases e chamadas da sua pregação.",
  },
  {
    icon: Sparkles,
    label: "PASSO 2",
    title: "Gere o Pack da Semana",
    description: "Em minutos, você recebe estudo bíblico, resumo, frases de impacto, carrossel, roteiros de reels/shorts, legendas e hashtags — tudo coerente com a doutrina cristã histórica.",
  },
  {
    icon: Calendar,
    label: "PASSO 3",
    title: "Organize e Publique",
    description: "Use o planner visual para ajustar o tom, escolher os dias e exportar em PDF/Imagem ou direto para seus fluxos (Canva/CapCut/agenda de posts).",
  },
];

const features = [
  { icon: BookOpen, title: "Teologia Sólida, Linguagem Viva", description: "Nada de \"IA sem noção\". O conteúdo nasce com referências bíblicas claras e aplicações que respeitam a ortodoxia." },
  { icon: Users, title: "Feito para Equipes de Mídia", description: "Roteiros, carrosséis e legends prontos para design e edição. Menos retrabalho, mais consistência." },
  { icon: Zap, title: "Rápido de Verdade", description: "De uma pregação para 7 dias de conteúdo em minutos." },
  { icon: Layout, title: "Planner Visual", description: "Arraste e solte, ajuste o tom (pastoral, jovem, institucional, evangelístico) e publique com ritmo." },
  { icon: Target, title: "Foco em Crescimento", description: "Conteúdos alinhados aos 5 pilares: Edificar, Alcançar, Conectar, Servir e Anunciar." },
  { icon: BookMarked, title: "Biblioteca Inteligente", description: "Tudo salvo, pesquisável por tema/verso/série e pronto para reaproveitar." },
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
  "Exportação em PDF/Imagem (pronto pra enviar no grupo da equipe)",
];

const testimonials = [
  { name: "Pr. João", role: "Igreja Batista Central", content: "O Ide.On nos deu constância. Em minutos temos uma semana pronta — e fiel ao que pregamos.", image: "👨‍💼" },
  { name: "Pastora Maria", role: "Comunidade Evangélica", content: "A IA entende o coração da mensagem e traduz para a linguagem da internet. Nosso engajamento triplicou.", image: "👩‍💼" },
  { name: "Pedro", role: "Líder de Mídia", content: "Ferramenta indispensável para quem lidera mídia. O planner acabou com as nossas madrugadas de domingo.", image: "👨‍💻" },
];

const faqItems = [
  { q: "A IA inventa versículos?", a: "Não. O Ide.On exige referência e exibe a versão bíblica usada. Você revisa antes de publicar." },
  { q: "Posso definir o estilo teológico?", a: "Sim. Presets de tom e guard-rails doutrinários para manter fidelidade." },
  { q: "Quanto custa no Beta?", a: "Grátis durante a validação. Depois, planos acessíveis para igrejas de todos os tamanhos." },
];

const ease = [0, 0, 0.2, 1] as const;

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: ease as unknown as [number, number, number, number] } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: ease as unknown as [number, number, number, number] },
  }),
};

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={logoIdeon} alt="Ide.On" className="h-8 w-8 rounded-lg object-contain" />
            <h1 className="text-2xl font-gunterz uppercase text-foreground">Ide.On</h1>
          </div>
          <Button
            onClick={() => navigate("/auth")}
            className="bg-primary hover:bg-primary/90"
          >
            Começar Grátis
          </Button>
        </div>
      </header>

      {/* HERO — ContainerScroll 3D */}
      <ContainerScrollHero
        titleComponent={
          <>
            <p className="text-sm md:text-base text-muted-foreground mb-4">Beta Aberto · Uso 100% Gratuito</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-gunterz uppercase text-foreground mb-4">
              A câmera desliga.
              <br />
              A missão continua.
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
              Do altar ao feed: transforme sua pregação em uma semana de conteúdo com fundamento bíblico.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-base sm:text-lg px-8 py-5 sm:px-12 sm:py-7 bg-primary hover:bg-primary/90 group"
            >
              Começar Grátis
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </>
        }
      >
        <iframe
          src={`${YOUTUBE_EMBED}?autoplay=0&controls=1&rel=0&modestbranding=1`}
          title="Ide.On Demo"
          className="w-full h-full rounded-2xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </ContainerScrollHero>

      {/* ═══════════════════════════════════════════
           COMO FUNCIONA
         ═══════════════════════════════════════════ */}
      <motion.section
        id="como-funciona"
        className="container mx-auto px-4 py-16 md:py-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-gunterz uppercase text-foreground text-center mb-4">
            Como Funciona?
          </h2>
          <p className="text-muted-foreground text-center mb-10 md:mb-16 text-base md:text-lg">
            3 passos simples para transformar sua pregação em conteúdo estratégico
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <GlassCard glowColor={glowCycle[i % 3]} className="h-full">
                  <div className="p-6 md:p-8">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    </div>
                    <div className="text-primary font-bold text-sm mb-2">{step.label}</div>
                    <h3 className="text-lg md:text-xl font-gunterz uppercase text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-sm md:text-base">{step.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
           RECURSOS
         ═══════════════════════════════════════════ */}
      <motion.section
        className="container mx-auto px-4 py-16 md:py-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-gunterz uppercase text-foreground text-center mb-4">
            Tudo que você precisa
          </h2>
          <p className="text-muted-foreground text-center mb-10 md:mb-16 text-base md:text-lg">
            Recursos poderosos para sua estratégia de conteúdo
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <GlassCard glowColor={glowCycle[i % 3]} className="h-full">
                  <div className="p-6">
                    <feature.icon className="w-8 h-8 md:w-10 md:h-10 text-primary mb-3 md:mb-4" />
                    <h3 className="text-base md:text-lg font-gunterz uppercase text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-xs md:text-sm">{feature.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Entregáveis */}
          <motion.div
            className="mt-12"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <h3 className="text-2xl md:text-3xl font-gunterz uppercase text-foreground text-center mb-8">
              Entregáveis Prontos
            </h3>
            <GlassCard glowColor="cyan" className="max-w-4xl mx-auto">
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2 md:gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground text-sm md:text-base">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
           TESTIMONIALS
         ═══════════════════════════════════════════ */}
      <motion.section
        className="container mx-auto px-4 py-16 md:py-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-gunterz uppercase text-foreground text-center mb-4">
            O Que Dizem Nossos Usuários
          </h2>
          <p className="text-muted-foreground text-center mb-10 md:mb-16 text-base md:text-lg">
            Líderes de todo o Brasil já estão transformando suas pregações em impacto digital
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <GlassCard glowColor={glowCycle[i % 3]} className="h-full">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                        {t.image}
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground font-semibold text-sm md:text-base truncate">{t.name}</p>
                        <p className="text-muted-foreground text-xs md:text-sm">{t.role}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-xs md:text-sm italic">"{t.content}"</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
           CTA FINAL
         ═══════════════════════════════════════════ */}
      <motion.section
        className="container mx-auto px-4 py-16 md:py-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-4xl mx-auto">
          <GlassCard glowColor="primary" className="relative overflow-hidden">
            <div className="absolute inset-0 z-[4] pointer-events-none">
              <SparklesCore
                background="transparent"
                minSize={0.4}
                maxSize={1.4}
                particleDensity={25}
                particleColor="#a855f7"
                speed={1.5}
                className="w-full h-full"
              />
            </div>
            <div className="relative z-[10] p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-4xl font-gunterz uppercase text-foreground mb-4">
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
            </div>
          </GlassCard>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
           FAQ
         ═══════════════════════════════════════════ */}
      <motion.section
        className="container mx-auto px-4 py-16 md:py-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-gunterz uppercase text-foreground text-center mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-muted-foreground text-center mb-10 md:mb-16 text-base md:text-lg">
            Tudo que você precisa saber
          </p>

          <GlassCard glowColor="blue">
            <div className="p-4 md:p-6">
              <Accordion type="single" collapsible className="space-y-3">
                {faqItems.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="border-b border-border/30 last:border-b-0"
                  >
                    <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary text-sm md:text-base py-4">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm md:text-base">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </GlassCard>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <img src={logoIdeon} alt="Ide.On" className="h-6 w-6 rounded-lg object-contain" />
              <span className="text-lg font-gunterz uppercase text-foreground">Ide.On</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              © 2024 Ide.On. Todos os direitos reservados.
            </p>
            <p className="text-xs text-muted-foreground">
              Transformando pregações em impacto digital
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
