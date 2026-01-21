import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { User, Calendar, Check, X, TrendingUp, Award } from "lucide-react";
import { VolunteerStats } from "@/hooks/useVolunteerReports";
import { VOLUNTEER_ROLES } from "@/hooks/useVolunteers";
import { cn } from "@/lib/utils";

interface VolunteerStatsCardProps {
  stats: VolunteerStats;
  className?: string;
  compact?: boolean;
}

export function VolunteerStatsCard({ stats, className, compact = false }: VolunteerStatsCardProps) {
  const getRoleLabel = (value: string) => {
    return VOLUNTEER_ROLES.find(r => r.value === value)?.label || value;
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-green-500";
    if (rate >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getAttendanceProgressColor = (rate: number) => {
    if (rate >= 90) return "bg-green-500";
    if (rate >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (compact) {
    return (
      <div className={cn("flex items-center justify-between p-3 rounded-lg bg-muted/50", className)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">{stats.name}</p>
            <p className="text-xs text-muted-foreground">{getRoleLabel(stats.primary_role)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{stats.total_schedules}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Total de escalas</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <div className={cn("flex items-center gap-1", getAttendanceColor(stats.attendance_rate || 0))}>
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{(stats.attendance_rate || 0).toFixed(0)}%</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Taxa de presença</TooltipContent>
          </Tooltip>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{stats.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {getRoleLabel(stats.primary_role)}
                </Badge>
                {stats.ministry && (
                  <span className="text-xs">{stats.ministry}</span>
                )}
              </CardDescription>
            </div>
          </div>
          <Badge variant={stats.is_active ? "default" : "outline"}>
            {stats.is_active ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Attendance Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Taxa de Presença</span>
              <span className={cn("font-medium", getAttendanceColor(stats.attendance_rate || 0))}>
                {(stats.attendance_rate || 0).toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={stats.attendance_rate || 0} 
              className="h-2"
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-2 rounded-lg bg-muted/50">
                  <Calendar className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-semibold">{stats.total_schedules}</p>
                  <p className="text-[10px] text-muted-foreground">Total</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>Total de escalas</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Check className="w-4 h-4 mx-auto mb-1 text-green-500" />
                  <p className="text-lg font-semibold text-green-600">{stats.confirmed_count}</p>
                  <p className="text-[10px] text-muted-foreground">Confirmados</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>Presenças confirmadas</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-2 rounded-lg bg-red-500/10">
                  <X className="w-4 h-4 mx-auto mb-1 text-red-500" />
                  <p className="text-lg font-semibold text-red-600">{stats.absent_count}</p>
                  <p className="text-[10px] text-muted-foreground">Ausências</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>Ausências registradas</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Award className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <p className="text-lg font-semibold text-primary">{stats.roles_count}</p>
                  <p className="text-[10px] text-muted-foreground">Funções</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Funções exercidas: {stats.roles_worked?.map(getRoleLabel).join(", ") || "Nenhuma"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Dates */}
          {(stats.first_schedule || stats.last_schedule) && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              {stats.first_schedule && (
                <span>Primeira escala: {new Date(stats.first_schedule).toLocaleDateString('pt-BR')}</span>
              )}
              {stats.last_schedule && (
                <span>Última escala: {new Date(stats.last_schedule).toLocaleDateString('pt-BR')}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
