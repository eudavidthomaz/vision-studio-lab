import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: number;
  title: string;
  content: string;
  icon: React.ElementType;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({
  timelineData,
}: RadialOrbitalTimelineProps) {
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === containerRef.current) {
        setActiveNodeId(null);
        setAutoRotate(true);
      }
    },
    []
  );

  const toggleItem = useCallback(
    (id: number) => {
      if (activeNodeId === id) {
        setActiveNodeId(null);
        setAutoRotate(true);
      } else {
        setActiveNodeId(id);
        setAutoRotate(false);

        // Center on node
        const nodeIndex = timelineData.findIndex((item) => item.id === id);
        const targetAngle = (nodeIndex / timelineData.length) * 360;
        setRotationAngle(270 - targetAngle);
      }
    },
    [activeNodeId, timelineData]
  );

  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.3) % 360);
    }, 50);
    return () => clearInterval(timer);
  }, [autoRotate]);

  const calculateNodePosition = useCallback(
    (index: number, total: number) => {
      const angle = ((index / total) * 360 + rotationAngle) % 360;
      const radius = 200;
      const radian = (angle * Math.PI) / 180;

      const x = radius * Math.cos(radian);
      const y = radius * Math.sin(radian);
      const zIndex = Math.round(100 + 50 * Math.cos(radian));
      const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));

      return { x, y, zIndex, opacity };
    },
    [rotationAngle]
  );

  return (
    <div>
      {/* ───── Desktop Orbital View ───── */}
      <div
        ref={containerRef}
        className="hidden md:flex items-center justify-center relative"
        style={{ minHeight: 520 }}
        onClick={handleContainerClick}
      >
        {/* Orbit rings */}
        <div className="absolute pointer-events-none">
          <div className="relative" style={{ width: 400, height: 400 }}>
            {[400, 300, 200].map((size) => (
              <div
                key={size}
                className="absolute rounded-full border border-border/20"
                style={{
                  width: size,
                  height: size,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Center dot */}
        <div className="absolute w-3 h-3 rounded-full bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.6)]" />

        {/* Nodes */}
        {timelineData.map((item, index) => {
          const pos = calculateNodePosition(index, timelineData.length);
          const isActive = activeNodeId === item.id;
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              ref={(el) => (nodeRefs.current[item.id] = el)}
              className="absolute transition-all duration-700 cursor-pointer"
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                zIndex: isActive ? 200 : pos.zIndex,
                opacity: isActive ? 1 : pos.opacity,
              }}
              onClick={(e) => {
                e.stopPropagation();
                toggleItem(item.id);
              }}
            >
              {/* Pulse ring */}
              {isActive && (
                <div className="absolute -inset-3 rounded-full border-2 border-primary/50 animate-ping" />
              )}

              {/* Node circle */}
              <div
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
                  "border backdrop-blur-md",
                  isActive
                    ? "bg-primary/20 border-primary shadow-[0_0_30px_hsl(var(--primary)/0.4)] scale-110"
                    : "bg-white/5 border-white/10 hover:border-primary/50 hover:bg-white/10"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive ? "text-primary" : "text-foreground")} />
              </div>

              {/* Label */}
              <div
                className={cn(
                  "absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.title}
              </div>

              {/* Expanded card */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="absolute left-1/2 -translate-x-1/2 top-20 w-72 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="rounded-2xl border border-white/10 bg-background/80 backdrop-blur-xl p-5 shadow-[0_8px_40px_hsl(var(--primary)/0.15)]">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <h4 className="text-sm font-gunterz uppercase text-foreground leading-tight">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ───── Mobile Vertical View ───── */}
      <div className="md:hidden space-y-4">
        {timelineData.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-sm font-gunterz uppercase text-foreground">
                  {item.title}
                </h4>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed pl-[52px]">
                {item.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
