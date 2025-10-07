import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Edit, Image, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ImageGenerationModal from "./ImageGenerationModal";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ContentCardProps {
  content: {
    id: string;
    titulo: string;
    tipo: string;
    pilar: string;
    copy: string;
    hashtags: string[];
    cta: string;
  };
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: any) => void;
  isDraggable?: boolean;
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

export default function ContentCard({ content, onDelete, onUpdate, isDraggable = false }: ContentCardProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitulo, setEditedTitulo] = useState(content.titulo);
  const [editedCopy, setEditedCopy] = useState(content.copy);
  const [editedHashtags, setEditedHashtags] = useState(content.hashtags.join(" "));
  const [imageModalOpen, setImageModalOpen] = useState(false);

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
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência.`,
    });
  };

  const handleSave = () => {
    onUpdate(content.id, {
      titulo: editedTitulo,
      copy: editedCopy,
      hashtags: editedHashtags.split(" ").filter(h => h.trim())
    });
    setIsEditing(false);
    toast({
      title: "Atualizado!",
      description: "Conteúdo atualizado com sucesso.",
    });
  };

  const copyAll = () => {
    const fullText = `${content.copy}\n\n${content.cta}\n\n${content.hashtags.join(" ")}`;
    copyToClipboard(fullText, "Conteúdo completo");
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          {isDraggable && !isEditing && (
            <button
              className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
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
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">{content.tipo}</Badge>
              <Badge className={`${pillarColors[content.pilar] || 'bg-gray-500'} text-white text-xs`}>
                {content.pilar}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(content.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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
            onClick={() => setImageModalOpen(true)}
          >
            <Image className="h-3 w-3 mr-1" />
            Imagem
          </Button>
        </div>
      </CardContent>
      
      <ImageGenerationModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        copy={content.copy}
        pilar={content.pilar}
      />
    </Card>
  );
}
