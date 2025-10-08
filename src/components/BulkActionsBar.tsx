import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Move, Trash2, Archive, Star, Tag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkMove: (targetDay: string) => void;
  onBulkDelete: () => void;
  onBulkArchive: () => void;
  onBulkFavorite: () => void;
  onBulkTag: () => void;
  days: { day: string; pilar: string }[];
}

export default function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onBulkMove,
  onBulkDelete,
  onBulkArchive,
  onBulkFavorite,
  onBulkTag,
  days,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-card border border-border rounded-full shadow-2xl px-6 py-3 flex items-center gap-4 backdrop-blur-xl">
        <Badge variant="secondary" className="rounded-full">
          {selectedCount} selecionado{selectedCount > 1 ? "s" : ""}
        </Badge>

        <div className="h-6 w-px bg-border" />

        <Select onValueChange={onBulkMove}>
          <SelectTrigger className="w-[140px] h-8 rounded-full border-0 bg-muted hover:bg-muted/80">
            <Move className="h-3.5 w-3.5 mr-1" />
            <SelectValue placeholder="Mover" />
          </SelectTrigger>
          <SelectContent>
            {days.map(({ day }) => (
              <SelectItem key={day} value={day}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          onClick={onBulkFavorite}
          className="h-8 rounded-full"
          title="Favoritar"
        >
          <Star className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onBulkTag}
          className="h-8 rounded-full"
          title="Adicionar Tags"
        >
          <Tag className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onBulkArchive}
          className="h-8 rounded-full"
          title="Arquivar"
        >
          <Archive className="h-3.5 w-3.5" />
        </Button>

        <div className="h-6 w-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onBulkDelete}
          className="h-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
          title="Excluir"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-8 w-8 rounded-full p-0"
          title="Cancelar"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
