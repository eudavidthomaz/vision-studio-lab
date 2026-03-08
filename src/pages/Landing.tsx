import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { Mic, Sparkles, Calendar, Zap, Target, CheckCircle2, ArrowRight, BookOpen, Users, Layout, BookMarked } from "lucide-react";
import logoIdeon from "@/assets/logo-ideon.png";
import { ContainerScrollHero } from "@/components/ContainerScrollHero";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";

const YOUTUBE_ID = "SGRIma5ElbY";

/* ── Animation helpers ── */
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0, 0, 0.2, 1] as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const } },
};

/* ── Data ── */
const steps = [
  {
    icon: Mic,
    step: "01",
    title: "Grave ou Envie o Áudio",
    description: "Grave ao vivo no Ide.On ou faça upload do arquivo. A IA transcreve e identifica versículos, temas, ênfases e chamadas da sua pregação.",
    glow: "primary" as const,
  },
  {
    icon: Sparkles,
    step: "02",
    title: "Gere o Pack da Semana",
    description: "Em minutos, você recebe estudo bíblico, resumo, frases de impacto, carrossel, roteiros de reels/shorts, legendas e hashtags.",
    glow: "blue" as const,
  },
  {
    icon: Calendar,
    step: "03",
    title: "Organize e Publique",
    description: "Use o planner visual para ajustar o tom, escolher os dias e exportar em PDF/Imagem ou direto para seus fluxos.",
    glow: "cyan" as const,
  },
];

const features = [
  { icon: BookOpen, title: "Teologia Sólida", description: "Conteúdo com referências bíblicas claras e aplicações que respeitam a ortodoxia." },
  { icon: Users, title: "Feito para Equipes", description: "Roteiros, carrosséis e legendas prontos para design e edição." },
  { icon: Zap, title: "Rápido de Verdade", description: "De uma pregação para 7 dias de conteúdo em minutos." },
  { icon: Layout, title: "Planner Visual", description: "Arraste e solte, ajuste o tom e publique com ritmo." },
  { icon: Target, title: "Foco em Crescimento", description: "Conteúdos alinhados aos 5 pilares: Edificar, Alcançar, Conectar, Servir e Anunciar." },
  { icon: BookMarked, title: "Biblioteca Inteligente", description: "Tudo salvo, pesquisável por tema/verso/série e pronto para reaproveitar." },
];

const deliverables = [
  "Posts completos para Instagram e Facebook",
  "Stories interativos (enquetes, perguntas, caixinhas)",
  "Roteiros de Reels/Shorts com ganchos e CTAs",
  "Carrosséis educativos com estrutura de slide pronta",
  "Legendas com variações de tom",
  "Frases de impacto e clips destacados",
  "Hashtags e CTAs otimizados",
  "Sugestões de dias e horários para postar",
  "Estudo bíblico + contexto histórico + aplicação",
  "Exportação em PDF/Imagem",
];

const testimonials = [
  { name: "Pr. João", role: "Igreja Batista Central", content: "O Ide.On nos deu constância. Em minutos temos uma semana pronta — e fiel ao que pregamos.", emoji: "👨‍💼", glow: "primary" as const },
  { name: "Pastora Maria", role: "Comunidade Evangélica", content: "A IA entende o coração da mensagem e traduz para a linguagem da internet. Nosso engajamento triplicou.", emoji: "👩‍💼", glow: "blue" as const },
  { name: "Pedro", role: "Líder de Mídia", content: "Ferramenta indispensável para quem lidera mídia. O planner acabou com as nossas madrugadas de domingo.", emoji: "👨‍💻", glow: "cyan" as const },
];

const faqs = [
  { q: "A IA inventa versículos?", a: "Não. O Ide.On exige referência e exibe a versão bíblica usada. Você revisa antes de publicar." },
  { q: "Posso definir o estilo teológico?", a: "Sim. Presets de tom e guard-rails doutrinários para manter fidelidade." },
  { q: "Quanto custa no Beta?", a: "Grátis durante a validação. Depois, planos acessíveis para igrejas de todos os tamanhos." },
];

