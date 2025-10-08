import { Eye, Copy, MoreVertical, Sparkles, BookOpen, Image, Video } from "lucide-react";
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

export interface AIContentItem {
  id: string;
  type: "ai-content";
  prompt_original: string;
  fundamento_biblico?: {
    versiculos: string[];
    contexto: string;
    principio: string;
  };
  conteudo?: {
    tipo: string;
    legenda: string;
    pilar: string;
  };
  estrutura_visual?: {
    cards?: Array<{ titulo: string; texto: string }>;
    roteiro?: string;
  };
  dica_producao?: {
    formato: string;
    estilo: string;
    horario: string;
    hashtags: string[];
  };
  createdAt: Date;
  fullData?: any;
}

interface AIContentCardProps {
  item: AIContentItem;
  onView: (item: AIContentItem) => void;
  onDelete: (id: string) => void;
}

const contentTypeIcons = {
  carrossel: Image,
  reel: Video,
  post: BookOpen,
  story: Image,
};

const pilarColors = {
  ALCANÇAR: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
  EDIFICAR: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  PERTENCER: "bg-green-500/20 text-green-700 dark:text-green-300",
  SERVIR: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
};

export function AIContentCard({ item, onView, onDelete }: AIContentCardProps) {
  const contentType = item.conteudo?.tipo || "post";
  const ContentIcon = contentTypeIcons[contentType.toLowerCase() as keyof typeof contentTypeIcons] || BookOpen;
  const firstVerse = item.fundamento_biblico?.versiculos?.[0] || "";
  const versePreview = firstVerse.length > 80 ? `${firstVerse.slice(0, 80)}...` : firstVerse;
  
  const isNew = () => {
    const dayInMs = 24 * 60 * 60 * 1000;
    return Date.now() - item.createdAt.getTime() < dayInMs;
  };

  const handleCopyAll = () => {
    let text = "";
    
    if (item.fundamento_biblico) {
      text += "📖 FUNDAMENTO BÍBLICO\n\n";
      text += item.fundamento_biblico.versiculos.join("\n") + "\n\n";
    }
    
    if (item.conteudo?.legenda) {
      text += "✍️ LEGENDA\n\n" + item.conteudo.legenda + "\n\n";
    }
    
    if (item.estrutura_visual?.cards) {
      text += "🎨 CARDS\n\n";
      item.estrutura_visual.cards.forEach((card, idx) => {
        text += `Card ${idx + 1}:\n${card.titulo}\n${card.texto}\n\n`;
      });
    }
    
    if (item.dica_producao?.hashtags) {
      text += "🏷️ HASHTAGS\n\n" + item.dica_producao.hashtags.join(" ");
    }
    
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copiado!",
      description: "Todo o conteúdo foi copiado",
    });
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all relative overflow-hidden group">
      {/* Badge "IA" no canto superior direito */}
      <div className="absolute top-2 right-2 z-10">
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <Sparkles className="h-3 w-3 mr-1" />
          IA
        </Badge>
      </div>

      {/* Badge "Novo" se for recente */}
      {isNew() && (
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-300">
            Novo
          </Badge>
        </div>
      )}

      {/* Header com tipo e pilar */}
      <div className="flex items-center gap-2 mb-3 mt-8">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted">
          <ContentIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium capitalize">{contentType}</span>
        </div>
        {item.conteudo?.pilar && (
          <Badge
            className={pilarColors[item.conteudo.pilar as keyof typeof pilarColors] || "bg-gray-500/20"}
            variant="secondary"
          >
            <span className="text-xs">{item.conteudo.pilar}</span>
          </Badge>
        )}
      </div>

      {/* Preview do versículo */}
      {versePreview && (
        <div className="mb-3 p-3 bg-muted/50 rounded-md border-l-2 border-primary">
          <div className="flex items-center gap-1.5 mb-1">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Fundamento Bíblico</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 italic">
            "{versePreview}"
          </p>
        </div>
      )}

      {/* Prompt original */}
      <p className="text-sm font-medium mb-2 line-clamp-2">
        {item.prompt_original}
      </p>

      {/* Metadata */}
      <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
        {item.estrutura_visual?.cards && (
          <span className="flex items-center gap-1">
            <Image className="h-3.5 w-3.5" />
            {item.estrutura_visual.cards.length} cards
          </span>
        )}
        {item.dica_producao?.hashtags && (
          <span>🏷️ {item.dica_producao.hashtags.length} hashtags</span>
        )}
      </div>

      {/* Data de criação */}
      <p className="text-xs text-muted-foreground mb-3">
        {new Date(item.createdAt).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </p>

      {/* Ações */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleCopyAll}
        >
          <Copy className="h-4 w-4 mr-1" />
          Copiar
        </Button>
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          onClick={() => onView(item)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Ver
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(item)}>
              Ver Completo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyAll}>
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
