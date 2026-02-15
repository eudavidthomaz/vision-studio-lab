import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreHorizontal, Check, XCircle, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScheduleConfirmationBadge } from "@/components/schedules/ScheduleConfirmationBadge";
import { VOLUNTEER_ROLES } from "@/hooks/useVolunteers";
import type { VolunteerSchedule } from "@/hooks/useVolunteerSchedules";

interface DraggableScheduleCardProps {
  schedule: VolunteerSchedule;
  onUpdateStatus: (schedule: VolunteerSchedule, status: string) => void;
  onDelete: (schedule: VolunteerSchedule) => void;
}

export function DraggableScheduleCard({ schedule, onUpdateStatus, onDelete }: DraggableScheduleCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: schedule.id,
    data: { schedule },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getRoleLabel = (value: string) =>
    VOLUNTEER_ROLES.find((r) => r.value === value)?.label || value;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors ${
        isDragging ? "opacity-50 border-2 border-dashed border-primary shadow-lg z-50" : ""
      }`}
    >
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
          aria-label="Arrastar voluntário"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">
            {schedule.volunteers?.name || "Voluntário"}
          </p>
          <p className="text-xs text-muted-foreground">{getRoleLabel(schedule.role)}</p>
        </div>
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
            <DropdownMenuItem onClick={() => onUpdateStatus(schedule, "confirmed")}>
              <Check className="w-4 h-4 mr-2 text-primary" />
              Confirmar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus(schedule, "absent")}>
              <XCircle className="w-4 h-4 mr-2 text-destructive" />
              Marcar ausência
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus(schedule, "substituted")}>
              <RefreshCw className="w-4 h-4 mr-2 text-muted-foreground" />
              Substituído
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(schedule)} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
