import React from "react";
import { motion } from "framer-motion";
import { ContainerScrollHero } from "@/components/ContainerScrollHero";
import { GlassCard } from "@/components/ui/glass-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SparklesCore } from "@/components/ui/sparkles";
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
  Phone,
  Instagram,
  ArrowRight,
  Sparkles,
  Globe,
  HandHeart,
} from "lucide-react";

// ─── CHURCH CONFIG (single source of truth) ─────────────────────────────────
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
      icon: Sparkles,
      title: "O que esperar?",
      text: "Um culto acolhedor, com louvor, oração e uma mensagem bíblica clara. Duração média de 1h30.",
    },
    {
      icon: Users,
      title: "Posso ir com minha família?",
      text: "Claro! Temos espaço para todas as idades, incluindo ministério infantil durante o culto.",
    },
    {
      icon: Baby,
      title: "Tem ministério infantil?",
      text: "Sim! Crianças de 0 a 11 anos têm programação especial com cuidado e ensino bíblico.",
    },
    {
      icon: MessageCircle,
      title: "Preciso falar com alguém antes?",
      text: "Não é necessário, mas se quiser, estamos disponíveis pelo WhatsApp para tirar qualquer dúvida.",
    },
  ],
  values: [
    {
      icon: BookOpen,
      title: "Nossa mensagem",
      text: "Jesus no centro de tudo",
      glow: "primary" as const,
    },
    {
      icon: Heart,
      title: "Nossa cultura",
      text: "Amor, verdade, comunhão e serviço",
      glow: "cyan" as const,
    },
    {
      icon: Sparkles,
      title: "Nosso desejo",
      text: "Ver vidas sendo transformadas pela presença de Deus",
      glow: "blue" as const,
    },
  ],
  ministries: [
    { icon: Baby, title: "Infantil", text: "Cuidado e ensino bíblico para os pequenos" },
    { icon: Users, title: "Jovens", text: "Comunhão, discipulado e crescimento" },
    { icon: Handshake, title: "Casais e famílias", text: "Fortalecendo vínculos no amor de Cristo" },
    { icon: BookOpen, title: "Pequenos grupos", text: "Estudo bíblico e vida em comunidade" },
    { icon: Music, title: "Louvor e serviço", text: "Adoração e serviço prático na casa de Deus" },
  ],
  events: [
    { date: "16 Mar", title: "Culto Dominical", time: "9h e 18h", tag: "Culto" },
    { date: "19 Mar", title: "Culto de Oração", time: "20h", tag: "Oração" },
    { date: "23 Mar", title: "Culto Dominical", time: "9h e 18h", tag: "Culto" },
    { date: "29 Mar", title: "Encontro de Jovens", time: "19h", tag: "Jovens" },
  ],
};

// ─── ANIMATION VARIANTS ─────────────────────────────────────────────────────
const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as [number, number, number, number], staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] } },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const SectionHeading = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="text-center mb-10 md:mb-14">
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">{title}</h2>
    {subtitle && <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
  </div>
);

