import { CheckCircle2, Loader2, Cloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AutoSaveIndicatorProps {
  status: "saved" | "saving" | "idle";
  lastSaved?: Date;
}

export default function AutoSaveIndicator({
  status,
  lastSaved,
}: AutoSaveIndicatorProps) {
  const getStatusInfo = () => {
    switch (status) {
      case "saving":
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: "Salvando...",
          variant: "secondary" as const,
        };
      case "saved":
        return {
          icon: <CheckCircle2 className="h-3 w-3" />,
          text: "Salvo",
          variant: "outline" as const,
        };
      default:
        return {
          icon: <Cloud className="h-3 w-3" />,
          text: "Cloud",
          variant: "outline" as const,
        };
    }
  };

  const info = getStatusInfo();

  return (
    <Badge variant={info.variant} className="gap-1 text-xs">
      {info.icon}
      {info.text}
      {status === "saved" && lastSaved && (
        <span className="text-[10px] text-muted-foreground ml-1">
          {new Date(lastSaved).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </Badge>
  );
}
