import React, { useState } from "react";
import ThemeSwitch from "@/components/ui/theme-switch";
import { motion, AnimatePresence } from "framer-motion";
import { ContainerScrollHero } from "@/components/ContainerScrollHero";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SparklesCore } from "@/components/ui/sparkles";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LimelightNav, type NavItem } from "@/components/ui/limelight-nav";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import RadialOrbitalTimeline from "@/components/RadialOrbitalTimeline";
import { CardStack, type CardStackItem } from "@/components/ui/card-stack";
import {
  MapPin,
  Clock,
  Heart,
  Users,
  Music,
  BookOpen,
  ExternalLink,
  Youtube,
  Mail,
  MessageCircle,
  Baby,
  Handshake,
  Calendar,
  ChurchIcon,
  Instagram,
  ArrowRight,
  Sparkles,
  Globe,
  HandHeart,
  Play,
  Video,
} from "lucide-react";

// ─── CHURCH CONFIG ──────────────────────────────────────────────────────────
const CHURCH = {
  name: "Igreja Presbiteriana Bethaville",
  tagline: "Um lugar para conhecer Jesus, viver em família e crescer na fé.",
  location: "Bethaville — Barueri, SP",
  address: "Rua Exemplo, 123 — Bethaville, Barueri - SP, 06404-000",
  schedule: [
    { day: "Domingo", times: ["9h", "18h"] },
    { day: "Quarta-feira", times: ["20h"] },
  ],
  links: {
    whatsapp: "https://wa.me/5511999999999",
    instagram: "https://instagram.com/ipbethaville",
    youtube: "https://youtube.com/@ipbethaville",
    youtubeEmbed: "https://www.youtube-nocookie.com/embed/ed8EzWU056M",
    maps: "https://maps.google.com/?q=Igreja+Presbiteriana+Bethaville+Barueri",
    email: "mailto:contato@ipbethaville.com.br",
    pix: "#contribuir",
  },
  faq: [
    {
      q: "O que esperar?",
      a: "Um culto acolhedor, com louvor, oração e uma mensagem bíblica clara. Duração média de 1h30.",
    },
    {
      q: "Posso ir com minha família?",
      a: "Claro! Temos espaço para todas as idades, incluindo ministério infantil durante o culto.",
    },
    {
      q: "Tem ministério infantil?",
      a: "Sim! Crianças de 0 a 11 anos têm programação especial com cuidado e ensino bíblico.",
    },
    {
      q: "Preciso falar com alguém antes?",
      a: "Não é necessário, mas se quiser, estamos disponíveis pelo WhatsApp para tirar qualquer dúvida.",
    },
  ],
  values: [
    {
      id: 1,
      icon: BookOpen,
      title: "Nossa mensagem",
      content: "Jesus no centro de tudo. Pregamos a Palavra de Deus com fidelidade, clareza e aplicação para a vida.",
    },
    {
      id: 2,
      icon: Heart,
      title: "Nossa cultura",
      content: "Amor, verdade, comunhão e serviço. Vivemos como família espiritual que cuida uns dos outros.",
    },
    {
      id: 3,
      icon: Sparkles,
      title: "Nosso desejo",
      content: "Ver vidas sendo transformadas pela presença de Deus, crescendo em graça e conhecimento.",
    },
  ],
  ministries: [
    { id: "m1", title: "Infantil", description: "Cuidado e ensino bíblico para os pequenos", tag: "Crianças" },
    { id: "m2", title: "Jovens", description: "Comunhão, discipulado e crescimento", tag: "Juventude" },
    { id: "m3", title: "Casais e Famílias", description: "Fortalecendo vínculos no amor de Cristo", tag: "Família" },
    { id: "m4", title: "Pequenos Grupos", description: "Estudo bíblico e vida em comunidade", tag: "Células" },
    { id: "m5", title: "Louvor e Serviço", description: "Adoração e serviço prático na casa de Deus", tag: "Louvor" },
  ] satisfies CardStackItem[],
  events: [
    { date: "16 Mar", title: "Culto Dominical", time: "9h e 18h", tag: "Culto" },
    { date: "19 Mar", title: "Culto de Oração", time: "20h", tag: "Oração" },
    { date: "23 Mar", title: "Culto Dominical", time: "9h e 18h", tag: "Culto" },
    { date: "29 Mar", title: "Encontro de Jovens", time: "19h", tag: "Jovens" },
  ],
};

