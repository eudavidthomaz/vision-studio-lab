import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Edit, Image, GripVertical, Check, Loader2, CheckCircle2, Star, Archive, RefreshCw, Pin, AlertCircle } from "lucide-react";
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
import { ContentLibraryItem } from "@/hooks/useContentLibrary";

interface ContentCardProps {
  content: ContentLibraryItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ContentLibraryItem>) => void;
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
  
  // Extract data from nested content JSON
  const contentData = content.content || {};
  const copy = contentData.copy || contentData.texto || '';
  const hashtags = contentData.hashtags || [];
  const cta = contentData.cta || '';
  const imagem_url = contentData.imagem_url || contentData.image_url || content.content?.imagem_url || '';
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitulo, setEditedTitulo] = useState(content.title);
  const [editedCopy, setEditedCopy] = useState(copy);
  const [editedHashtags, setEditedHashtags] = useState(Array.isArray(hashtags) ? hashtags.join(" ") : '');
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
      debouncedTitulo !== content.title ||
      debouncedCopy !== copy ||
      debouncedHashtags !== (Array.isArray(hashtags) ? hashtags.join(" ") : '')
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
    
    const updatedContent = {
      ...contentData,
      copy: debouncedCopy,
      hashtags: debouncedHashtags.split(" ").filter(h => h.trim())
    };
    
    await onUpdate(content.id, {
      title: debouncedTitulo,
      content: updatedContent
    });
    
    setIsSaving(false);
    setShowSavedCheck(true);
    setTimeout(() => setShowSavedCheck(false), 2000);
  };

  const handleImageGenerated = (imageUrl: string) => {
    setIsGeneratingImage(false);
    const updatedContent = {
      ...contentData,
      imagem_url: imageUrl
    };
    onUpdate(content.id, { content: updatedContent });
    toast({
      title: "✓ Imagem salva!",
      description: (
        <div className="flex items-center gap-2">
          <img src={imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
          <span>Imagem adicionada ao post "{content.title}"</span>
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
      description: `"${content.title}" foi atualizado.`,
    });
  };

  const copyAll = () => {
    const fullText = `${copy}\n\n${cta}\n\n${Array.isArray(hashtags) ? hashtags.join(" ") : ''}`;
    copyToClipboard(fullText, "Conteúdo completo");
  };

  return (
    <>
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
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
            <CardTitle className="text-foreground text-base line-clamp-2">
              {content.title || "Conteúdo sem título"}
            </CardTitle>
          )}
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">{content.content_type}</Badge>
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
              {content.is_pinned && (
                <Badge variant="outline" className="text-primary border-primary text-xs">
                  <Pin className="h-3 w-3 fill-current" />
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
        {/* VALIDAÇÃO PARA CONTEÚDO VAZIO */}
        {!copy || copy.length === 0 ? (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Conteúdo vazio ou em processamento
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Este conteúdo pode ter falhado ao ser gerado. Tente regenerar ou excluir.
            </p>
          </div>
        ) : (
          <>
            {/* Image Preview with Lazy Loading */}
            {imagem_url && !isEditing && (
              <div className="relative group">
                <img
                  src={imagem_url}
                  alt={content.title}
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
                <p className="text-sm text-muted-foreground line-clamp-3">{copy}</p>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(hashtags) && hashtags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-xs text-primary">{tag}</span>
                  ))}
                  {Array.isArray(hashtags) && hashtags.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{hashtags.length - 3}</span>
                  )}
                </div>
              </>
            )}
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
            onClick={() => copyToClipboard(copy, "Copy")}
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(Array.isArray(hashtags) ? hashtags.join(" ") : '', "Hashtags")}
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
                {imagem_url ? "Editar" : "Gerar"}
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
            onClick={() => onUpdate(content.id, { is_pinned: !content.is_pinned })}
            className={content.is_pinned ? "text-primary" : ""}
            title={content.is_pinned ? "Desafixar" : "Fixar"}
          >
            <Pin className={`h-3 w-3 ${content.is_pinned ? 'fill-current' : ''}`} />
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
        </div>
      </CardContent>
      
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
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowImagePreview(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={imagem_url}
              alt={content.title}
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
        content={{
          id: content.id,
          titulo: content.title,
          tipo: content.content_type,
          pilar: content.pilar,
          copy: copy
        }}
        onRegenerated={(newContent) => {
          const updatedContent = {
            ...contentData,
            ...newContent
          };
          onUpdate(content.id, { content: updatedContent });
          setRegenerateDialogOpen(false);
        }}
      />
    </Card>
    </>
  );
});

ContentCard.displayName = 'ContentCard';

export default ContentCard;
