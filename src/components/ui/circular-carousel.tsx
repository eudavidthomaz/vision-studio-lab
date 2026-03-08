import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export interface CarouselSlideItem {
  id: number;
  titulo: string;
  conteudo: string;
  chamada_para_acao?: string;
}

interface CircularCarousel3DProps {
  items: CarouselSlideItem[];
  radius?: number;
  autoRotateSpeed?: number;
  onItemClick?: (item: CarouselSlideItem, index: number) => void;
  className?: string;
}

export function CircularCarousel3D({
  items,
  radius: radiusProp,
  autoRotateSpeed = 0.08,
  onItemClick,
  className,
}: CircularCarousel3DProps) {
  const isMobile = useIsMobile();
  const radius = radiusProp ?? (isMobile ? 300 : 450);
  const cardW = isMobile ? 220 : 280;
  const cardH = isMobile ? 300 : 380;

  const [rotation, setRotation] = useState(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startRotation = useRef(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const inertiaFrame = useRef<number | null>(null);
  const autoFrame = useRef<number | null>(null);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const [isIdle, setIsIdle] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const anglePerItem = 360 / items.length;

  // Sensitivity: degrees per pixel of drag
  const sensitivity = isMobile ? 0.35 : 0.25;

  const stopInertia = useCallback(() => {
    if (inertiaFrame.current) {
      cancelAnimationFrame(inertiaFrame.current);
      inertiaFrame.current = null;
    }
  }, []);

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIsIdle(true), 3000);
  }, []);

  // Pointer handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      startX.current = e.clientX;
      startRotation.current = rotation;
      lastX.current = e.clientX;
      lastTime.current = Date.now();
      velocity.current = 0;
      stopInertia();
      resetIdleTimer();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [rotation, stopInertia, resetIdleTimer]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      const now = Date.now();
      const dt = now - lastTime.current;
      const dx = e.clientX - lastX.current;

      if (dt > 0) {
        velocity.current = (dx * sensitivity) / (dt / 16);
      }

      lastX.current = e.clientX;
      lastTime.current = now;

      const totalDx = e.clientX - startX.current;
      setRotation(startRotation.current + totalDx * sensitivity);
    },
    [sensitivity]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;

      // Was it a click (small movement)?
      const totalDx = Math.abs(e.clientX - startX.current);
      if (totalDx < 5 && onItemClick) {
        // Find the front-most item
        const normalizedRot = ((rotation % 360) + 360) % 360;
        let closestIdx = 0;
        let closestDist = Infinity;
        items.forEach((_, i) => {
          const itemAngle = (i * anglePerItem) % 360;
          const diff = Math.abs(normalizedRot - (360 - itemAngle)) % 360;
          const dist = Math.min(diff, 360 - diff);
          if (dist < closestDist) {
            closestDist = dist;
            closestIdx = i;
          }
        });
        onItemClick(items[closestIdx], closestIdx);
        return;
      }

      // Apply inertia
      let vel = velocity.current;
      const decay = 0.95;
      const minVel = 0.05;

      const step = () => {
        vel *= decay;
        if (Math.abs(vel) < minVel) {
          inertiaFrame.current = null;
          return;
        }
        setRotation((prev) => prev + vel);
        inertiaFrame.current = requestAnimationFrame(step);
      };
      inertiaFrame.current = requestAnimationFrame(step);
      resetIdleTimer();
    },
    [rotation, items, anglePerItem, onItemClick, resetIdleTimer]
  );

  // Auto-rotation when idle
  useEffect(() => {
    if (!isIdle) {
      if (autoFrame.current) cancelAnimationFrame(autoFrame.current);
      return;
    }
    const autoRotate = () => {
      setRotation((prev) => prev + autoRotateSpeed);
      autoFrame.current = requestAnimationFrame(autoRotate);
    };
    autoFrame.current = requestAnimationFrame(autoRotate);
    return () => {
      if (autoFrame.current) cancelAnimationFrame(autoFrame.current);
    };
  }, [isIdle, autoRotateSpeed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopInertia();
      if (autoFrame.current) cancelAnimationFrame(autoFrame.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [stopInertia]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full select-none touch-none cursor-grab active:cursor-grabbing",
        className
      )}
      style={{
        height: cardH + 60,
        perspective: "2000px",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className="absolute w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${rotation}deg)`,
          left: "50%",
          top: "50%",
          marginLeft: -(cardW / 2),
          marginTop: -(cardH / 2),
          width: cardW,
          height: cardH,
        }}
      >
        {items.map((item, i) => {
          const itemAngle = i * anglePerItem;
          // Calculate opacity based on facing direction
          const totalRot = ((rotation % 360) + 360) % 360;
          const relAngle = ((itemAngle + totalRot + 360) % 360);
          const normAngle = relAngle > 180 ? 360 - relAngle : relAngle;
          const opacity = Math.max(0.25, 1 - normAngle / 180);
          const isFront = normAngle < 40;

          return (
            <div
              key={item.id}
              className="absolute"
              style={{
                width: cardW,
                height: cardH,
                transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                opacity,
                transition: "opacity 0.2s linear",
                backfaceVisibility: "hidden",
              }}
            >
              <div
                className={cn(
                  "relative w-full h-full rounded-2xl overflow-hidden",
                  "border transition-all duration-300",
                  isFront
                    ? "border-primary/40 shadow-[0_0_30px_hsl(var(--primary)/0.15)]"
                    : "border-white/[0.08]"
                )}
                style={{
                  background:
                    "linear-gradient(180deg, hsl(var(--card)) 0%, hsl(230 25% 8%) 100%)",
                }}
              >
                {/* Noise overlay */}
                <div className="card-noise-layer absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none z-[1]" />

                {/* Bottom glow */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/3 rounded-full blur-3xl pointer-events-none z-0 carousel-glow-pulse"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, hsl(var(--primary) / 0.25) 0%, transparent 70%)",
                  }}
                />

                {/* Side glow lines */}
                <div
                  className="absolute left-0 top-1/4 bottom-1/4 w-px pointer-events-none z-[2]"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.3), transparent)",
                  }}
                />
                <div
                  className="absolute right-0 top-1/4 bottom-1/4 w-px pointer-events-none z-[2]"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.3), transparent)",
                  }}
                />

                {/* Bottom border glow */}
                <div
                  className="absolute bottom-0 left-1/4 right-1/4 h-px pointer-events-none z-[2]"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, hsl(var(--primary) / 0.5), transparent)",
                  }}
                />

                {/* Content */}
                <div className="relative z-[3] flex flex-col h-full p-5">
                  {/* Card number badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-primary-foreground"
                      style={{
                        background:
                          "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))",
                      }}
                    >
                      {item.id}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                      Card
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 mb-3">
                    {item.titulo}
                  </h3>

                  {/* Body text (truncated) */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-6 flex-1">
                    {item.conteudo}
                  </p>

                  {/* CTA */}
                  {item.chamada_para_acao && (
                    <p className="text-xs font-medium text-primary mt-3 pt-3 border-t border-primary/20 line-clamp-2">
                      {item.chamada_para_acao}
                    </p>
                  )}

                  {/* Tap hint on front card */}
                  {isFront && (
                    <span className="text-[10px] text-muted-foreground/60 text-center mt-2 animate-pulse">
                      Toque para expandir
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drag hint */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center pointer-events-none">
        <span className="text-[11px] text-muted-foreground/50">
          ← Arraste para girar →
        </span>
      </div>
    </div>
  );
}
