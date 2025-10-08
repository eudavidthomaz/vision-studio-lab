import { Copy, Eye, MoreVertical, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { toast } from "@/hooks/use-toast";

export interface ContentItem {
  id: string;
  type: "post" | "foto" | "video" | "pack" | "challenge";
  title: string;
  copy: string;
  hashtags?: string[];
  pilar?: string;
  createdAt: Date;
  isFavorite?: boolean;
  fullData?: any;
}

interface SimpleContentCardProps {
  item: ContentItem;
  onView: (item: ContentItem) => void;
  onDelete: (id: string) => void;
  onFavorite?: (id: string, isFavorite: boolean) => void;
}

const typeColors = {
  post: "bg-blue-500/10 text-blue-500",
  foto: "bg-purple-500/10 text-purple-500",
  video: "bg-red-500/10 text-red-500",
  pack: "bg-green-500/10 text-green-500",
  challenge: "bg-orange-500/10 text-orange-500",
};

const typeLabels = {
  post: "Post",
  foto: "Foto",
  video: "Vídeo",
  pack: "Pack",
  challenge: "Desafio",
};

const pilarColors = {
  edificar: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  evangelizar: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
  engajar: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
};

export function LegacyContentCard({
  item,
  onView,
  onDelete,
  onFavorite,
}: SimpleContentCardProps) {
  const handleCopy = () => {
    const textToCopy = `${item.title}\n\n${item.copy}${
      item.hashtags ? `\n\n${item.hashtags.join(" ")}` : ""
    }`;
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "📋 Copiado!",
      description: "Conteúdo copiado para área de transferência",
    });
  };

  return (
    <Card className="p-3 sm:p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
        <div className="flex gap-1.5 sm:gap-2 flex-wrap flex-1 min-w-0">
          <Badge className={typeColors[item.type]} variant="secondary">
            <span className="text-xs">{typeLabels[item.type]}</span>
          </Badge>
          {item.pilar && (
            <Badge
              className={pilarColors[item.pilar.toLowerCase() as keyof typeof pilarColors] || "bg-gray-500/20"}
              variant="secondary"
            >
              <span className="text-xs">{item.pilar}</span>
            </Badge>
          )}
        </div>
        {onFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onFavorite(item.id, !item.isFavorite)}
          >
            <Star
              className={`h-4 w-4 ${
                item.isFavorite ? "fill-yellow-400 text-yellow-400" : ""
              }`}
            />
          </Button>
        )}
      </div>

      <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-1 break-words">{item.title}</h3>

      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 sm:mb-3">
        {item.copy}
      </p>

      {item.hashtags && item.hashtags.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-2 sm:mb-3">
          {item.hashtags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-xs text-primary">
              {tag}
            </span>
          ))}
          {item.hashtags.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{item.hashtags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 sm:h-9"
          onClick={handleCopy}
        >
          <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span className="text-xs sm:text-sm">Copiar</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 sm:h-9"
          onClick={() => onView(item)}
        >
          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span className="text-xs sm:text-sm">Ver</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(item)}>
              Ver Detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopy}>
              Copiar Tudo
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(item.id)}
            >
              Deletar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
