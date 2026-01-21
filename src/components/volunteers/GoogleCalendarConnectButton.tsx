import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Calendar, Link2, Unlink, RefreshCw } from "lucide-react";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { cn } from "@/lib/utils";

interface GoogleCalendarConnectButtonProps {
  volunteerId: string;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "default" | "lg";
}

export function GoogleCalendarConnectButton({
  volunteerId,
  className,
  showLabel = true,
  size = "default",
}: GoogleCalendarConnectButtonProps) {
  const {
    connectionStatus,
    initiateAuth,
    disconnect,
    refreshToken,
    isConnected,
  } = useGoogleCalendar(volunteerId);

  const isLoading = connectionStatus.isLoading || 
    initiateAuth.isPending || 
    disconnect.isPending || 
    refreshToken.isPending;

  const tokenExpired = connectionStatus.data?.token_expiry && 
    new Date(connectionStatus.data.token_expiry) < new Date();

  const handleConnect = () => {
    initiateAuth.mutate({ volunteer_id: volunteerId });
  };

  const handleDisconnect = () => {
    disconnect.mutate({ volunteer_id: volunteerId });
  };

  const handleRefresh = () => {
    refreshToken.mutate({ volunteer_id: volunteerId });
  };

  if (isLoading) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={cn("gap-2", className)}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        {showLabel && "Carregando..."}
      </Button>
    );
  }

  if (isConnected && !tokenExpired) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="gap-1.5 py-1 px-2">
              <Calendar className="w-3 h-3 text-green-500" />
              {showLabel && (
                <span className="text-xs">
                  {connectionStatus.data?.email || "Google Calendar"}
                </span>
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            Calendário conectado
          </TooltipContent>
        </Tooltip>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleDisconnect}
        >
          <Unlink className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
      </div>
    );
  }

  if (isConnected && tokenExpired) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge variant="outline" className="gap-1.5 py-1 px-2 border-yellow-500/50 text-yellow-600">
          <Calendar className="w-3 h-3" />
          {showLabel && <span className="text-xs">Token expirado</span>}
        </Badge>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleRefresh}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleConnect}
      className={cn("gap-2", className)}
    >
      <Link2 className="w-4 h-4" />
      {showLabel && "Conectar Google Calendar"}
    </Button>
  );
}
