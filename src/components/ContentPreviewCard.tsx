import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, Eye } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface ContentPreviewCardProps {
  content: {
    id: string;
    titulo: string;
    tipo: string;
    pilar: string;
    copy: string;
    hashtags: string[];
    imagem_url?: string;
    status?: string;
    tags?: string[];
    is_favorite?: boolean;
  };
  onClick?: () => void;
}

const pillarColors: Record<string, string> = {
  Edificar: "bg-blue-500",
  Alcançar: "bg-green-500",
  Pertencer: "bg-purple-500",
  Servir: "bg-orange-500",
  Convite: "bg-pink-500",
  Comunidade: "bg-cyan-500",
  Cobertura: "bg-red-500",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  approved: "bg-green-500",
  published: "bg-blue-500",
  archived: "bg-orange-500",
};

export default function ContentPreviewCard({
  content,
  onClick,
}: ContentPreviewCardProps) {
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <div
          className="cursor-pointer group"
          onClick={onClick}
        >
          <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
            {content.imagem_url && (
              <div className="relative">
                <Image className="h-4 w-4 text-muted-foreground" />
                <Eye className="h-2 w-2 text-primary absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            <span className="text-sm truncate flex-1">{content.titulo}</span>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent side="right" className="w-96">
        <Card className="border-0 shadow-none">
          <CardContent className="p-4 space-y-3">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-base">{content.titulo}</h4>
                {content.is_favorite && (
                  <span className="text-yellow-500" title="Favorito">
                    ⭐
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {content.tipo}
                </Badge>
                <Badge
                  className={`${
                    pillarColors[content.pilar] || "bg-gray-500"
                  } text-white text-xs`}
                >
                  {content.pilar}
                </Badge>
                {content.status && (
                  <Badge
                    className={`${
                      statusColors[content.status] || "bg-gray-500"
                    } text-white text-xs`}
                  >
                    {content.status === "draft" && "Rascunho"}
                    {content.status === "approved" && "Aprovado"}
                    {content.status === "published" && "Publicado"}
                    {content.status === "archived" && "Arquivado"}
                  </Badge>
                )}
              </div>
            </div>

            {/* Image Preview */}
            {content.imagem_url && (
              <img
                src={content.imagem_url}
                alt={content.titulo}
                className="w-full h-40 object-cover rounded-md"
              />
            )}

            {/* Copy Preview */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground line-clamp-4">
                {content.copy}
              </p>
            </div>

            {/* Hashtags */}
            {content.hashtags && content.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {content.hashtags.slice(0, 5).map((tag, i) => (
                  <span key={i} className="text-xs text-primary">
                    {tag}
                  </span>
                ))}
                {content.hashtags.length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    +{content.hashtags.length - 5}
                  </span>
                )}
              </div>
            )}

            {/* Tags */}
            {content.tags && content.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {content.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </HoverCardContent>
    </HoverCard>
  );
}
