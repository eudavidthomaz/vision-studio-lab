import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Edit, Image, GripVertical, Check, Loader2, CheckCircle2, Star, Archive, RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import ContentStatusBadge from "./ContentStatusBadge";
import TagManagerDialog from "./TagManagerDialog";
import RegenerateContentDialog from "./RegenerateContentDialog";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, memo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ImageGenerationModal from "./ImageGenerationModal";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDebounce } from "@/hooks/useDebounce";

interface ContentCardProps {
  content: {
    id: string;
    titulo: string;
    tipo: string;
    pilar: string;
    copy: string;
    hashtags: string[];
    cta: string;
    imagem_url?: string;
    status?: string;
    tags?: string[];
    is_favorite?: boolean;
    is_archived?: boolean;
  };
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: any) => void;
  isDraggable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
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

const ContentCard = memo(({ content, onDelete, onUpdate, isDraggable = false, isSelected = false, onToggleSelect }: ContentCardProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitulo, setEditedTitulo] = useState(content.titulo);
  const [editedCopy, setEditedCopy] = useState(content.copy);
  const [editedHashtags, setEditedHashtags] = useState(content.hashtags.join(" "));
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showSavedCheck, setShowSavedCheck] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);

  // Debounce edited values for auto-save
  const debouncedTitulo = useDebounce(editedTitulo, 1000);
  const debouncedCopy = useDebounce(editedCopy, 1000);
  const debouncedHashtags = useDebounce(editedHashtags, 1000);

  // Auto-save when debounced values change
  useEffect(() => {
    if (isEditing && (
      debouncedTitulo !== content.titulo ||
      debouncedCopy !== content.copy ||
      debouncedHashtags !== content.hashtags.join(" ")
    )) {
      handleAutoSave();
    }
  }, [debouncedTitulo, debouncedCopy, debouncedHashtags]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: content.id,
    disabled: !isDraggable || isEditing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    scale: isDragging ? 1.05 : 1,
  };

  const handleAutoSave = async () => {
    setIsSaving(true);
    
    await onUpdate(content.id, {
      titulo: debouncedTitulo,
      copy: debouncedCopy,
      hashtags: debouncedHashtags.split(" ").filter(h => h.trim())
    });
    
    setIsSaving(false);
    setShowSavedCheck(true);
    setTimeout(() => setShowSavedCheck(false), 2000);
  };

  const handleImageGenerated = (imageUrl: string) => {
    setIsGeneratingImage(false);
    onUpdate(content.id, { imagem_url: imageUrl });
    toast({
      title: "✓ Imagem salva!",
      description: (
        <div className="flex items-center gap-2">
          <img src={imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
          <span>Imagem adicionada ao post "{content.titulo}"</span>
        </div>
      ),
      duration: 5000,
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copiado!",
      description: `${label} copiado para a área de transferência.`,
      duration: 3000,
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "✓ Salvo!",
      description: `"${content.titulo}" foi atualizado.`,
    });
  };

  const copyAll = () => {
    const fullText = `${content.copy}\n\n${content.cta}\n\n${content.hashtags.join(" ")}`;
    copyToClipboard(fullText, "Conteúdo completo");
  };

  return (
    <>
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${content.is_archived ? 'opacity-60' : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            {onToggleSelect && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={onToggleSelect}
                className="mt-1"
              />
            )}
            {isDraggable && !isEditing && (
              <button
                className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded animate-pulse"
                {...attributes}
                {...listeners}
                title="Arraste para mover"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={editedTitulo}
                onChange={(e) => setEditedTitulo(e.target.value)}
                className="mb-2"
              />
            ) : (
              <CardTitle className="text-foreground text-base">{content.titulo}</CardTitle>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">{content.tipo}</Badge>
              <Badge className={`${pillarColors[content.pilar] || 'bg-gray-500'} text-white text-xs`}>
                {content.pilar}
              </Badge>
              {content.status && (
                <ContentStatusBadge
                  status={content.status}
                  onChange={(newStatus) => onUpdate(content.id, { status: newStatus })}
                />
              )}
              {content.is_favorite && (
                <Badge variant="outline" className="text-yellow-500 border-yellow-500 text-xs">
                  <Star className="h-3 w-3 fill-current" />
                </Badge>
              )}
              {content.is_archived && (
                <Badge variant="outline" className="text-orange-500 border-orange-500 text-xs">
                  <Archive className="h-3 w-3" />
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1 items-center">
            {isSaving && (
              <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" />
            )}
            {showSavedCheck && (
              <CheckCircle2 className="h-3 w-3 text-green-500 animate-scale-in" />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="transition-transform hover:scale-110"
            >
              {isEditing ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(content.id)}
              className="transition-transform hover:scale-110 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Image Preview with Lazy Loading */}
        {content.imagem_url && !isEditing && (
          <div className="relative group">
            <img
              src={content.imagem_url}
              alt={content.titulo}
              className="w-full h-32 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setShowImagePreview(true)}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowImagePreview(true)}
              >
                Ver Imagem
              </Button>
            </div>
          </div>
        )}

        {isEditing ? (
          <>
            <Textarea
              value={editedCopy}
              onChange={(e) => setEditedCopy(e.target.value)}
              rows={6}
              className="mb-2"
            />
            <Input
              value={editedHashtags}
              onChange={(e) => setEditedHashtags(e.target.value)}
              placeholder="Hashtags separadas por espaço"
            />
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground line-clamp-3">{content.copy}</p>
            <div className="flex flex-wrap gap-1">
              {content.hashtags.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-xs text-primary">{tag}</span>
              ))}
              {content.hashtags.length > 3 && (
                <span className="text-xs text-muted-foreground">+{content.hashtags.length - 3}</span>
              )}
            </div>
          </>
        )}
        
        {/* Tags Display */}
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {content.tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyAll}
            className="flex-1"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copiar tudo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(content.copy, "Copy")}
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(content.hashtags.join(" "), "Hashtags")}
          >
            <Copy className="h-3 w-3 mr-1" />
            #
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsGeneratingImage(true);
              setImageModalOpen(true);
            }}
            disabled={isGeneratingImage}
            className="transition-transform hover:scale-105"
          >
            {isGeneratingImage ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Image className="h-3 w-3 mr-1" />
                {content.imagem_url ? "Editar" : "Gerar"}
              </>
            )}
          </Button>
        </div>

        {/* Quick Actions Row */}
        <div className="flex gap-2 border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdate(content.id, { is_favorite: !content.is_favorite })}
            className={content.is_favorite ? "text-yellow-500" : ""}
            title="Favoritar"
          >
            <Star className={`h-3 w-3 ${content.is_favorite ? 'fill-current' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTagDialogOpen(true)}
            title="Gerenciar Tags"
          >
            Tags
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRegenerateDialogOpen(true)}
            title="Regenerar com IA"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdate(content.id, { is_archived: !content.is_archived })}
            title="Arquivar"
          >
            <Archive className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
      
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
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowImagePreview(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={content.imagem_url}
              alt={content.titulo}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setShowImagePreview(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      )}

      <TagManagerDialog
        open={tagDialogOpen}
        onOpenChange={setTagDialogOpen}
        currentTags={content.tags || []}
        onSave={(tags) => onUpdate(content.id, { tags })}
      />

      <RegenerateContentDialog
        open={regenerateDialogOpen}
        onOpenChange={setRegenerateDialogOpen}
        content={content}
        onRegenerated={(newContent) => {
          onUpdate(content.id, newContent);
          setRegenerateDialogOpen(false);
        }}
      />
    </Card>
    </>
  );
});

ContentCard.displayName = 'ContentCard';

export default ContentCard;
