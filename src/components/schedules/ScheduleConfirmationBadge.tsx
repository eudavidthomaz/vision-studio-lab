import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Clock, X, RefreshCw, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ConfirmationStatus = 'scheduled' | 'confirmed' | 'absent' | 'substituted' | string;

interface ScheduleConfirmationBadgeProps {
  status: ConfirmationStatus;
  confirmedAt?: string | null;
  confirmedBy?: string | null;
  showTooltip?: boolean;
  size?: "sm" | "default";
  className?: string;
}

const statusConfig: Record<string, {
  label: string;
  icon: React.ReactNode;
  variant: "default" | "secondary" | "outline" | "destructive";
  className: string;
}> = {
  scheduled: {
    label: "Aguardando",
    icon: <Clock className="w-3 h-3" />,
    variant: "outline",
    className: "border-blue-500/50 text-blue-600",
  },
  confirmed: {
    label: "Confirmado",
    icon: <Check className="w-3 h-3" />,
    variant: "outline",
    className: "border-green-500/50 text-green-600 bg-green-50 dark:bg-green-950/20",
  },
  absent: {
    label: "Ausente",
    icon: <X className="w-3 h-3" />,
    variant: "destructive",
    className: "",
  },
  substituted: {
    label: "Substituído",
    icon: <RefreshCw className="w-3 h-3" />,
    variant: "outline",
    className: "border-yellow-500/50 text-yellow-600",
  },
};

export function ScheduleConfirmationBadge({
  status,
  confirmedAt,
  confirmedBy,
  showTooltip = true,
  size = "default",
  className,
}: ScheduleConfirmationBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    icon: <HelpCircle className="w-3 h-3" />,
    variant: "outline" as const,
    className: "",
  };

  const sizeClasses = size === "sm" ? "text-[10px] py-0 px-1.5" : "text-xs";

  const badge = (
    <Badge
      variant={config.variant}
      className={cn(
        "gap-1",
        sizeClasses,
        config.className,
        className
      )}
    >
      {config.icon}
      {config.label}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  const tooltipContent = [];
  if (confirmedAt) {
    tooltipContent.push(`Confirmado em: ${new Date(confirmedAt).toLocaleString('pt-BR')}`);
  }
  if (confirmedBy) {
    tooltipContent.push(`Por: ${confirmedBy}`);
  }

  if (tooltipContent.length === 0) {
    tooltipContent.push(config.label);
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badge}
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1">
          {tooltipContent.map((line, i) => (
            <p key={i} className="text-xs">{line}</p>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
