import { FC, ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface MinistryGlowCardProps {
  title: string;
  description: string[];
  icon?: ReactNode;
}

const MinistryGlowCard: FC<MinistryGlowCardProps> = ({ title, description, icon }) => {
  return (
    <Card className="relative overflow-hidden rounded-xl border border-border/40 bg-card p-0">
      {/* Radial glow mask over grid lines */}
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_left,black_30%,transparent_70%)]">
        <div className="absolute inset-0 flex flex-col justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`h-${i}`} className="w-full border-b border-dashed border-border/20" />
          ))}
        </div>
        <div className="absolute inset-0 flex flex-row justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`v-${i}`} className="h-full border-r border-dashed border-border/20" />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col gap-4">
        {/* Icon with radial glow */}
        <div className="relative">
          <div className="absolute -top-2 -left-2 w-16 h-16 rounded-full bg-church-primary/15 blur-xl" />
          <div className="relative w-10 h-10 rounded-xl bg-church-primary/10 border-church-primary/20 border flex items-center justify-center text-church-primary">
            {icon}
          </div>
        </div>

        <h3 className="text-lg font-bold text-foreground tracking-tight">
          {title}
        </h3>

        <div className="flex flex-col gap-1">
          {description.map((line, idx) => (
            <p key={idx} className="text-sm text-muted-foreground leading-relaxed">
              {line}
            </p>
          ))}
        </div>

        {/* Decorative bottom dots */}
        <div className="flex items-center gap-1.5 pt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-church-primary/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-church-primary/25" />
          <div className="w-1.5 h-1.5 rounded-full bg-church-primary/15" />
        </div>
      </div>

      {/* Corner dots */}
      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-border/40" />
      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-border/40" />
      <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-border/40" />
    </Card>
  );
};

export default MinistryGlowCard;
