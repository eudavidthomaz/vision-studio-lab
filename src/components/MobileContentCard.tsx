import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Image as ImageIcon, MoreVertical, Move } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import ImageGenerationModal from "./ImageGenerationModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileContentCardProps {
  content: {
    id: string;
    titulo: string;
    tipo: string;
    pilar: string;
    copy: string;
    hashtags: string[];
    cta: string;
    imagem_url?: string;
  };
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: any) => void;
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
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleImageGenerated = (imageUrl: string) => {
    onUpdate(content.id, { imagem_url: imageUrl });
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
    const fullText = `${content.copy}\n\n${content.cta}\n\n${content.hashtags.join(" ")}`;
    copyToClipboard(fullText, "Conteúdo completo");
  };

  const handleDelete = () => {
    setSheetOpen(false);
    onDelete(content.id);
  };

  return (
    <>
      <Card 
        className="bg-card/50 backdrop-blur-sm border-border/50 active:scale-[0.98] transition-transform"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-foreground text-base leading-tight mb-2">
                {content.titulo}
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">{content.tipo}</Badge>
                <Badge className={`${pillarColors[content.pilar] || 'bg-gray-500'} text-white text-xs`}>
                  {content.pilar}
                </Badge>
              </div>
            </div>
            
            {/* More Actions Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto">
                <SheetHeader>
                  <SheetTitle className="text-left">{content.titulo}</SheetTitle>
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
                    onClick={() => copyToClipboard(content.copy, "Copy")}
                    className="justify-start h-14"
                  >
                    <Copy className="h-5 w-5 mr-2" />
                    Copiar apenas o texto
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => copyToClipboard(content.hashtags.join(" "), "Hashtags")}
                    className="justify-start h-14"
                  >
                    <Copy className="h-5 w-5 mr-2" />
                    Copiar apenas hashtags
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
        
        <CardContent className="space-y-3">
          {/* Image Preview */}
          {content.imagem_url && (
            <div 
              className="relative rounded-md overflow-hidden active:opacity-80 transition-opacity"
              onClick={() => setShowImagePreview(true)}
            >
              <img
                src={content.imagem_url}
                alt={content.titulo}
                className="w-full h-40 object-cover"
              />
            </div>
          )}

          {/* Preview Text */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {content.copy}
          </p>
          
          {/* Hashtags Preview */}
          <div className="flex flex-wrap gap-1">
            {content.hashtags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs text-primary">{tag}</span>
            ))}
            {content.hashtags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{content.hashtags.length - 3}</span>
            )}
          </div>
          
          {/* Primary Actions - Large Touch Targets */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="default"
              size="lg"
              onClick={copyAll}
              className="h-12"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar tudo
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setImageModalOpen(true)}
              className="h-12"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {content.imagem_url ? "Editar" : "Gerar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Image Generation Modal */}
      <ImageGenerationModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        copy={content.copy}
        pilar={content.pilar}
        onImageGenerated={handleImageGenerated}
      />

      {/* Image Lightbox */}
      {showImagePreview && content.imagem_url && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setShowImagePreview(false)}
        >
          <img
            src={content.imagem_url}
            alt={content.titulo}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
}
