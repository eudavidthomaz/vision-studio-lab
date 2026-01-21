import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Calendar, Check, X, HelpCircle } from "lucide-react";
import { useGoogleCalendar, CalendarAvailability } from "@/hooks/useGoogleCalendar";
import { cn } from "@/lib/utils";

interface VolunteerAvailabilityBadgeProps {
  volunteerId: string;
  availability?: CalendarAvailability;
  isLoading?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export function VolunteerAvailabilityBadge({
  volunteerId,
  availability,
  isLoading = false,
  showTooltip = true,
  className,
}: VolunteerAvailabilityBadgeProps) {
  const { isConnected } = useGoogleCalendar(volunteerId);

  if (isLoading) {
    return (
      <Badge variant="outline" className={cn("gap-1", className)}>
        <Loader2 className="w-3 h-3 animate-spin" />
        <span className="text-xs">Verificando...</span>
      </Badge>
    );
  }

  // Not connected to Google Calendar
  if (!isConnected && !availability) {
    if (!showTooltip) {
      return (
        <Badge variant="outline" className={cn("gap-1 opacity-50", className)}>
          <Calendar className="w-3 h-3" />
          <span className="text-xs">Sem calendário</span>
        </Badge>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className={cn("gap-1 opacity-50 cursor-help", className)}>
            <HelpCircle className="w-3 h-3" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Calendário não conectado</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Has availability data
  if (availability) {
    if (availability.error) {
      return (
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className={cn("gap-1 border-yellow-500/50 text-yellow-600", className)}>
              <HelpCircle className="w-3 h-3" />
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Erro ao verificar: {availability.error}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    if (!availability.is_connected) {
      return (
        <Badge variant="outline" className={cn("gap-1 opacity-50", className)}>
          <Calendar className="w-3 h-3" />
        </Badge>
      );
    }

    if (availability.available) {
      const content = (
        <Badge variant="outline" className={cn("gap-1 border-green-500/50 text-green-600", className)}>
          <Check className="w-3 h-3" />
          {!showTooltip && <span className="text-xs">Disponível</span>}
        </Badge>
      );

      if (!showTooltip) return content;

      return (
        <Tooltip>
          <TooltipTrigger>{content}</TooltipTrigger>
          <TooltipContent>
            <p>Disponível no horário</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    // Not available - has busy slots
    const content = (
      <Badge variant="outline" className={cn("gap-1 border-red-500/50 text-red-600", className)}>
        <X className="w-3 h-3" />
        {!showTooltip && <span className="text-xs">Ocupado</span>}
      </Badge>
    );

    if (!showTooltip) return content;

    return (
      <Tooltip>
        <TooltipTrigger>{content}</TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">Ocupado no horário</p>
            {availability.busy_slots.slice(0, 3).map((slot, i) => (
              <p key={i} className="text-xs opacity-80">
                {slot.summary || 'Compromisso'}: {slot.start} - {slot.end}
              </p>
            ))}
            {availability.busy_slots.length > 3 && (
              <p className="text-xs opacity-60">
                +{availability.busy_slots.length - 3} mais
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Connected but no availability check done yet
  return (
    <Badge variant="outline" className={cn("gap-1", className)}>
      <Calendar className="w-3 h-3 text-green-500" />
    </Badge>
  );
}
