import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  X, 
  FileDown, 
  Trash2, 
  Tags, 
  Star, 
  Copy 
} from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onExport: (format: 'pdf' | 'txt' | 'json') => void;
  onDelete: () => void;
  onEditTags: () => void;
  onToggleFavorite: () => void;
  onDuplicate: () => void;
  onClearSelection: () => void;
}

export default function BulkActionsBar({
  selectedCount,
  onExport,
  onDelete,
  onEditTags,
  onToggleFavorite,
  onDuplicate,
  onClearSelection,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-0 z-50 bg-primary/10 border-b border-primary/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="px-3 py-1">
              {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
            >
              <X className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEditTags}
            >
              <Tags className="h-4 w-4 mr-2" />
              Editar Tags
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFavorite}
            >
              <Star className="h-4 w-4 mr-2" />
              Favoritar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onDuplicate}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileDown className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onExport('pdf')}>
                  📄 Exportar como PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('txt')}>
                  📝 Exportar como TXT
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('json')}>
                  📊 Exportar como JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
