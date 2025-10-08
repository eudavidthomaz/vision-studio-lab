import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: 'purple' | 'blue' | 'green' | 'orange' | 'cyan' | 'pink';
  onClick: () => void;
}

const colorStyles = {
  purple: "from-primary/20 to-primary/5 hover:shadow-[0_0_40px_hsl(var(--primary)/0.3)] border-primary/30",
  blue: "from-blue-500/20 to-blue-500/5 hover:shadow-[0_0_40px_hsl(217_91%_60%/0.3)] border-blue-500/30",
  green: "from-green-500/20 to-green-500/5 hover:shadow-[0_0_40px_hsl(142_76%_36%/0.3)] border-green-500/30",
  orange: "from-orange-500/20 to-orange-500/5 hover:shadow-[0_0_40px_hsl(25_95%_53%/0.3)] border-orange-500/30",
  cyan: "from-accent/20 to-accent/5 hover:shadow-[0_0_40px_hsl(var(--accent)/0.3)] border-accent/30",
  pink: "from-pink-500/20 to-pink-500/5 hover:shadow-[0_0_40px_hsl(330_81%_60%/0.3)] border-pink-500/30",
};

const iconColorStyles = {
  purple: "text-primary",
  blue: "text-blue-500",
  green: "text-green-500",
  orange: "text-orange-500",
  cyan: "text-accent",
  pink: "text-pink-500",
};

export const QuickActionCard = ({ icon: Icon, title, description, color, onClick }: QuickActionCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center justify-center p-8 rounded-xl",
        "bg-gradient-to-br border-2 transition-all duration-300",
        "hover:scale-105 hover:-translate-y-1 active:scale-100",
        "min-h-[180px] w-full",
        colorStyles[color]
      )}
    >
      <div className="relative mb-4">
        <Icon 
          className={cn(
            "w-12 h-12 transition-transform duration-300 group-hover:scale-110",
            iconColorStyles[color]
          )} 
        />
        <div className={cn(
          "absolute inset-0 blur-xl opacity-0 group-hover:opacity-50 transition-opacity",
          iconColorStyles[color]
        )} />
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-2 text-center">
        {title}
      </h3>
      
      <p className="text-sm text-muted-foreground text-center">
        {description}
      </p>
    </button>
  );
};
