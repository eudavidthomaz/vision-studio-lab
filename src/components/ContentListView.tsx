import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      post_simples: "Post Simples",
      carrossel: "Carrossel",
      stories: "Stories",
      reel: "Reel",
      devocional: "Devocional",
      esboco: "Esboço",
    };
    return labels[type] || type;
  };

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
            <TableHead>Pilar</TableHead>
            <TableHead>Status</TableHead>
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onTogglePin(item.id, item.is_pinned || false)}
                >
                  <Pin className={`h-4 w-4 ${item.is_pinned ? 'fill-primary text-primary' : ''}`} />
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onToggleFavorite(item.id, item.is_favorite || false)}
                >
                  <Star className={`h-4 w-4 ${item.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </Button>
              </TableCell>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {getContentTypeLabel(item.content_type)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {item.pilar}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={item.status === 'published' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(item.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onView(item)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDuplicate(item.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => onDelete(item.id)}
                  >
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
