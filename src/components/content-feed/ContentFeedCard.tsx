import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  AudioLines,
  Image as ImageIcon,
  Video,
  FileText,
  Smartphone,
  Eye,
  Copy,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { NormalizedContent } from "@/hooks/useContentFeed";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { memo } from "react";

interface ContentFeedCardProps {
  content: NormalizedContent;
  onView: (content: NormalizedContent) => void;
  onDelete: (id: string) => void;
}

const formatIcons = {
  carrossel: ImageIcon,
  reel: Video,
  post: FileText,
  story: Smartphone,
};

const pilarColors = {
  ALCANÇAR: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  EDIFICAR: "bg-green-500/10 text-green-600 dark:text-green-400",
  ENVIAR: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  EXALTAR: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export const ContentFeedCard = memo(({ content, onView, onDelete }: ContentFeedCardProps) => {
  const FormatIcon = formatIcons[content.format] || FileText;
  const SourceIcon = content.source === "ai-creator" ? Sparkles : AudioLines;

  const handleCopy = async () => {
    const text = `${content.title}\n\n${content.verse}\n\n${content.preview}\n\n${content.hashtags.join(" ")}`;
    await navigator.clipboard.writeText(text);
    toast({
      title: "✅ Copiado!",
      description: "Conteúdo copiado para a área de transferência",
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden hover:border-primary/50 min-w-0 w-full">
      <div className="p-4 space-y-3 min-w-0 overflow-x-clip">
        {/* Header com badges */}
        <div className="flex items-start justify-between gap-2 flex-wrap min-w-0">
          <div className="flex flex-wrap gap-2 min-w-0">
            <Badge variant="secondary" className="gap-1">
              <SourceIcon className="h-3 w-3" />
              {content.source === "ai-creator" ? "IA Criativa" : "Pack Semanal"}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <FormatIcon className="h-3 w-3" />
              {content.format}
            </Badge>
            <Badge className={pilarColors[content.pilar]}>{content.pilar}</Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shrink-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(content)}>
                <Eye className="h-4 w-4 mr-2" />
                Ver completo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar conteúdo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(content.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Título */}
        <h3 className="font-semibold text-lg line-clamp-2 text-foreground break-words">{content.title}</h3>

        {/* Versículo */}
        {content.verse && (
          <p className="text-sm text-muted-foreground italic line-clamp-2 border-l-2 border-primary/30 pl-3 break-words">
            "{content.verse}"
          </p>
        )}

        {/* Preview */}
        <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap break-words">{content.preview}</p>

        {/* Hashtags */}
        {content.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {content.hashtags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs text-primary break-all">
                #{tag}
              </span>
            ))}
            {content.hashtags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{content.hashtags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t min-w-0">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(content.createdAt, {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(content)}
            className="gap-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shrink-0"
          >
            <Eye className="h-4 w-4" />
            Ver
          </Button>
        </div>
      </div>
    </Card>
  );
});

ContentFeedCard.displayName = "ContentFeedCard";
