import { cn } from "@/lib/utils";

interface ShapeProps {
  className?: string;
  delay?: string;
  size?: string;
  gradient?: string;
}

function Shape({ className, delay = "0s", size = "w-[400px] h-[100px]", gradient = "from-white/[0.08]" }: ShapeProps) {
  return (
    <div
      className={cn(
        "absolute rounded-3xl blur-3xl opacity-0",
        "bg-gradient-to-r to-transparent",
        size,
        gradient,
        className
      )}
      style={{
        animation: `geo-float 8s ease-in-out infinite, geo-fade-in 1.5s ease-out forwards`,
        animationDelay: delay,
      }}
    />
  );
}

export default function GeometricBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient base overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />

      {/* Shape 1 — top left, large, rotated */}
      <Shape
        className="top-[-10%] left-[-5%] rotate-12"
        size="w-[500px] h-[140px]"
        gradient="from-white/[0.06]"
        delay="0s"
      />

      {/* Shape 2 — center right, primary tint */}
      <Shape
        className="top-[30%] right-[-8%] -rotate-12"
        size="w-[450px] h-[120px]"
        gradient="from-primary/[0.05]"
        delay="0.4s"
      />

      {/* Shape 3 — bottom left, accent tint */}
      <Shape
        className="bottom-[15%] left-[5%] rotate-6"
        size="w-[380px] h-[100px]"
        gradient="from-accent/[0.04]"
        delay="0.8s"
      />

      {/* Shape 4 — top right, subtle */}
      <Shape
        className="top-[10%] right-[15%] -rotate-[20deg]"
        size="w-[300px] h-[80px]"
        gradient="from-white/[0.04]"
        delay="1.2s"
      />

      {/* Shape 5 — bottom center, primary glow */}
      <Shape
        className="bottom-[5%] left-[40%] rotate-[15deg]"
        size="w-[420px] h-[110px]"
        gradient="from-primary/[0.03]"
        delay="1.6s"
      />

      {/* Noise/grain overlay */}
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
