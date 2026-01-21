import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Clock, Send, ChevronDown, ChevronUp } from "lucide-react";
import { useScheduleConfirmation, PendingConfirmation } from "@/hooks/useScheduleConfirmation";
import { VOLUNTEER_ROLES } from "@/hooks/useVolunteers";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PendingConfirmationsAlertProps {
  className?: string;
}

export function PendingConfirmationsAlert({ className }: PendingConfirmationsAlertProps) {
  const { getPendingConfirmations, resendConfirmation } = useScheduleConfirmation();
  const [expanded, setExpanded] = useState(false);

  const pendingList = getPendingConfirmations.data || [];
  const pendingCount = pendingList.length;

  const getRoleLabel = (value: string) => {
    return VOLUNTEER_ROLES.find(r => r.value === value)?.label || value;
  };

  if (getPendingConfirmations.isLoading) {
    return <Skeleton className="h-16 w-full" />;
  }

  if (pendingCount === 0) {
    return null;
  }

  const handleResend = async (scheduleId: string) => {
    await resendConfirmation.mutateAsync(scheduleId);
  };

  return (
    <Alert 
      variant="default" 
      className={cn("border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20", className)}
    >
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="flex items-center justify-between">
        <span className="text-yellow-700 dark:text-yellow-500">
          Confirmações Pendentes
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2"
          onClick={() => setExpanded(!expanded)}
        >
          <Badge variant="secondary" className="mr-2">
            {pendingCount}
          </Badge>
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </AlertTitle>
      
      <AlertDescription className="text-yellow-700/80 dark:text-yellow-500/80">
        {pendingCount} voluntário(s) ainda não confirmaram presença.
      </AlertDescription>

      {expanded && (
        <div className="mt-4 space-y-2">
          {pendingList.map((pending) => (
            <div
              key={pending.schedule_id}
              className="flex items-center justify-between p-3 rounded-lg bg-background/80 border"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{pending.volunteer_name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{getRoleLabel(pending.role)}</span>
                  <span>•</span>
                  <span>{format(parseISO(pending.service_date), "dd/MM", { locale: ptBR })}</span>
                  <span>•</span>
                  <span>{pending.service_name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {pending.days_pending > 2 && (
                  <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-600">
                    <Clock className="w-3 h-3 mr-1" />
                    {pending.days_pending}d
                  </Badge>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => handleResend(pending.schedule_id)}
                  disabled={resendConfirmation.isPending}
                >
                  <Send className="w-3 h-3" />
                  Reenviar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Alert>
  );
}
