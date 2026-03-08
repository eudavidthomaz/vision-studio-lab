import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ width, height }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

export default function GeometricBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e]/[0.3] via-transparent to-[#1a1a2e]/[0.3]" />

      <ElegantShape
        className="top-[-10%] left-[-5%]"
        width={500}
        height={140}
        rotate={12}
        gradient="from-primary/[0.12]"
        delay={0}
      />

      <ElegantShape
        className="top-[30%] right-[-8%]"
        width={450}
        height={120}
        rotate={-12}
        gradient="from-primary/[0.10]"
        delay={0.4}
      />

      <ElegantShape
        className="bottom-[15%] left-[5%]"
        width={380}
        height={100}
        rotate={6}
        gradient="from-accent/[0.08]"
        delay={0.8}
      />

      <ElegantShape
        className="top-[10%] right-[15%]"
        width={300}
        height={80}
        rotate={-20}
        gradient="from-white/[0.07]"
        delay={1.2}
      />

      <ElegantShape
        className="bottom-[5%] left-[40%]"
        width={420}
        height={110}
        rotate={15}
        gradient="from-primary/[0.08]"
        delay={1.6}
      />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />
    </div>
  );
}
