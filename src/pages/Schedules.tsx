import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Calendar,
  CalendarDays,
  ArrowLeft,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, addWeeks, subWeeks, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useVolunteers, VOLUNTEER_ROLES } from "@/hooks/useVolunteers";
import { useVolunteerSchedules, type VolunteerSchedule, SCHEDULE_STATUSES, type GenerateScheduleRequest } from "@/hooks/useVolunteerSchedules";
import { ScheduleGeneratorModal } from "@/components/schedules/ScheduleGeneratorModal";
import { SmartScheduleModal } from "@/components/schedules/SmartScheduleModal";
import { PendingConfirmationsAlert } from "@/components/schedules/PendingConfirmationsAlert";
import { DroppableDayColumn } from "@/components/schedules/DroppableDayColumn";
import { MonthlyCalendarView } from "@/components/schedules/MonthlyCalendarView";
import { ScheduleExportButton } from "@/components/schedules/ScheduleExportButton";
import { useSmartSchedule, type SmartScheduleRequest, type SmartScheduleResponse } from "@/hooks/useSmartSchedule";

type ViewMode = "week" | "month";

export default function Schedules() {
  const navigate = useNavigate();
  const { listActive } = useVolunteers();

  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
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

  const { createBulk, updateStatus, updateSchedule, remove, removeByDate } = useVolunteerSchedules();
  const schedulesQuery = useVolunteerSchedules().useListByDateRange(startDateStr, endDateStr);
  const { generateSmartSchedule, isLoading: isSmartLoading } = useSmartSchedule();

  // DnD sensors
  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } });
  const sensors = useSensors(pointerSensor, touchSensor);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/auth");
    };
    checkAuth();
  }, [navigate]);

  // Filter + group schedules by date
  const schedulesByDate = useMemo(() => {
    const grouped: Record<string, VolunteerSchedule[]> = {};
    for (let i = 0; i < 7; i++) {
      grouped[format(addDays(currentWeekStart, i), "yyyy-MM-dd")] = [];
    }

    schedulesQuery.data?.forEach((schedule) => {
      if (filterRole !== "all" && schedule.role !== filterRole) return;
      if (filterStatus !== "all" && schedule.status !== filterStatus) return;
      if (grouped[schedule.service_date]) {
        grouped[schedule.service_date].push(schedule);
      }
    });

    return grouped;
  }, [schedulesQuery.data, currentWeekStart, filterRole, filterStatus]);

  const allFilteredSchedules = useMemo(() => Object.values(schedulesByDate).flat(), [schedulesByDate]);

  const getRoleLabel = (value: string) =>
    VOLUNTEER_ROLES.find((r) => r.value === value)?.label || value;

  const handlePrevWeek = () => setCurrentWeekStart((prev) => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentWeekStart((prev) => addWeeks(prev, 1));
  const handleToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));

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

  // Drag and drop handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !active) return;

    const scheduleId = active.id as string;
    const targetDate = over.id as string;
    const schedule = active.data?.current?.schedule as VolunteerSchedule | undefined;

    if (schedule && schedule.service_date !== targetDate) {
      await updateSchedule.mutateAsync({
        id: scheduleId,
        updates: { service_date: targetDate },
      });
    }
  };

  const periodLabel = `Semana: ${format(currentWeekStart, "dd/MM/yyyy")} - ${format(weekEnd, "dd/MM/yyyy")}`;
  const totalSchedules = schedulesQuery.data?.length || 0;
  const hasNoSchedules = !schedulesQuery.isLoading && totalSchedules === 0;

  // Unique roles from data for filter
  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    schedulesQuery.data?.forEach((s) => roles.add(s.role));
    return Array.from(roles);
  }, [schedulesQuery.data]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-primary" />
                  Escalas
                </h1>
                <p className="text-muted-foreground text-sm">Gerencie as escalas de serviço</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <ScheduleExportButton schedules={allFilteredSchedules} periodLabel={periodLabel} />
              <Button variant="outline" onClick={() => navigate("/voluntarios")} className="gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Voluntários</span>
              </Button>
              <Button variant="outline" onClick={() => setShowGeneratorModal(true)} className="gap-2">
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

          {/* View Toggle + Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="week" className="gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Semanal
                </TabsTrigger>
                <TabsTrigger value="month" className="gap-1.5">
                  <CalendarDays className="w-4 h-4" />
                  Mensal
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {viewMode === "week" && (
              <div className="flex gap-2 flex-wrap">
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas funções</SelectItem>
                    {availableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {getRoleLabel(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos status</SelectItem>
                    {SCHEDULE_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Monthly View */}
          {viewMode === "month" && <MonthlyCalendarView />}

          {/* Weekly View */}
          {viewMode === "week" && (
            <>
              {/* Week Navigation */}
              <Card className="mb-6">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="icon" onClick={handlePrevWeek}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-4">
                      <h2 className="text-lg font-semibold text-center">
                        {format(currentWeekStart, "dd 'de' MMMM", { locale: ptBR })} -{" "}
                        {format(weekEnd, "dd 'de' MMMM", { locale: ptBR })}
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

              {/* Empty State */}
              {hasNoSchedules ? (
                <Card className="py-12">
                  <CardContent className="flex flex-col items-center justify-center text-center">
                    <Calendar className="w-16 h-16 text-muted-foreground/40 mb-4" />
                    <h3 className="text-lg font-semibold mb-1">Nenhuma escala nesta semana</h3>
                    <p className="text-muted-foreground text-sm mb-4 max-w-md">
                      Crie uma escala manualmente ou use a IA para gerar automaticamente com base na disponibilidade dos voluntários.
                    </p>
                    <Button
                      onClick={() => setShowSmartModal(true)}
                      className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    >
                      <Sparkles className="w-4 h-4" />
                      Gerar primeira escala
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                /* Schedules Grid with DnD */
                schedulesQuery.isLoading ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(7)].map((_, i) => (
                      <Skeleton key={i} className="h-48" />
                    ))}
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {Object.entries(schedulesByDate).map(([date, schedules]) => (
                        <DroppableDayColumn
                          key={date}
                          date={date}
                          schedules={schedules}
                          onUpdateStatus={handleUpdateStatus}
                          onDeleteSchedule={setDeletingSchedule}
                          onDeleteDate={setDeletingDate}
                        />
                      ))}
                    </div>
                  </DndContext>
                )
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
                        const count = schedulesQuery.data.filter((s) => s.status === status.value).length;
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
            </>
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
          <AlertDialog open={!!deletingSchedule} onOpenChange={(open) => !open && setDeletingSchedule(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover escala?</AlertDialogTitle>
                <AlertDialogDescription>
                  Deseja remover "{deletingSchedule?.volunteers?.name}" da função "
                  {deletingSchedule?.role && getRoleLabel(deletingSchedule.role)}"?
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
          <AlertDialog open={!!deletingDate} onOpenChange={(open) => !open && setDeletingDate(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar escalas do dia?</AlertDialogTitle>
                <AlertDialogDescription>
                  Deseja remover todas as escalas de {deletingDate && format(parseISO(deletingDate), "dd/MM/yyyy")}? Esta
                  ação não pode ser desfeita.
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
    </TooltipProvider>
  );
}