// ─── PAGE ────────────────────────────────────────────────────────────────────
const Bio = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── 1. HERO ───────────────────────────────────────────────────────── */}
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
              <Button variant="solid" size="sm" onClick={() => scrollTo("primeira-vez")} className="min-h-[44px]">
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
              🔴 última transmissão
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

      {/* ── 2. PRIMEIRA VEZ ───────────────────────────────────────────────── */}
      <motion.section
        id="primeira-vez"
        className="container mx-auto px-4 py-16 md:py-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <SectionHeading
          title="É sua primeira vez por aqui?"
          subtitle="Queremos tornar sua visita leve, simples e acolhedora. Aqui você encontra uma comunidade que ama a Deus, ama pessoas e deseja caminhar com você. Você pode vir como está. Nossa equipe estará pronta para te receber com carinho."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {CHURCH.faq.map((item) => (
            <motion.div key={item.title} variants={itemVariants}>
              <GlassCard className="p-5 sm:p-6 h-full">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1">{item.title}</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{item.text}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
        <motion.div variants={itemVariants} className="flex justify-center mt-8">
          <Button variant="solid" asChild className="min-h-[48px]">
            <a href={CHURCH.links.whatsapp} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4" /> Quero planejar minha visita
            </a>
          </Button>
        </motion.div>
      </motion.section>

      {/* ── 3. HORÁRIOS E ENDEREÇO ────────────────────────────────────────── */}
      <motion.section
        id="horarios"
        className="container mx-auto px-4 py-16 md:py-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <SectionHeading title="Quando e onde nos encontramos" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <motion.div variants={itemVariants}>
            <Card className="p-6 sm:p-8 h-full">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">Horários dos cultos</h3>
              </div>
              <div className="space-y-3">
                {CHURCH.schedule.map((s) => (
                  <div key={s.day} className="flex items-center justify-between border-b border-border/30 pb-3 last:border-0">
                    <span className="text-foreground font-medium text-sm sm:text-base">{s.day}</span>
                    <span className="text-primary font-semibold text-sm sm:text-base">{s.times.join(" e ")}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="p-6 sm:p-8 h-full">
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
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* ── 4. QUEM SOMOS ─────────────────────────────────────────────────── */}
      <motion.section
        id="quem-somos"
        className="container mx-auto px-4 py-16 md:py-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <SectionHeading
          title="Quem somos"
          subtitle="Somos uma igreja comprometida com o evangelho de Jesus, com a centralidade da Palavra e com uma vida cristã vivida em comunidade. Cremos que a igreja não é apenas um lugar para frequentar, mas uma família espiritual para caminhar, servir, amadurecer e viver a fé de forma real."
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {CHURCH.values.map((v) => (
            <motion.div key={v.title} variants={itemVariants}>
              <GlassCard glowColor={v.glow} className="p-6 sm:p-8 h-full text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <v.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground text-base sm:text-lg mb-2">{v.title}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{v.text}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── 5. MINISTÉRIOS ────────────────────────────────────────────────── */}
      <motion.section
        id="ministerios"
        className="container mx-auto px-4 py-16 md:py-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <SectionHeading
          title="Há um lugar para você aqui"
          subtitle="A vida da igreja acontece de muitas formas ao longo da semana. Conheça alguns dos nossos ministérios e espaços de comunhão."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {CHURCH.ministries.map((m) => (
            <motion.div key={m.title} variants={itemVariants}>
              <GlassCard className="p-5 sm:p-6 h-full">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <m.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1">{m.title}</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{m.text}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
        <motion.div variants={itemVariants} className="flex justify-center mt-8">
          <Button variant="outline" asChild className="min-h-[48px]">
            <a href={CHURCH.links.whatsapp} target="_blank" rel="noopener noreferrer">
              Quero saber mais <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </motion.div>
      </motion.section>

      {/* ── 6. TRANSMISSÃO / MENSAGENS ────────────────────────────────────── */}
      <motion.section
        id="transmissao"
        className="container mx-auto px-4 py-16 md:py-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <SectionHeading
          title="Assista e conheça mais"
          subtitle="Acompanhe nossas mensagens, cultos e conteúdos para conhecer melhor a visão da igreja e ser edificado ao longo da semana."
        />
        <div className="max-w-3xl mx-auto">
          <motion.div variants={itemVariants}>
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
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 mt-8">
            <Button variant="solid" size="sm" asChild className="min-h-[44px]">
              <a href={CHURCH.links.youtube} target="_blank" rel="noopener noreferrer">
                <Youtube className="w-4 h-4" /> Assistir ao vivo
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild className="min-h-[44px]">
              <a href={CHURCH.links.youtube} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" /> Ver últimas mensagens
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild className="min-h-[44px]">
              <a href={CHURCH.links.youtube} target="_blank" rel="noopener noreferrer">
                <Youtube className="w-4 h-4" /> Ir para o YouTube
              </a>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* ── 7. PRÓXIMOS ENCONTROS ─────────────────────────────────────────── */}
      <motion.section
        id="agenda"
        className="container mx-auto px-4 py-16 md:py-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <SectionHeading
          title="Próximos encontros"
          subtitle="Fique por dentro dos próximos cultos, programações e eventos especiais da nossa comunidade."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {CHURCH.events.map((ev, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="p-5 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary/10 shrink-0">
                    <span className="text-primary font-bold text-sm sm:text-base leading-none">{ev.date.split(" ")[0]}</span>
                    <span className="text-primary/70 text-[10px] sm:text-xs uppercase">{ev.date.split(" ")[1]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{ev.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs sm:text-sm">{ev.time}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{ev.tag}</Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── 8. PEDIDO DE ORAÇÃO ───────────────────────────────────────────── */}
      <motion.section
        id="oracao"
        className="container mx-auto px-4 py-16 md:py-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <div className="max-w-2xl mx-auto">
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
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Podemos orar por você?</h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-2">
                Você não precisa caminhar sozinho.
              </p>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8">
                Se desejar, envie seu pedido de oração. Nossa equipe terá alegria em interceder pela sua vida.
              </p>
              <Button variant="solid" asChild className="min-h-[48px]">
                <a href={CHURCH.links.whatsapp} target="_blank" rel="noopener noreferrer">
                  <Heart className="w-4 h-4" /> Enviar pedido de oração
                </a>
              </Button>
            </div>
          </GlassCard>
        </div>
      </motion.section>

      {/* ── 9. CONTATO ────────────────────────────────────────────────────── */}
      <motion.section
        id="contato"
        className="container mx-auto px-4 py-16 md:py-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <SectionHeading
          title="Fale com a gente"
          subtitle="Estamos aqui para ajudar você no que for necessário."
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
          {[
            { icon: MessageCircle, label: "WhatsApp", href: CHURCH.links.whatsapp },
            { icon: Instagram, label: "Instagram", href: CHURCH.links.instagram },
            { icon: Mail, label: "E-mail", href: CHURCH.links.email },
            { icon: MapPin, label: "Como chegar", href: CHURCH.links.maps },
          ].map((item) => (
            <motion.div key={item.label} variants={itemVariants}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <GlassCard className="p-5 sm:p-6 text-center cursor-pointer hover:scale-[1.02] transition-transform">
                  <div className="flex flex-col items-center gap-3">
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
      </motion.section>

      {/* ── 10. DÍZIMOS E OFERTAS ─────────────────────────────────────────── */}
      <motion.section
        id="contribuir"
        className="container mx-auto px-4 py-16 md:py-24"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <div className="max-w-2xl mx-auto text-center">
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
        </div>
      </motion.section>

      {/* ── 11. FOOTER ────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/30 py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 max-w-4xl mx-auto">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-foreground text-base sm:text-lg mb-2">{CHURCH.name}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm mb-1">{CHURCH.address}</p>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Domingo 9h e 18h · Quarta 20h
              </p>
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