// ─── ANIMATION ──────────────────────────────────────────────────────────────
const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const tabContent = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0, 0, 0.2, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

// ─── MINISTRY CARD RENDERER ─────────────────────────────────────────────────
const ministryIcons: Record<string, React.ElementType> = {
  m1: Baby,
  m2: Users,
  m3: Handshake,
  m4: BookOpen,
  m5: Music,
};

function MinistryCard({ item, state }: { item: CardStackItem; state: { active: boolean } }) {
  const Icon = ministryIcons[item.id] || ChurchIcon;
  return (
    <div className="relative h-full w-full bg-gradient-to-br from-background via-background to-primary/5 p-6 flex flex-col justify-end">
      <div className="absolute top-5 right-5 p-2.5 rounded-xl bg-primary/10">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      {item.tag && (
        <Badge variant="outline" className="self-start mb-3 text-[10px] bg-primary/10 border-primary/20 text-primary">
          {item.tag}
        </Badge>
      )}
      <h3 className="text-lg font-bold text-foreground mb-1">{item.title}</h3>
      {item.description && (
        <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
      )}
    </div>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
const Bio = () => {
  const [activeTab, setActiveTab] = useState("inicio");

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="fixed top-4 right-4 z-[60]">
        <ThemeSwitch />
      </div>
      <div className="relative">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.15}
          duration={3}
          repeatDelay={1}
          className={cn(
            "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
            "fill-primary/20 stroke-primary/20"
          )}
        />
      <ContainerScrollHero
        titleComponent={
          <div className="flex flex-col items-center gap-3 sm:gap-4 px-4">
            <span className="text-xs sm:text-sm text-muted-foreground uppercase tracking-[0.2em] font-medium">
              Bem-vindo
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50 leading-tight text-center">
              Igreja Presbiteriana
              <br />
              Bethaville
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-md text-center leading-relaxed">
              {CHURCH.tagline}
            </p>

            <div className="flex flex-col items-center gap-1 mt-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Domingo 9h e 18h · Quarta 20h</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>{CHURCH.location}</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-3">
              <Button variant="solid" size="sm" onClick={() => setActiveTab("inicio")} className="min-h-[44px]">
                Quero visitar
              </Button>
              <Button variant="outline" size="sm" asChild className="min-h-[44px]">
                <a href={CHURCH.links.maps} target="_blank" rel="noopener noreferrer">
                  <MapPin className="w-4 h-4" /> Como chegar
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild className="min-h-[44px]">
                <a href={CHURCH.links.youtube} target="_blank" rel="noopener noreferrer">
                  <Youtube className="w-4 h-4" /> Assistir online
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild className="min-h-[44px]">
                <a href={CHURCH.links.whatsapp} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </Button>
            </div>

            <Badge
              variant="outline"
              className="bg-white/10 border-white/10 backdrop-blur-sm text-xs text-muted-foreground px-4 py-1.5 mt-2"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" /> última transmissão
            </Badge>
          </div>
        }
      >
        <iframe
          src={CHURCH.links.youtubeEmbed}
          className="w-full h-full rounded-2xl border-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          title="Última transmissão - Igreja Presbiteriana Bethaville"
        />
      </ContainerScrollHero>
      </div>

      {/* ━━━ STICKY TAB BAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="hidden">
          <TabsTrigger value="inicio" />
          <TabsTrigger value="sobre" />
          <TabsTrigger value="midia" />
          <TabsTrigger value="contato" />
        </TabsList>
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/20">
          <div className="container mx-auto px-4 flex justify-center py-3">
            <LimelightNav
              items={navItems}
              activeIndex={TAB_KEYS.indexOf(activeTab)}
              onTabChange={(index) => setActiveTab(TAB_KEYS[index])}
            />
          </div>
        </div>

        {/* ━━━ TAB 1 — INÍCIO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <TabsContent value="inicio" className="mt-0 outline-none">
          <AnimatePresence mode="wait">
            <motion.div key="inicio" {...tabContent} className="relative">
              <AnimatedGridPattern
                numSquares={20}
                maxOpacity={0.08}
                duration={4}
                className={cn(
                  "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
                  "fill-primary/10 stroke-primary/10"
                )}
              />
              {/* FAQ Accordion */}
              <section className="container mx-auto px-4 py-12 md:py-20">
                <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <motion.div variants={fadeIn} className="text-center mb-10 md:mb-14">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
                      É sua primeira vez por aqui?
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                      Queremos tornar sua visita leve, simples e acolhedora. Aqui você encontra uma comunidade que ama a Deus, ama pessoas e deseja caminhar com você.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeIn} className="max-w-2xl mx-auto">
                    <GlassCard className="p-6 sm:p-8">
                      <Accordion type="single" collapsible className="w-full">
                        {CHURCH.faq.map((item, i) => (
                          <AccordionItem key={i} value={`faq-${i}`} className="border-border/20">
                            <AccordionTrigger className="text-sm sm:text-base text-foreground hover:text-primary hover:no-underline py-4">
                              {item.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                              {item.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </GlassCard>
                  </motion.div>

                  <motion.div variants={fadeIn} className="flex justify-center mt-8">
                    <Button variant="solid" asChild className="min-h-[48px]">
                      <a href={CHURCH.links.whatsapp} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-4 h-4" /> Quero planejar minha visita
                      </a>
                    </Button>
                  </motion.div>
                </motion.div>
              </section>

              {/* Schedule + Address — two GlassCards */}
              <section className="container mx-auto px-4 pb-16 md:pb-24">
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
                >
                  <motion.div variants={fadeIn}>
                    <GlassCard glowColor="primary" className="p-6 sm:p-8 h-full">
                      <div className="relative z-[10]">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="p-2.5 rounded-lg bg-primary/10">
                            <Clock className="w-5 h-5 text-primary" />
                          </div>
                          <h3 className="font-semibold text-foreground text-lg">Horários dos cultos</h3>
                        </div>
                        <div className="space-y-3">
                          {CHURCH.schedule.map((s) => (
                            <div key={s.day} className="flex items-center justify-between border-b border-border/20 pb-3 last:border-0">
                              <span className="text-foreground font-medium text-sm sm:text-base">{s.day}</span>
                              <span className="text-primary font-semibold text-sm sm:text-base">{s.times.join(" e ")}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>

                  <motion.div variants={fadeIn}>
                    <GlassCard glowColor="cyan" className="p-6 sm:p-8 h-full">
                      <div className="relative z-[10]">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="p-2.5 rounded-lg bg-primary/10">
                            <MapPin className="w-5 h-5 text-primary" />
                          </div>
                          <h3 className="font-semibold text-foreground text-lg">Endereço</h3>
                        </div>
                        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">
                          {CHURCH.address}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button variant="solid" size="sm" asChild className="min-h-[44px] w-full sm:w-auto">
                            <a href={CHURCH.links.maps} target="_blank" rel="noopener noreferrer">
                              <MapPin className="w-4 h-4" /> Abrir no mapa
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" asChild className="min-h-[44px] w-full sm:w-auto">
                            <a href={CHURCH.links.whatsapp} target="_blank" rel="noopener noreferrer">
                              <MessageCircle className="w-4 h-4" /> WhatsApp
                            </a>
                          </Button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                </motion.div>
              </section>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* ━━━ TAB 2 — SOBRE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <TabsContent value="sobre" className="mt-0 outline-none">
          <AnimatePresence mode="wait">
            <motion.div key="sobre" {...tabContent} className="relative">
              <AnimatedGridPattern
                numSquares={20}
                maxOpacity={0.08}
                duration={4}
                className={cn(
                  "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
                  "fill-primary/10 stroke-primary/10"
                )}
              />
              {/* Quem Somos — RadialOrbitalTimeline */}
              <section className="container mx-auto px-4 py-12 md:py-20">
                <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <motion.div variants={fadeIn} className="text-center mb-8 md:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
                      Quem somos
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                      Somos uma igreja comprometida com o evangelho de Jesus, com a centralidade da Palavra e com uma vida cristã vivida em comunidade.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeIn} className="max-w-3xl mx-auto">
                    <RadialOrbitalTimeline timelineData={CHURCH.values} />
                  </motion.div>
                </motion.div>
              </section>

              {/* Ministérios — CardStack fan */}
              <section className="container mx-auto px-4 pb-16 md:pb-24">
                <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <motion.div variants={fadeIn} className="text-center mb-8 md:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
                      Há um lugar para você aqui
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                      A vida da igreja acontece de muitas formas ao longo da semana. Arraste para explorar nossos ministérios.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeIn} className="max-w-3xl mx-auto">
                    <CardStack
                      items={CHURCH.ministries}
                      cardWidth={400}
                      cardHeight={240}
                      maxVisible={5}
                      overlap={0.5}
                      spreadDeg={40}
                      activeScale={1.05}
                      inactiveScale={0.9}
                      showDots
                      autoAdvance
                      intervalMs={3500}
                      pauseOnHover
                      renderCard={(item, state) => <MinistryCard item={item} state={state} />}
                    />
                  </motion.div>

                  <motion.div variants={fadeIn} className="flex justify-center mt-8">
                    <Button variant="outline" asChild className="min-h-[48px]">
                      <a href={CHURCH.links.whatsapp} target="_blank" rel="noopener noreferrer">
                        Quero saber mais <ArrowRight className="w-4 h-4" />
                      </a>
                    </Button>
                  </motion.div>
                </motion.div>
              </section>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* ━━━ TAB 3 — MÍDIA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <TabsContent value="midia" className="mt-0 outline-none">
          <AnimatePresence mode="wait">
            <motion.div key="midia" {...tabContent} className="relative">
              <AnimatedGridPattern
                numSquares={20}
                maxOpacity={0.08}
                duration={4}
                className={cn(
                  "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
                  "fill-primary/10 stroke-primary/10"
                )}
              />
              {/* Transmissão */}
              <section className="container mx-auto px-4 py-12 md:py-20">
                <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <motion.div variants={fadeIn} className="text-center mb-10 md:mb-14">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
                      Assista e conheça mais
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                      Acompanhe nossas mensagens, cultos e conteúdos para conhecer melhor a visão da igreja.
                    </p>
                  </motion.div>

                  <motion.div variants={fadeIn} className="max-w-3xl mx-auto">
                    <Card className="overflow-hidden">
                      <div className="aspect-video">
                        <iframe
                          src={CHURCH.links.youtubeEmbed}
                          className="w-full h-full border-none"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                          title="Mensagens - Igreja Presbiteriana Bethaville"
                        />
                      </div>
                    </Card>
                  </motion.div>

                  <motion.div variants={fadeIn} className="flex flex-wrap justify-center gap-3 mt-8">
                    <Button variant="solid" size="sm" asChild className="min-h-[44px]">
                      <a href={CHURCH.links.youtube} target="_blank" rel="noopener noreferrer">
                        <Play className="w-4 h-4" /> Assistir ao vivo
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="min-h-[44px]">
                      <a href={CHURCH.links.youtube} target="_blank" rel="noopener noreferrer">
                        <Video className="w-4 h-4" /> Ver mensagens
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="min-h-[44px]">
                      <a href={CHURCH.links.youtube} target="_blank" rel="noopener noreferrer">
                        <Youtube className="w-4 h-4" /> YouTube
                      </a>
                    </Button>
                  </motion.div>
                </motion.div>
              </section>

              {/* Próximos Encontros — horizontal scroll */}
              <section className="container mx-auto px-4 pb-16 md:pb-24">
                <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <motion.div variants={fadeIn} className="text-center mb-10 md:mb-14">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
                      Próximos encontros
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                      Fique por dentro dos próximos cultos e eventos especiais.
                    </p>
                  </motion.div>

                  <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible max-w-5xl mx-auto">
                    {CHURCH.events.map((ev, i) => (
                      <motion.div
                        key={i}
                        variants={fadeIn}
                        className="snap-center flex-shrink-0 w-[260px] sm:w-[280px] md:w-auto"
                      >
                        <Card className="p-5 sm:p-6 h-full">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-primary/10 shrink-0">
                                <span className="text-primary font-bold text-base leading-none">
                                  {ev.date.split(" ")[0]}
                                </span>
                                <span className="text-primary/70 text-[10px] uppercase">
                                  {ev.date.split(" ")[1]}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-[10px]">{ev.tag}</Badge>
                            </div>
                            <h3 className="font-semibold text-foreground text-sm">{ev.title}</h3>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground text-xs">{ev.time}</span>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </section>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* ━━━ TAB 4 — CONTATO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <TabsContent value="contato" className="mt-0 outline-none">
          <AnimatePresence mode="wait">
            <motion.div key="contato" {...tabContent} className="relative">
              <AnimatedGridPattern
                numSquares={20}
                maxOpacity={0.08}
                duration={4}
                className={cn(
                  "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
                  "fill-primary/10 stroke-primary/10"
                )}
              />
              {/* Pedido de Oração — GlassCard + Sparkles */}
              <section className="container mx-auto px-4 py-12 md:py-20">
                <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <motion.div variants={fadeIn} className="max-w-2xl mx-auto">
                    <GlassCard glowColor="cyan" className="p-8 sm:p-12 text-center relative overflow-hidden">
                      <div className="absolute inset-0 z-[4] pointer-events-none">
                        <SparklesCore
                          background="transparent"
                          minSize={0.4}
                          maxSize={1.2}
                          particleDensity={25}
                          particleColor="#06b6d4"
                          speed={1.5}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="relative z-[10]">
                        <div className="flex justify-center mb-5">
                          <div className="p-3 rounded-xl bg-primary/10">
                            <HandHeart className="w-7 h-7 text-primary" />
                          </div>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                          Podemos orar por você?
                        </h2>
                        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-2">
                          Você não precisa caminhar sozinho.
                        </p>
                        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8">
                          Envie seu pedido de oração. Nossa equipe terá alegria em interceder pela sua vida.
                        </p>
                        <Button variant="solid" asChild className="min-h-[48px]">
                          <a href={CHURCH.links.whatsapp} target="_blank" rel="noopener noreferrer">
                            <Heart className="w-4 h-4" /> Enviar pedido de oração
                          </a>
                        </Button>
                      </div>
                    </GlassCard>
                  </motion.div>
                </motion.div>
              </section>

              {/* Contato icons */}
              <section className="container mx-auto px-4 pb-12 md:pb-16">
                <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <motion.div variants={fadeIn} className="text-center mb-10">
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Fale com a gente</h2>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Estamos aqui para ajudar você.
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
                    {[
                      { icon: MessageCircle, label: "WhatsApp", href: CHURCH.links.whatsapp, glow: "primary" as const },
                      { icon: Instagram, label: "Instagram", href: CHURCH.links.instagram, glow: "red" as const },
                      { icon: Mail, label: "E-mail", href: CHURCH.links.email, glow: "blue" as const },
                      { icon: MapPin, label: "Como chegar", href: CHURCH.links.maps, glow: "cyan" as const },
                    ].map((item) => (
                      <motion.div key={item.label} variants={fadeIn}>
                        <a href={item.href} target="_blank" rel="noopener noreferrer" className="block">
                          <GlassCard glowColor={item.glow} className="p-5 sm:p-6 text-center cursor-pointer hover:scale-[1.02] transition-transform">
                            <div className="relative z-[10] flex flex-col items-center gap-3">
                              <div className="p-3 rounded-xl bg-primary/10">
                                <item.icon className="w-5 h-5 text-primary" />
                              </div>
                              <span className="text-foreground text-xs sm:text-sm font-medium">{item.label}</span>
                            </div>
                          </GlassCard>
                        </a>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </section>

              {/* Dízimos e Ofertas */}
              <section className="container mx-auto px-4 pb-16 md:pb-24">
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="max-w-2xl mx-auto text-center"
                >
                  <motion.div variants={fadeIn}>
                    <div className="flex justify-center mb-5">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <HandHeart className="w-7 h-7 text-primary" />
                      </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Dízimos e ofertas</h2>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto">
                      Sua generosidade coopera com a missão, o cuidado com pessoas e o avanço da obra de Deus.
                    </p>
                    <Button variant="solid" asChild className="min-h-[48px]">
                      <a href={CHURCH.links.whatsapp} target="_blank" rel="noopener noreferrer">
                        Contribuir <ArrowRight className="w-4 h-4" />
                      </a>
                    </Button>
                  </motion.div>
                </motion.div>
              </section>
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* ━━━ FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="relative border-t border-border/30 py-10 md:py-14">
        <AnimatedGridPattern
          numSquares={15}
          maxOpacity={0.06}
          duration={5}
          className={cn(
            "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
            "fill-primary/10 stroke-primary/10"
          )}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 max-w-4xl mx-auto">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-foreground text-base sm:text-lg mb-2">{CHURCH.name}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm mb-1">{CHURCH.address}</p>
              <p className="text-muted-foreground text-xs sm:text-sm">Domingo 9h e 18h · Quarta 20h</p>
            </div>
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, href: CHURCH.links.instagram, label: "Instagram" },
                { icon: Youtube, href: CHURCH.links.youtube, label: "YouTube" },
                { icon: MessageCircle, href: CHURCH.links.whatsapp, label: "WhatsApp" },
                { icon: MapPin, href: CHURCH.links.maps, label: "Mapa" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="p-2.5 rounded-full border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-colors"
                >
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
          <div className="text-center mt-8">
            <p className="text-muted-foreground/50 text-[10px] sm:text-xs">
              © {new Date().getFullYear()} {CHURCH.name}. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Bio;
