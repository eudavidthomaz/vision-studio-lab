import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Image as ImageIcon, MoreVertical, Move, Star, Pin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import ImageGenerationModal from "./ImageGenerationModal";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { ContentLibraryItem } from "@/hooks/useContentLibrary";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface MobileContentCardProps {
  content: ContentLibraryItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ContentLibraryItem>) => void;
  onMove: (id: string) => void;
  onEdit: () => void;
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

export default function MobileContentCard({ content, onDelete, onUpdate, onMove, onEdit }: MobileContentCardProps) {
  const { toast } = useToast();

  // Extract data from nested content JSON (com fallbacks)
  const contentData = content.content || {};
  const copy = contentData.copy || contentData.texto || "";
  const hashtags = contentData.hashtags || [];
  const cta = contentData.cta || "";
  const imagem_url = contentData.imagem_url || contentData.image_url || "";

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { handlers, swipeOffset } = useSwipeGesture({
    onSwipeLeft: () => {
      setIsDeleting(true);
      setTimeout(() => {
        onDelete(content.id);
        toast({
          title: "Conteúdo removido",
          description: "Item deletado com sucesso",
        });
      }, 300);
    },
    onSwipeRight: () => {
      copyAll();
    },
    threshold: 100,
  });

  const handleImageGenerated = (imageUrl: string) => {
    const updatedContent = {
      ...contentData,
      imagem_url: imageUrl,
    };
    onUpdate(content.id, { content: updatedContent });
    toast({
      title: "✓ Imagem salva!",
      description: "Imagem adicionada ao post",
      duration: 3000,
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copiado!",
      description: `${label} copiado.`,
      duration: 2000,
    });
  };

  const copyAll = () => {
    const fullText = `${copy}\n\n${cta}\n\n${Array.isArray(hashtags) ? hashtags.join(" ") : ""}`;
    copyToClipboard(fullText, "Conteúdo completo");
  };

  const handleDelete = () => {
    setSheetOpen(false);
    onDelete(content.id);
  };

  return (
    <>
      <Card
        className={`w-full min-w-0 overflow-x-clip touch-pan-y bg-card/50 backdrop-blur-sm border-border/50 active:scale-[0.98] transition-all duration-300 ${
          isDeleting ? "animate-swipe-delete" : ""
        }`}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: swipeOffset === 0 ? "transform 0.3s ease-out" : "none",
        }}
        {...handlers}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-foreground text-base leading-tight mb-2 line-clamp-2 break-words">
                {content.title}
              </CardTitle>
              <div className="flex gap-2 flex-wrap items-center min-w-0">
                <Badge variant="secondary" className="text-xs max-w-full truncate">
                  {content.content_type}
                </Badge>
                <Badge className={`${pillarColors[content.pilar] || "bg-gray-500"} text-white text-xs`}>
                  {content.pilar}
                </Badge>
                {content.is_favorite && (
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500 text-xs">
                    <Star className="h-3 w-3 fill-current" />
                  </Badge>
                )}
                {content.is_pinned && (
                  <Badge variant="outline" className="text-primary border-primary text-xs">
                    <Pin className="h-3 w-3 fill-current" />
                  </Badge>
                )}
              </div>
            </div>

            {/* More Actions Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" aria-label="Mais ações">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto pb-safe pt-4">
                <SheetHeader>
                  <SheetTitle className="text-left break-words">{content.title}</SheetTitle>
                </SheetHeader>
                <div className="grid gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setSheetOpen(false);
                      onEdit();
                    }}
                    className="justify-start h-14"
                  >
                    Editar conteúdo
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setSheetOpen(false);
                      onMove(content.id);
                    }}
                    className="justify-start h-14"
                  >
                    <Move className="h-5 w-5 mr-2" />
                    Mover para outro dia
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => copyToClipboard(copy, "Texto")}
                    className="justify-start h-14"
                  >
                    <Copy className="h-5 w-5 mr-2" />
                    Copiar apenas o texto
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => copyToClipboard(Array.isArray(hashtags) ? hashtags.join(" ") : "", "Hashtags")}
                    className="justify-start h-14"
                  >
                    <Copy className="h-5 w-5 mr-2" />
                    Copiar apenas hashtags
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setSheetOpen(false);
                      onUpdate(content.id, { is_favorite: !content.is_favorite });
                    }}
                    className="justify-start h-14"
                  >
                    <Star className={`h-5 w-5 mr-2 ${content.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                    {content.is_favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setSheetOpen(false);
                      onUpdate(content.id, { is_pinned: !content.is_pinned });
                    }}
                    className="justify-start h-14"
                  >
                    <Pin className={`h-5 w-5 mr-2 ${content.is_pinned ? "fill-primary text-primary" : ""}`} />
                    {content.is_pinned ? "Desafixar" : "Fixar"}
                  </Button>
                  <Button variant="destructive" size="lg" onClick={handleDelete} className="justify-start h-14">
                    Excluir post
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Image Preview */}
          {imagem_url && (
            <div
              className="relative rounded-md overflow-hidden active:opacity-80 transition-opacity"
              onClick={() => setShowImagePreview(true)}
            >
              <img src={imagem_url} alt={content.title} className="w-full h-40 object-cover" loading="lazy" />
            </div>
          )}

          {/* Preview Text */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed break-words">{copy}</p>

          {/* Hashtags Preview */}
          <div className="flex flex-wrap gap-1 overflow-hidden">
            {Array.isArray(hashtags) &&
              hashtags.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-xs text-primary break-all">
                  {tag}
                </span>
              ))}
            {Array.isArray(hashtags) && hashtags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{hashtags.length - 3}</span>
            )}
          </div>

          {/* Primary Actions - Large Touch Targets */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="default" size="lg" onClick={copyAll} className="h-12">
              <Copy className="h-4 w-4 mr-2" />
              Copiar tudo
            </Button>
            <Button variant="outline" size="lg" onClick={() => setImageModalOpen(true)} className="h-12">
              <ImageIcon className="h-4 w-4 mr-2" />
              {imagem_url ? "Editar" : "Gerar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Image Generation Modal */}
      <ImageGenerationModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        copy={copy}
        pilar={content.pilar}
        onImageGenerated={handleImageGenerated}
      />

      {/* Image Lightbox */}
      {showImagePreview && imagem_url && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setShowImagePreview(false)}
        >
          <img src={imagem_url} alt={content.title} className="max-w-full max-h-[90vh] object-contain rounded-lg" />
        </div>
      )}
    </>
  );
}