const Landing = () => {
  const navigate = useNavigate();

  const youtubeParams = new URLSearchParams({
    autoplay: "0",
    loop: "1",
    controls: "1",
    rel: "0",
    modestbranding: "1",
    showinfo: "0",
    playsinline: "1",
    playlist: YOUTUBE_ID,
  });
  const embedUrl = `https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?${youtubeParams.toString()}`;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={logoIdeon} alt="Ide.On" className="h-8 w-8 rounded-lg object-contain" />
            <h1 className="text-2xl font-bold text-foreground">Ide.On</h1>
          </div>
          <Button onClick={() => navigate("/auth")} className="bg-primary hover:bg-primary/90">
            Começar Grátis
          </Button>
        </div>
      </header>

      {/* HERO — ContainerScroll */}
      <ContainerScrollHero
        titleComponent={
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold tracking-wide bg-primary/10 border border-primary/20 text-primary">
              Beta Aberto · Uso 100% Gratuito
            </div>
            <h2 className="font-gunterz text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-foreground tracking-tight uppercase leading-tight">
              A câmera desliga.
              <br />
              A missão continua.
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
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
          </div>
        }
      >
        <iframe
          src={embedUrl}
          title="Video de apresentação"
          className="w-full h-full rounded-xl"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </ContainerScrollHero>

      {/* ═══════════════════════════════════════════
          COMO FUNCIONA — Animated Steps
      ═══════════════════════════════════════════ */}
      <motion.section
        className="container mx-auto px-4 py-16 md:py-28"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="font-gunterz text-3xl md:text-5xl font-black text-foreground text-center mb-3 uppercase tracking-tight">
            Como Funciona
          </h2>
          <p className="text-muted-foreground text-center mb-12 md:mb-16 text-base md:text-lg max-w-xl mx-auto">
            3 passos simples para transformar sua pregação em conteúdo estratégico
          </p>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {steps.map((s) => (
              <motion.div key={s.step} variants={itemVariants}>
                <GlassCard glowColor={s.glow} className="h-full">
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-gunterz text-3xl md:text-4xl font-black text-primary/30">{s.step}</span>
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <s.icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">{s.title}</h3>
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{s.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          RECURSOS — Features Grid
      ═══════════════════════════════════════════ */}
      <motion.section
        className="container mx-auto px-4 py-16 md:py-28"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="font-gunterz text-3xl md:text-5xl font-black text-foreground text-center mb-3 uppercase tracking-tight">
            Tudo que você precisa
          </h2>
          <p className="text-muted-foreground text-center mb-12 md:mb-16 text-base md:text-lg max-w-xl mx-auto">
            Recursos poderosos e entregáveis prontos para usar
          </p>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {features.map((f, i) => (
              <motion.div key={i} variants={itemVariants}>
                <GlassCard glowColor={i % 3 === 0 ? "primary" : i % 3 === 1 ? "blue" : "cyan"} className="h-full">
                  <div className="p-6">
                    <f.icon className="w-8 h-8 text-primary mb-4" />
                    <h3 className="text-base md:text-lg font-bold text-foreground mb-1.5">{f.title}</h3>
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">{f.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Deliverables checklist */}
          <motion.div
            className="mt-12 md:mt-16"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <GlassCard glowColor="primary" className="max-w-4xl mx-auto">
              <div className="p-6 md:p-10">
                <h3 className="font-gunterz text-xl md:text-2xl font-black text-foreground mb-6 uppercase tracking-tight text-center">
                  Entregáveis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {deliverables.map((d, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground text-sm md:text-base">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          DEPOIMENTOS — Testimonials
      ═══════════════════════════════════════════ */}
      <motion.section
        className="container mx-auto px-4 py-16 md:py-28"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="font-gunterz text-3xl md:text-5xl font-black text-foreground text-center mb-3 uppercase tracking-tight">
            O que dizem
          </h2>
          <p className="text-muted-foreground text-center mb-12 md:mb-16 text-base md:text-lg max-w-xl mx-auto">
            Líderes de todo o Brasil já transformam pregações em impacto digital
          </p>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={itemVariants}>
                <GlassCard glowColor={t.glow} className="h-full">
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl flex-shrink-0">
                        {t.emoji}
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground font-semibold text-sm md:text-base truncate">{t.name}</p>
                        <p className="text-muted-foreground text-xs md:text-sm">{t.role}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm italic leading-relaxed">"{t.content}"</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          CTA FINAL
      ═══════════════════════════════════════════ */}
      <motion.section
        className="container mx-auto px-4 py-16 md:py-28"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="max-w-4xl mx-auto">
          <GlassCard glowColor="primary">
            <div className="p-8 md:p-14 text-center">
              <h2 className="font-gunterz text-2xl md:text-4xl font-black text-foreground mb-4 uppercase tracking-tight">
                Pronto para transformar suas pregações?
              </h2>
              <p className="text-base md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Domingo você prega. Na segunda a mídia já tem tudo pronto.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-base md:text-lg px-10 py-6 md:px-14 md:py-7 bg-primary hover:bg-primary/90 group"
              >
                Começar Agora Grátis
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-xs md:text-sm text-muted-foreground mt-5">Beta com uso liberado</p>
            </div>
          </GlassCard>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════ */}
      <motion.section
        className="container mx-auto px-4 py-16 md:py-28"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="font-gunterz text-3xl md:text-5xl font-black text-foreground text-center mb-3 uppercase tracking-tight">
            Perguntas Frequentes
          </h2>
          <p className="text-muted-foreground text-center mb-12 md:mb-16 text-base md:text-lg">
            Tudo que você precisa saber
          </p>

          <GlassCard glowColor="blue">
            <div className="p-4 md:p-8">
              <Accordion type="single" collapsible className="space-y-2">
                {faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="border-b border-white/5 last:border-0"
                  >
                    <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary text-sm md:text-base py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm md:text-base pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </GlassCard>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 md:py-14">
        <div className="container mx-auto px-4 flex flex-col items-center gap-3">
          <img src={logoIdeon} alt="Ide.On" className="h-8 w-8 rounded-lg object-contain opacity-60" />
          <p className="text-muted-foreground text-xs">
            © 2024 Ide.On · Transformando pregações em impacto digital
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
