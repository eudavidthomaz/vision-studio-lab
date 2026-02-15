import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Trash2, Copy, Star, Pin } from "lucide-react";
import { ContentLibraryItem } from "@/hooks/useContentLibrary";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ContentListViewProps {
  items: ContentLibraryItem[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onView: (item: ContentLibraryItem) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onTogglePin: (id: string, current: boolean) => void;
}

const getContentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    post_simples: "Post",
    carrossel: "Carrossel",
    stories: "Stories",
    reel: "Reel",
    devocional: "Devocional",
    esboco: "Esboço",
  };
  return labels[type] || type;
};

/* ─── Mobile: stacked cards ─── */
const MobileListItem = memo(function MobileListItem({
  item,
  isSelected,
  onToggleSelection,
  onView,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onTogglePin,
}: {
  item: ContentLibraryItem;
  isSelected: boolean;
  onToggleSelection: () => void;
  onView: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleFavorite: () => void;
  onTogglePin: () => void;
}) {
  return (
    <Card className={cn("p-3", isSelected && "ring-2 ring-primary")}>
      <div className="flex items-start gap-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelection}
          className="mt-1 flex-shrink-0"
        />
        <div className="flex-1 min-w-0" onClick={onView}>
          <p className="font-medium text-sm line-clamp-2">{item.title}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {getContentTypeLabel(item.content_type)}
            </Badge>
            {item.pilar && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {item.pilar}
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onTogglePin}>
            <Pin className={cn("h-3.5 w-3.5", item.is_pinned && "fill-primary text-primary")} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleFavorite}>
            <Star className={cn("h-3.5 w-3.5", item.is_favorite && "fill-yellow-400 text-yellow-400")} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onView}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDuplicate}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
});

/* ─── Main component ─── */
const ContentListView = memo(function ContentListView({
  items,
  selectedIds,
  onToggleSelection,
  onView,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onTogglePin,
}: ContentListViewProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <MobileListItem
            key={item.id}
            item={item}
            isSelected={selectedIds.has(item.id)}
            onToggleSelection={() => onToggleSelection(item.id)}
            onView={() => onView(item)}
            onDelete={() => onDelete(item.id)}
            onDuplicate={() => onDuplicate(item.id)}
            onToggleFavorite={() => onToggleFavorite(item.id, item.is_favorite || false)}
            onTogglePin={() => onTogglePin(item.id, item.is_pinned || false)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead className="w-12"></TableHead>
            <TableHead className="w-12"></TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="hidden lg:table-cell">Pilar</TableHead>
            <TableHead className="hidden lg:table-cell">Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="w-32">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(item.id)}
                  onCheckedChange={() => onToggleSelection(item.id)}
                />
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onTogglePin(item.id, item.is_pinned || false)}>
                  <Pin className={cn("h-4 w-4", item.is_pinned && "fill-primary text-primary")} />
                </Button>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggleFavorite(item.id, item.is_favorite || false)}>
                  <Star className={cn("h-4 w-4", item.is_favorite && "fill-yellow-400 text-yellow-400")} />
                </Button>
              </TableCell>
              <TableCell className="font-medium max-w-[200px]">
                <span className="line-clamp-2">{item.title}</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {getContentTypeLabel(item.content_type)}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Badge variant="secondary" className="text-xs">
                  {item.pilar}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Badge variant={item.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(item)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDuplicate(item.id)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

export default ContentListView;
