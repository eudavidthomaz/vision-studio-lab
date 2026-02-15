import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  X, 
  FileDown, 
  Trash2, 
  Tags, 
  Star, 
  Copy,
  MoreHorizontal
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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

  const isMobile = useIsMobile();

  return (
    <div className="sticky top-0 z-50 bg-primary/10 border-b border-primary/20 backdrop-blur-sm">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Badge variant="default" className="px-2 sm:px-3 py-1 text-xs sm:text-sm whitespace-nowrap">
              {selectedCount} sel.
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-8 px-2 sm:px-3"
            >
              <X className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Limpar</span>
            </Button>
          </div>

          {isMobile ? (
            /* Mobile: single dropdown with all actions */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2">
                  <MoreHorizontal className="h-4 w-4 mr-1" />
                  Ações
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
                <DropdownMenuItem onClick={onEditTags}>
                  <Tags className="h-4 w-4 mr-2" />
                  Editar Tags
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleFavorite}>
                  <Star className="h-4 w-4 mr-2" />
                  Favoritar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onExport('pdf')}>
                  📄 Exportar PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('txt')}>
                  📝 Exportar TXT
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('json')}>
                  📊 Exportar JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Desktop: inline buttons */
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onEditTags}>
                <Tags className="h-4 w-4 mr-2" />
                Editar Tags
              </Button>
              <Button variant="outline" size="sm" onClick={onToggleFavorite}>
                <Star className="h-4 w-4 mr-2" />
                Favoritar
              </Button>
              <Button variant="outline" size="sm" onClick={onDuplicate}>
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
                <DropdownMenuContent align="end" className="bg-popover z-50">
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
              <Button variant="destructive" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
