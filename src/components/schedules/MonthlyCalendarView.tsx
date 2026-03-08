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
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScheduleConfirmationBadge } from "@/components/schedules/ScheduleConfirmationBadge";
import { VOLUNTEER_ROLES } from "@/hooks/useVolunteers";
import { useVolunteerSchedules, type VolunteerSchedule } from "@/hooks/useVolunteerSchedules";
import { useIsMobile } from "@/hooks/use-mobile";

const WEEKDAY_LABELS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

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
    <div className="relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-5 md:p-6 overflow-hidden">
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIxIi8+PC9zdmc+')] rounded-2xl" />

      {/* Month navigation */}
      <div className="relative flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-3">
          <h2 className="font-gunterz text-lg md:text-xl tracking-wide capitalize text-foreground">
            {format(currentMonth, "MMMM", { locale: ptBR })}
            <span className="text-muted-foreground/60 ml-2 font-normal text-base">
              {format(currentMonth, "yyyy")}
            </span>
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground h-7 px-3 rounded-lg"
            onClick={() => setCurrentMonth(new Date())}
          >
            Hoje
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="relative grid grid-cols-7 gap-1 mb-2">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-[11px] tracking-wider font-medium text-muted-foreground/60 py-1"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="relative grid grid-cols-7 gap-1">
        {weeks.flat().map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const daySchedules = schedulesByDate[dateStr] || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const hasSchedules = daySchedules.length > 0;

          const dayContent = (
            <button
              className={`
                relative flex flex-col items-center justify-center rounded-xl
                min-h-[2.75rem] md:min-h-[3.5rem] w-full transition-all duration-200
                ${!isCurrentMonth ? "opacity-20" : ""}
                ${hasSchedules && isCurrentMonth ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : ""}
                ${isToday && !hasSchedules ? "ring-2 ring-primary/50 ring-offset-1 ring-offset-background" : ""}
                ${!hasSchedules && isCurrentMonth ? "hover:bg-white/[0.05] text-muted-foreground" : ""}
                ${hasSchedules ? "cursor-pointer" : "cursor-default"}
              `}
              disabled={!hasSchedules}
            >
              <span
                className={`
                  text-sm font-medium
                  ${isToday && !hasSchedules ? "text-primary" : ""}
                  ${hasSchedules && isCurrentMonth ? "text-primary-foreground" : ""}
                `}
              >
                {format(day, "d")}
              </span>

              {hasSchedules && isCurrentMonth && (
                isMobile ? (
                  <div className="flex gap-0.5 mt-0.5">
                    {daySchedules.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-primary-foreground/70" />
                    ))}
                    {daySchedules.length > 3 && (
                      <span className="text-[8px] text-primary-foreground/60">+</span>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] font-medium text-primary-foreground/80 mt-0.5">
                    {daySchedules.length}
                  </span>
                )
              )}
            </button>
          );

          if (!hasSchedules) {
            return <div key={dateStr}>{dayContent}</div>;
          }

          return (
            <Popover key={dateStr}>
              <PopoverTrigger asChild>{dayContent}</PopoverTrigger>
              <PopoverContent
                className="w-72 p-3 bg-background/80 backdrop-blur-xl border-white/[0.1] rounded-xl shadow-xl"
                align="center"
              >
                <h4 className="font-semibold text-sm mb-2 capitalize">
                  {format(day, "EEEE, dd/MM", { locale: ptBR })}
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {daySchedules.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {s.volunteers?.name || "Voluntário"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getRoleLabel(s.role)}
                        </p>
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
            </Popover>
          );
        })}
      </div>
    </div>
  );
}
