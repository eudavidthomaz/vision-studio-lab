import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Image as ImageIcon, MoreVertical, Move, Star, Pin, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import ImageGenerationModal from "./ImageGenerationModal";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { ContentLibraryItem } from "@/hooks/useContentLibrary";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileContentCardProps {
  content: ContentLibraryItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ContentLibraryItem>) => void;
  onMove: (id: string) => void;
  onEdit: () => void;
}

const pillarColors: Record<string, string> = {
  "Edificar": "bg-blue-500",
  "Alcançar": "bg-green-500",
  "Pertencer": "bg-purple-500",
  "Servir": "bg-orange-500",
  "Convite": "bg-pink-500",
  "Comunidade": "bg-cyan-500",
  "Cobertura": "bg-red-500"
};

export default function MobileContentCard({ 
  content, 
  onDelete, 
  onUpdate, 
  onMove,
  onEdit 
}: MobileContentCardProps) {
  const { toast } = useToast();
  
  // Extract data from nested content JSON
  const contentData = content.content || {};
  const copy = contentData.copy || contentData.texto || '';
  const hashtags = contentData.hashtags || [];
  const cta = contentData.cta || '';
  const imagem_url = contentData.imagem_url || contentData.image_url || '';
  
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
      imagem_url: imageUrl
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
    const fullText = `${copy}\n\n${cta}\n\n${Array.isArray(hashtags) ? hashtags.join(" ") : ''}`;
    copyToClipboard(fullText, "Conteúdo completo");
  };

  const handleDelete = () => {
    setSheetOpen(false);
    onDelete(content.id);
  };

  return (
    <>
      <Card 
        className={`bg-card/60 backdrop-blur-md border-border/60 active:scale-[0.97] transition-all duration-300 shadow-lg hover:shadow-xl hover:border-primary/30 ${
          isDeleting ? 'animate-swipe-delete opacity-0' : ''
        }`}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: swipeOffset === 0 ? 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
        {...handlers}
      >
        <CardHeader className="pb-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-foreground text-sm leading-tight mb-2 line-clamp-2">
                {content.title || "Conteúdo sem título"}
              </CardTitle>
              <div className="flex gap-1.5 flex-wrap">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">{content.content_type}</Badge>
                <Badge className={`${pillarColors[content.pilar] || 'bg-gray-500'} text-white text-[10px] px-1.5 py-0.5`}>
                  {content.pilar}
                </Badge>
                {content.is_favorite && (
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500 text-[10px] px-1.5 py-0.5">
                    <Star className="h-2.5 w-2.5 fill-current" />
                  </Badge>
                )}
                {content.is_pinned && (
                  <Badge variant="outline" className="text-primary border-primary text-[10px] px-1.5 py-0.5">
                    <Pin className="h-2.5 w-2.5 fill-current" />
                  </Badge>
                )}
              </div>
            </div>
            
            {/* More Actions Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 hover:bg-primary/10 transition-colors"
                >
                  <MoreVertical className="h-4.5 w-4.5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto">
                <SheetHeader>
                  <SheetTitle className="text-left">{content.title}</SheetTitle>
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
                    onClick={() => copyToClipboard(copy, "Copy")}
                    className="justify-start h-14"
                  >
                    <Copy className="h-5 w-5 mr-2" />
                    Copiar apenas o texto
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => copyToClipboard(Array.isArray(hashtags) ? hashtags.join(" ") : '', "Hashtags")}
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
                    <Star className={`h-5 w-5 mr-2 ${content.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    {content.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
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
                    <Pin className={`h-5 w-5 mr-2 ${content.is_pinned ? 'fill-primary text-primary' : ''}`} />
                    {content.is_pinned ? 'Desafixar' : 'Fixar'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleDelete}
                    className="justify-start h-14"
                  >
                    Excluir post
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-2.5">
          {/* VALIDAÇÃO */}
          {!copy || copy.length === 0 ? (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2.5 backdrop-blur-sm">
              <p className="text-xs text-yellow-600 flex items-center gap-1.5 font-medium">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Conteúdo vazio</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                Este conteúdo pode ter falhado. Tente regenerar ou excluir.
              </p>
            </div>
          ) : (
            <>
              {/* Image Preview */}
              {imagem_url && (
                <div 
                  className="relative rounded-lg overflow-hidden active:scale-[0.98] transition-transform shadow-md"
                  onClick={() => setShowImagePreview(true)}
                >
                  <img
                    src={imagem_url}
                    alt={content.title}
                    className="w-full h-36 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 active:bg-black/20 transition-colors" />
                </div>
              )}

              {/* Preview Text */}
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {copy}
              </p>
              
              {/* Hashtags Preview */}
              <div className="flex flex-wrap gap-1">
                {Array.isArray(hashtags) && hashtags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-[10px] text-primary font-medium">{tag}</span>
                ))}
                {Array.isArray(hashtags) && hashtags.length > 3 && (
                  <span className="text-[10px] text-muted-foreground font-medium">+{hashtags.length - 3} mais</span>
                )}
              </div>
            </>
          )}
          
          {/* Primary Actions - Large Touch Targets */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="default"
              size="lg"
              onClick={copyAll}
              className="h-11 text-sm shadow-lg hover:shadow-xl transition-all"
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copiar tudo
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setImageModalOpen(true)}
              className="h-11 text-sm hover:bg-primary/10 hover:border-primary/50 transition-all"
            >
              <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
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
          <img
            src={imagem_url}
            alt={content.title}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
}
