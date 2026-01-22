import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Calendar,
  ArrowLeft,
  Users,
  MoreHorizontal,
  Check,
  XCircle,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, addWeeks, subWeeks, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useVolunteers, VOLUNTEER_ROLES } from "@/hooks/useVolunteers";
import { useVolunteerSchedules, VolunteerSchedule, SCHEDULE_STATUSES, GenerateScheduleRequest } from "@/hooks/useVolunteerSchedules";
import { ScheduleGeneratorModal } from "@/components/schedules/ScheduleGeneratorModal";
import { SmartScheduleModal } from "@/components/schedules/SmartScheduleModal";
import { PendingConfirmationsAlert } from "@/components/schedules/PendingConfirmationsAlert";
import { ScheduleConfirmationBadge } from "@/components/schedules/ScheduleConfirmationBadge";
import { useSmartSchedule, SmartScheduleRequest, SmartScheduleResponse } from "@/hooks/useSmartSchedule";

export default function Schedules() {
  const navigate = useNavigate();
  const { listActive } = useVolunteers();
  
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [showSmartModal, setShowSmartModal] = useState(false);
  const [deletingSchedule, setDeletingSchedule] = useState<VolunteerSchedule | null>(null);
  const [deletingDate, setDeletingDate] = useState<string | null>(null);

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
  const startDateStr = format(currentWeekStart, "yyyy-MM-dd");
  const endDateStr = format(weekEnd, "yyyy-MM-dd");

  const { list, createBulk, updateStatus, remove, removeByDate } = useVolunteerSchedules();
  const schedulesQuery = useVolunteerSchedules().useListByDateRange(startDateStr, endDateStr);
  const { generateSmartSchedule, isLoading: isSmartLoading } = useSmartSchedule();

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  // Group schedules by date
  const schedulesByDate = useMemo(() => {
    const grouped: Record<string, VolunteerSchedule[]> = {};
    
    // Initialize all days of the week
    for (let i = 0; i < 7; i++) {
      const date = format(addDays(currentWeekStart, i), "yyyy-MM-dd");
      grouped[date] = [];
    }
    
    // Add schedules to their respective dates
    schedulesQuery.data?.forEach((schedule) => {
      if (grouped[schedule.service_date]) {
        grouped[schedule.service_date].push(schedule);
      }
    });
    
    return grouped;
  }, [schedulesQuery.data, currentWeekStart]);

  const getRoleLabel = (value: string) => {
    return VOLUNTEER_ROLES.find(r => r.value === value)?.label || value;
  };

  const getStatusInfo = (status: string) => {
    return SCHEDULE_STATUSES.find(s => s.value === status) || SCHEDULE_STATUSES[0];
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  };

  const handleToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
  };

  const handleGenerateSchedule = async (request: GenerateScheduleRequest) => {
    await createBulk.mutateAsync(request);
  };

  const handleSmartSchedule = async (request: SmartScheduleRequest): Promise<SmartScheduleResponse> => {
    return await generateSmartSchedule.mutateAsync(request);
  };

  const handleUpdateStatus = async (schedule: VolunteerSchedule, newStatus: string) => {
    await updateStatus.mutateAsync({ id: schedule.id, status: newStatus });
  };

  const handleDeleteSchedule = async () => {
    if (deletingSchedule) {
      await remove.mutateAsync(deletingSchedule.id);
      setDeletingSchedule(null);
    }
  };

  const handleDeleteDateSchedules = async () => {
    if (deletingDate) {
      await removeByDate.mutateAsync(deletingDate);
      setDeletingDate(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                Escalas
              </h1>
              <p className="text-muted-foreground text-sm">
                Gerencie as escalas de serviço
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/voluntarios")}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Voluntários</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowGeneratorModal(true)} 
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Escala</span>
            </Button>
            <Button 
              onClick={() => setShowSmartModal(true)} 
              className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Escala Inteligente</span>
            </Button>
          </div>
        </div>

        {/* Pending Confirmations Alert */}
        <PendingConfirmationsAlert className="mb-6" />

        {/* Week Navigation */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={handlePrevWeek}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-center">
                  {format(currentWeekStart, "dd 'de' MMMM", { locale: ptBR })} - {format(weekEnd, "dd 'de' MMMM", { locale: ptBR })}
                </h2>
                <Button variant="outline" size="sm" onClick={handleToday}>
                  Hoje
                </Button>
              </div>

              <Button variant="outline" size="icon" onClick={handleNextWeek}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schedules Grid */}
        {schedulesQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Object.entries(schedulesByDate).map(([date, schedules]) => {
              const dateObj = parseISO(date);
              const isToday = format(new Date(), "yyyy-MM-dd") === date;
              
              return (
                <Card 
                  key={date} 
                  className={isToday ? "border-primary/50 bg-primary/5" : ""}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base capitalize">
                          {format(dateObj, "EEEE", { locale: ptBR })}
                        </CardTitle>
                        <CardDescription>
                          {format(dateObj, "dd/MM/yyyy")}
                          {isToday && (
                            <Badge variant="default" className="ml-2 text-xs">
                              Hoje
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                      {schedules.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setDeletingDate(date)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Limpar dia
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {schedules.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Sem escalas
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {schedules.map((schedule) => {
                          return (
                            <div
                              key={schedule.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {schedule.volunteers?.name || "Voluntário"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {getRoleLabel(schedule.role)}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <ScheduleConfirmationBadge 
                                  status={schedule.status}
                                  confirmedAt={schedule.confirmed_at}
                                  confirmedBy={schedule.confirmed_by}
                                  size="sm"
                                />
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <MoreHorizontal className="w-3 h-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateStatus(schedule, 'confirmed')}
                                    >
                                      <Check className="w-4 h-4 mr-2 text-primary" />
                                      Confirmar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateStatus(schedule, 'absent')}
                                    >
                                      <XCircle className="w-4 h-4 mr-2 text-destructive" />
                                      Marcar ausência
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateStatus(schedule, 'substituted')}
                                    >
                                      <RefreshCw className="w-4 h-4 mr-2 text-muted-foreground" />
                                      Substituído
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setDeletingSchedule(schedule)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Remover
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Stats */}
        {schedulesQuery.data && schedulesQuery.data.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Resumo da Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {SCHEDULE_STATUSES.map((status) => {
                  const count = schedulesQuery.data.filter(s => s.status === status.value).length;
                  return (
                    <div key={status.value} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${status.color}`} />
                      <span className="text-sm">
                        {status.label}: <strong>{count}</strong>
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generator Modal (Simple) */}
        <ScheduleGeneratorModal
          open={showGeneratorModal}
          onOpenChange={setShowGeneratorModal}
          volunteers={listActive.data || []}
          onSubmit={handleGenerateSchedule}
          isLoading={createBulk.isPending}
        />

        {/* Smart Schedule Modal (AI) */}
        <SmartScheduleModal
          open={showSmartModal}
          onOpenChange={setShowSmartModal}
          volunteers={listActive.data || []}
          onSubmit={handleSmartSchedule}
          isLoading={isSmartLoading}
        />

        {/* Delete Schedule Confirmation */}
        <AlertDialog 
          open={!!deletingSchedule} 
          onOpenChange={(open) => !open && setDeletingSchedule(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover escala?</AlertDialogTitle>
              <AlertDialogDescription>
                Deseja remover "{deletingSchedule?.volunteers?.name}" da função 
                "{deletingSchedule?.role && getRoleLabel(deletingSchedule.role)}"?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSchedule}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Date Schedules Confirmation */}
        <AlertDialog 
          open={!!deletingDate} 
          onOpenChange={(open) => !open && setDeletingDate(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Limpar escalas do dia?</AlertDialogTitle>
              <AlertDialogDescription>
                Deseja remover todas as escalas de {deletingDate && format(parseISO(deletingDate), "dd/MM/yyyy")}?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteDateSchedules}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Limpar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
