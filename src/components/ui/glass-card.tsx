import React, { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SparklesCore } from "@/components/ui/sparkles";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "primary" | "red" | "blue" | "cyan";
  as?: "div" | "button";
  onClick?: () => void;
  isStatic?: boolean;
}

const glowColors = {
  primary: {
    spotA: "hsl(263 85% 65% / 0.7)",
    spotB: "hsl(188 95% 50% / 0.7)",
    spotCenter: "hsl(263 70% 50% / 0.7)",
    shadow: "hsl(263 85% 65% / 0.25)",
    particle: "#a855f7",
  },
  red: {
    spotA: "hsl(0 85% 60% / 0.7)",
    spotB: "hsl(20 90% 55% / 0.7)",
    spotCenter: "hsl(0 75% 55% / 0.7)",
    shadow: "hsl(0 85% 60% / 0.25)",
    particle: "#ef4444",
  },
  blue: {
    spotA: "hsl(230 80% 65% / 0.7)",
    spotB: "hsl(200 90% 55% / 0.7)",
    spotCenter: "hsl(230 70% 55% / 0.7)",
    shadow: "hsl(230 80% 65% / 0.25)",
    particle: "#6366f1",
  },
  cyan: {
    spotA: "hsl(188 95% 50% / 0.7)",
    spotB: "hsl(170 85% 45% / 0.7)",
    spotCenter: "hsl(188 85% 50% / 0.7)",
    shadow: "hsl(188 95% 50% / 0.25)",
    particle: "#06b6d4",
  },
};

export function GlassCard({
  children,
  className,
  glowColor = "primary",
  as = "div",
  onClick,
  isStatic = false,
}: GlassCardProps) {
  const colors = glowColors[glowColor];

  // ── Static mode: no motion, no sparkles, no mouse tracking ──
  if (isStatic) {
    const Tag = as === "button" ? "button" : "div";
    return (
      <Tag
        className={cn("relative rounded-2xl overflow-hidden", className)}
        style={{
          backgroundColor: "hsl(var(--card))",
          boxShadow: `0 -10px 80px 5px ${colors.shadow}, 0 0 10px 0 hsl(0 0% 0% / 0.5)`,
        }}
        onClick={onClick}
      >
        {/* Dark base */}
        <div className="absolute inset-0 z-0 bg-background" />

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-30 mix-blend-overlay z-[1] card-noise-layer" />

        {/* Glow spots — static opacity */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2/3 z-[2]"
          style={{
            background: `
              radial-gradient(ellipse at bottom right, ${colors.spotA} -10%, transparent 70%),
              radial-gradient(ellipse at bottom left, ${colors.spotB} -10%, transparent 70%)
            `,
            filter: "blur(40px)",
            opacity: 0.7,
          }}
        />

        {/* Central glow — static */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2/3 z-[3]"
          style={{
            background: `radial-gradient(circle at bottom center, ${colors.spotCenter} -20%, transparent 60%)`,
            filter: "blur(45px)",
            opacity: 0.65,
            transform: "translateY(15%)",
          }}
        />

        {/* Glass reflection — static */}
        <div
          className="absolute inset-0 z-[6] pointer-events-none"
          style={{
            background: "linear-gradient(135deg, hsl(0 0% 100% / 0.08) 0%, transparent 40%, transparent 80%, hsl(0 0% 100% / 0.04) 100%)",
            opacity: 0.5,
          }}
        />

        {/* Content */}
        <div className="relative z-[10]">{children}</div>
      </Tag>
    );
  }

  // ── Animated mode: full effects ──
  return <GlassCardAnimated className={className} glowColor={glowColor} as={as} onClick={onClick} colors={colors}>
    {children}
  </GlassCardAnimated>;
}

// Separate animated component to avoid hooks running in static mode
function GlassCardAnimated({
  children,
  className,
  glowColor,
  as,
  onClick,
  colors,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor: string;
  as: "div" | "button";
  onClick?: () => void;
  colors: typeof glowColors[keyof typeof glowColors];
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotation({
      x: -(y / rect.height) * 5,
      y: (x / rect.width) * 5,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  }, []);

  const MotionTag = as === "button" ? motion.button : motion.div;

  return (
    <MotionTag
      ref={cardRef as any}
      className={cn("relative rounded-2xl overflow-hidden", className)}
      style={{
        transformStyle: "preserve-3d",
        backgroundColor: "hsl(240 10% 5%)",
        boxShadow: `0 -10px 80px 5px ${colors.shadow}, 0 0 10px 0 hsl(0 0% 0% / 0.5)`,
      }}
      initial={{ y: 0 }}
      animate={{
        y: isHovered ? -4 : 0,
        rotateX: rotation.x,
        rotateY: rotation.y,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      {/* Dark base */}
      <div className="absolute inset-0 z-0 bg-background" />

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-30 mix-blend-overlay z-[1] card-noise-layer" />

      {/* Glow spots at bottom */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-2/3 z-[2]"
        style={{
          background: `
            radial-gradient(ellipse at bottom right, ${colors.spotA} -10%, transparent 70%),
            radial-gradient(ellipse at bottom left, ${colors.spotB} -10%, transparent 70%)
          `,
          filter: "blur(40px)",
        }}
        animate={{
          opacity: isHovered ? 0.9 : 0.7,
          y: isHovered ? rotation.x * 0.5 : 0,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      {/* Central glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-2/3 z-[3]"
        style={{
          background: `radial-gradient(circle at bottom center, ${colors.spotCenter} -20%, transparent 60%)`,
          filter: "blur(45px)",
        }}
        animate={{
          opacity: isHovered ? 0.85 : 0.65,
          y: isHovered ? "10%" : "15%",
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      {/* Sparkles particle layer at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] z-[5] pointer-events-none">
        <SparklesCore
          background="transparent"
          minSize={0.6}
          maxSize={1.8}
          particleDensity={35}
          particleColor={colors.particle}
          speed={2}
          className="w-full h-full"
        />
      </div>

      {/* Glass reflection */}
      <motion.div
        className="absolute inset-0 z-[6] pointer-events-none"
        style={{
          background: "linear-gradient(135deg, hsl(0 0% 100% / 0.08) 0%, transparent 40%, transparent 80%, hsl(0 0% 100% / 0.04) 100%)",
        }}
        animate={{
          opacity: isHovered ? 0.7 : 0.5,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      {/* Content */}
      <div className="relative z-[10]">{children}</div>
    </MotionTag>
  );
}
