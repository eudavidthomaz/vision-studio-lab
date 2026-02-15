import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScheduleConfirmationBadge } from "@/components/schedules/ScheduleConfirmationBadge";
import { VOLUNTEER_ROLES } from "@/hooks/useVolunteers";
import { useVolunteerSchedules, type VolunteerSchedule } from "@/hooks/useVolunteerSchedules";
import { useIsMobile } from "@/hooks/use-mobile";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function MonthlyCalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const isMobile = useIsMobile();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const startStr = format(calendarStart, "yyyy-MM-dd");
  const endStr = format(calendarEnd, "yyyy-MM-dd");

  const { useListByDateRange } = useVolunteerSchedules();
  const schedulesQuery = useListByDateRange(startStr, endStr);

  const schedulesByDate = useMemo(() => {
    const map: Record<string, VolunteerSchedule[]> = {};
    schedulesQuery.data?.forEach((s) => {
      if (!map[s.service_date]) map[s.service_date] = [];
      map[s.service_date].push(s);
    });
    return map;
  }, [schedulesQuery.data]);

  // Build calendar grid
  const weeks = useMemo(() => {
    const rows: Date[][] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      rows.push(week);
    }
    return rows;
  }, [calendarStart, calendarEnd]);

  const getRoleLabel = (value: string) =>
    VOLUNTEER_ROLES.find((r) => r.value === value)?.label || value;

  return (
    <Card>
      <CardContent className="pt-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth((m) => subMonths(m, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Hoje
            </Button>
          </div>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="text-center text-xs font-medium text-muted-foreground py-1">
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {weeks.flat().map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const daySchedules = schedulesByDate[dateStr] || [];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const hasSchedules = daySchedules.length > 0;

            return (
              <Popover key={dateStr}>
                <PopoverTrigger asChild>
                  <button
                    className={`relative flex flex-col items-center justify-start rounded-md p-1 min-h-[3rem] md:min-h-[4rem] transition-colors text-left w-full
                      ${!isCurrentMonth ? "text-muted-foreground/40" : ""}
                      ${isToday ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted"}
                      ${hasSchedules ? "cursor-pointer" : "cursor-default"}
                    `}
                    disabled={!hasSchedules}
                  >
                    <span className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>
                      {format(day, "d")}
                    </span>
                    {hasSchedules && (
                      isMobile ? (
                        <div className="flex gap-0.5 mt-0.5">
                          {daySchedules.slice(0, 3).map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" />
                          ))}
                          {daySchedules.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">+</span>
                          )}
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] px-1 py-0 mt-0.5">
                          {daySchedules.length} escalado{daySchedules.length > 1 ? "s" : ""}
                        </Badge>
                      )
                    )}
                  </button>
                </PopoverTrigger>
                {hasSchedules && (
                  <PopoverContent className="w-72 p-3" align="center">
                    <h4 className="font-semibold text-sm mb-2 capitalize">
                      {format(day, "EEEE, dd/MM", { locale: ptBR })}
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {daySchedules.map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-1.5 rounded bg-muted/50">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{s.volunteers?.name || "Voluntário"}</p>
                            <p className="text-xs text-muted-foreground">{getRoleLabel(s.role)}</p>
                          </div>
                          <ScheduleConfirmationBadge
                            status={s.status}
                            confirmedAt={s.confirmed_at}
                            confirmedBy={s.confirmed_by}
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                )}
              </Popover>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
