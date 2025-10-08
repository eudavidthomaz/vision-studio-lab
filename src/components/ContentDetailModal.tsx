import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { ContentItem } from "./LegacyContentCard";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Copy, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "./ui/textarea";
import { useState } from "react";

interface ContentDetailModalProps {
  item: ContentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeLabels = {
  post: "Post",
  foto: "Ideia de Foto",
  video: "Script de Vídeo",
  pack: "Pack Completo",
  challenge: "Desafio Ide.On",
};

const pilarColors = {
  edificar: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  evangelizar: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
  engajar: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
};

export function ContentDetailModal({
  item,
  open,
  onOpenChange,
}: ContentDetailModalProps) {
  const [editedCopy, setEditedCopy] = useState(item?.copy || "");

  if (!item) return null;

  const handleCopyAll = () => {
    const textToCopy = `${item.title}\n\n${editedCopy}${
      item.hashtags ? `\n\n${item.hashtags.join(" ")}` : ""
    }`;
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "📋 Copiado!",
      description: "Conteúdo completo copiado para área de transferência",
    });
  };

  const handleCopySection = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copiado!",
      description: `${section} copiado para área de transferência`,
    });
  };

  const handleExport = () => {
    const content = `${item.title}\n\n${editedCopy}${
      item.hashtags ? `\n\n${item.hashtags.join(" ")}` : ""
    }`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.title.slice(0, 30)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "💾 Exportado!",
      description: "Conteúdo exportado como arquivo de texto",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
            <div className="flex gap-2 flex-wrap flex-1">
              <Badge variant="secondary" className="text-xs sm:text-sm">
                {typeLabels[item.type]}
              </Badge>
              {item.pilar && (
                <Badge
                  className={pilarColors[item.pilar.toLowerCase() as keyof typeof pilarColors] || "bg-gray-500/20"}
                  variant="secondary"
                >
                  {item.pilar}
                </Badge>
              )}
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
              {new Date(item.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <DialogTitle className="text-xl sm:text-2xl break-words">{item.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Copy/Conteúdo */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-medium">Conteúdo</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopySection(editedCopy, "Conteúdo")}
                className="h-8 sm:h-9"
              >
                <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="text-xs sm:text-sm">Copiar</span>
              </Button>
            </div>
            <Textarea
              value={editedCopy}
              onChange={(e) => setEditedCopy(e.target.value)}
              className="min-h-[150px] sm:min-h-[200px] text-sm sm:text-base"
              placeholder="Conteúdo do post..."
            />
          </div>

          {/* Hashtags */}
          {item.hashtags && item.hashtags.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Hashtags</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleCopySection(item.hashtags!.join(" "), "Hashtags")
                  }
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap p-3 bg-muted rounded-md">
                {item.hashtags.map((tag, idx) => (
                  <span key={idx} className="text-sm text-primary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pack completo - mostrar posts individuais */}
          {item.type === "pack" && item.fullData?.posts && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Posts do Pack ({item.fullData.posts.length})
              </label>
              <div className="space-y-3">
                {item.fullData.posts.map((post: any, idx: number) => (
                  <div key={idx} className="p-3 bg-muted rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Post {idx + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleCopySection(
                            `${post.copy}\n\n${post.hashtags.join(" ")}`,
                            `Post ${idx + 1}`
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm mb-2">{post.copy}</p>
                    <div className="flex gap-1 flex-wrap">
                      {post.hashtags.map((tag: string, tagIdx: number) => (
                        <span key={tagIdx} className="text-xs text-primary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-col xs:flex-row gap-2 pt-4 border-t">
            <Button onClick={handleCopyAll} className="w-full xs:flex-1 min-h-[44px]">
              <Copy className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">Copiar Tudo</span>
            </Button>
            <Button onClick={handleExport} variant="outline" className="w-full xs:flex-1 min-h-[44px]">
              <Download className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">Exportar</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
