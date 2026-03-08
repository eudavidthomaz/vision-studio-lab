import React from "react";
import { motion } from "framer-motion";
import { Mic, Sparkles, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import logoIdeon from "@/assets/logo-ideon.png";

const steps = [
  {
    icon: Mic,
    label: "PASSO 1",
    title: "Envie sua pregação",
    description:
      "Grave ao vivo ou faça upload. A IA transcreve e mapeia versículos, temas e aplicações.",
  },
  {
    icon: Sparkles,
    label: "PASSO 2",
    title: "Receba o pack completo",
    description:
      "Em minutos: posts, stories, carrosséis, roteiros de vídeo, estudo bíblico e mais — tudo fiel à Palavra.",
  },
  {
    icon: Calendar,
    label: "PASSO 3",
    title: "Organize e publique",
    description:
      "Ajuste o tom, escolha os dias e exporte. Sua equipe de mídia começa a semana pronta.",
  },
];

const ease = [0, 0, 0.2, 1] as [number, number, number, number];

const HowItWorksEngine = () => {
  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* ───── DESKTOP: SVG Diagram ───── */}
      <div className="hidden md:block relative" style={{ height: 520 }}>
        {/* SVG layer */}
        <svg
          viewBox="0 0 900 520"
          fill="none"
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradient for paths */}
            <linearGradient id="path-grad-1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="path-grad-2" x1="0.5" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="path-grad-3" x1="0.5" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            </linearGradient>
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Path: Step 1 (top) → Center */}
          <path
            id="flow-1"
            d="M 450 70 C 450 130, 450 170, 450 210"
            stroke="url(#path-grad-1)"
            strokeWidth="2"
            strokeDasharray="6 4"
            fill="none"
          />
          {/* Light dot on path 1 */}
          <circle r="4" fill="hsl(var(--primary))" filter="url(#glow)">
            <animateMotion dur="2.5s" repeatCount="indefinite">
              <mpath href="#flow-1" />
            </animateMotion>
          </circle>

          {/* Path: Center → Step 2 (bottom-left) */}
          <path
            id="flow-2"
            d="M 400 330 C 370 380, 300 420, 230 450"
            stroke="url(#path-grad-2)"
            strokeWidth="2"
            strokeDasharray="6 4"
            fill="none"
          />
          <circle r="4" fill="hsl(var(--primary))" filter="url(#glow)">
            <animateMotion dur="2.5s" repeatCount="indefinite" begin="0.8s">
              <mpath href="#flow-2" />
            </animateMotion>
          </circle>

          {/* Path: Center → Step 3 (bottom-right) */}
          <path
            id="flow-3"
            d="M 500 330 C 530 380, 600 420, 670 450"
            stroke="url(#path-grad-3)"
            strokeWidth="2"
            strokeDasharray="6 4"
            fill="none"
          />
          <circle r="4" fill="hsl(var(--primary))" filter="url(#glow)">
            <animateMotion dur="2.5s" repeatCount="indefinite" begin="1.6s">
              <mpath href="#flow-3" />
            </animateMotion>
          </circle>
        </svg>

        {/* HTML overlays */}
        {/* ── Step 1 Badge (top center) ── */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-0 w-[260px]"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: ease as unknown as number[] }}
        >
          <StepBadge step={steps[0]} index={0} />
        </motion.div>

        {/* ── Central Engine ── */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-[200px] w-[220px]"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: ease as unknown as number[] }}
        >
          <CentralEngine />
        </motion.div>

        {/* ── Step 2 Badge (bottom-left) ── */}
        <motion.div
          className="absolute left-[8%] lg:left-[12%] bottom-0 w-[260px]"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4, ease: ease as unknown as number[] }}
        >
          <StepBadge step={steps[1]} index={1} />
        </motion.div>

        {/* ── Step 3 Badge (bottom-right) ── */}
        <motion.div
          className="absolute right-[8%] lg:right-[12%] bottom-0 w-[260px]"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6, ease: ease as unknown as number[] }}
        >
          <StepBadge step={steps[2]} index={2} />
        </motion.div>
      </div>

      {/* ───── MOBILE: Vertical Timeline ───── */}
      <div className="md:hidden space-y-0">
        {/* Central engine first on mobile */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <CentralEngine />
        </motion.div>

        <div className="relative pl-8 ml-4">
          {/* Vertical spine */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="relative pb-8 last:pb-0"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              {/* Node dot */}
              <div className="absolute left-[-8px] top-2 w-4 h-4 rounded-full border-2 border-primary bg-background shadow-[0_0_10px_hsl(var(--primary)/0.5)]" />
              <StepBadge step={step} index={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Sub-components ─── */

interface StepBadgeProps {
  step: (typeof steps)[number];
  index: number;
}

const StepBadge = ({ step, index }: StepBadgeProps) => {
  const Icon = step.icon;
  return (
    <div className="rounded-2xl border border-border/30 backdrop-blur-md bg-card/60 p-5 transition-all hover:border-primary/40 hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)]">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className="text-xs font-bold text-primary tracking-wider">
          {step.label}
        </span>
      </div>
      <h4 className="text-base font-gunterz uppercase text-foreground mb-1.5">
        {step.title}
      </h4>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {step.description}
      </p>
    </div>
  );
};

const CentralEngine = () => {
  return (
    <div className="relative flex flex-col items-center">
      {/* Pulsing ring */}
      <div className="absolute inset-0 -m-3 rounded-2xl animate-pulse opacity-30 bg-primary/20 blur-xl" />

      <div className="relative rounded-2xl border border-primary/30 backdrop-blur-md bg-card/80 p-6 flex flex-col items-center gap-3 shadow-[0_0_40px_hsl(var(--primary)/0.15)]">
        <img
          src={logoIdeon}
          alt="Ide.On"
          className="w-12 h-12 rounded-xl object-contain"
        />
        <span className="text-sm font-gunterz uppercase text-primary tracking-wide text-center">
          Motor de IA Bíblica
        </span>
      </div>
    </div>
  );
};

export default HowItWorksEngine;
