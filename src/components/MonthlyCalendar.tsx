import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentItem {
  id: string;
  titulo: string;
  tipo: string;
  dia_sugerido: string;
  imagem_url?: string;
}

interface MonthlyCalendarProps {
  contentByDay: Record<string, ContentItem[]>;
  onDayClick: (day: string) => void;
}

const daysOfWeekMap: Record<string, number> = {
  "Domingo": 0,
  "Segunda": 1,
  "Terça": 2,
  "Quarta": 3,
  "Quinta": 4,
  "Sexta": 5,
  "Sábado": 6,
};

export default function MonthlyCalendar({ contentByDay, onDayClick }: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const getDayName = (date: Date): string => {
    const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    return dayNames[date.getDay()];
  };

  const getContentForDate = (date: Date): ContentItem[] => {
    const dayName = getDayName(date);
    return contentByDay[dayName] || [];
  };

  const getDensityColor = (count: number): string => {
    if (count === 0) return "bg-muted";
    if (count <= 2) return "bg-yellow-500/20 border-yellow-500/30";
    if (count <= 4) return "bg-green-500/20 border-green-500/30";
    return "bg-blue-500/20 border-blue-500/30";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoje
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day) => {
            const dayContent = getContentForDate(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const dayName = getDayName(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => onDayClick(dayName)}
                className={cn(
                  "min-h-24 p-2 rounded-lg border-2 transition-all hover:border-primary",
                  getDensityColor(dayContent.length),
                  !isCurrentMonth && "opacity-40",
                  isToday && "ring-2 ring-primary"
                )}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className={cn(
                    "text-sm font-medium",
                    isToday && "text-primary font-bold"
                  )}>
                    {format(day, "d")}
                  </span>
                  
                  {dayContent.length > 0 && (
                    <div className="w-full space-y-1">
                      <Badge variant="secondary" className="text-xs">
                        {dayContent.length} {dayContent.length === 1 ? "post" : "posts"}
                      </Badge>
                      {dayContent.slice(0, 2).map((content) => (
                        <div
                          key={content.id}
                          className="text-xs truncate text-left w-full text-muted-foreground"
                        >
                          {content.titulo}
                        </div>
                      ))}
                      {dayContent.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayContent.length - 2} mais
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-muted-foreground font-medium">Legenda de Densidade:</span>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-muted border" />
            <span>Vazio (0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-yellow-500/20 border border-yellow-500/30" />
            <span>Baixo (1-2)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-green-500/20 border border-green-500/30" />
            <span>Médio (3-4)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-500/20 border border-blue-500/30" />
            <span>Alto (5+)</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
