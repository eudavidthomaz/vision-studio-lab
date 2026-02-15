import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DraggableScheduleCard } from "./DraggableScheduleCard";
import type { VolunteerSchedule } from "@/hooks/useVolunteerSchedules";

interface DroppableDayColumnProps {
  date: string;
  schedules: VolunteerSchedule[];
  onUpdateStatus: (schedule: VolunteerSchedule, status: string) => void;
  onDeleteSchedule: (schedule: VolunteerSchedule) => void;
  onDeleteDate: (date: string) => void;
}

export function DroppableDayColumn({
  date,
  schedules,
  onUpdateStatus,
  onDeleteSchedule,
  onDeleteDate,
}: DroppableDayColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: date });
  const dateObj = parseISO(date);
  const isToday = format(new Date(), "yyyy-MM-dd") === date;

  const confirmedCount = schedules.filter((s) => s.status === "confirmed").length;
  const confirmPercent = schedules.length > 0 ? Math.round((confirmedCount / schedules.length) * 100) : 0;

  return (
    <Card
      ref={setNodeRef}
      className={`transition-all ${isToday ? "border-primary/50 bg-primary/5" : ""} ${
        isOver ? "ring-2 ring-primary ring-offset-2 bg-primary/10" : ""
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base capitalize">
              {format(dateObj, "EEEE", { locale: ptBR })}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{format(dateObj, "dd/MM/yyyy")}</span>
              {isToday && (
                <Badge variant="default" className="text-xs">
                  Hoje
                </Badge>
              )}
            </div>
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
                  onClick={() => onDeleteDate(date)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar dia
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {schedules.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="pt-1">
                <Progress value={confirmPercent} className="h-1.5" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{confirmedCount}/{schedules.length} confirmados ({confirmPercent}%)</p>
            </TooltipContent>
          </Tooltip>
        )}
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Sem escalas</p>
        ) : (
          <SortableContext items={schedules.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {schedules.map((schedule) => (
                <DraggableScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  onUpdateStatus={onUpdateStatus}
                  onDelete={onDeleteSchedule}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </CardContent>
    </Card>
  );
}
