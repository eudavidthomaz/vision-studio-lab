import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface TagManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTags?: string[];
  onSave?: (tags: string[]) => void;
  // Global tag management mode
  allTags?: { tag: string; count: number }[];
  onRenameTag?: (oldTag: string, newTag: string) => void;
  onDeleteTag?: (tag: string) => void;
  mode?: 'content' | 'global';
}

export default function TagManagerDialog({
  open,
  onOpenChange,
  currentTags = [],
  onSave,
  allTags = [],
  onRenameTag,
  onDeleteTag,
  mode = 'content',
}: TagManagerDialogProps) {
  const [tags, setTags] = useState<string[]>(currentTags);
  const [newTag, setNewTag] = useState("");
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = () => {
    onSave?.(tags);
    onOpenChange(false);
  };

  const handleStartEdit = (tag: string) => {
    setEditingTag(tag);
    setEditValue(tag);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue !== editingTag && onRenameTag && editingTag) {
      onRenameTag(editingTag, editValue.trim());
      setEditingTag(null);
      setEditValue("");
    }
  };

  const handleDeleteGlobalTag = (tag: string) => {
    if (onDeleteTag && confirm(`Tem certeza que deseja remover a tag "${tag}" de todos os conteúdos?`)) {
      onDeleteTag(tag);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'global' ? 'Gerenciar Todas as Tags' : 'Gerenciar Tags'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'global' 
              ? 'Gerencie todas as tags usadas na biblioteca. Renomear ou deletar afeta todos os conteúdos.'
              : 'Adicione tags para organizar e encontrar seus conteúdos mais facilmente.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {mode === 'global' ? (
            /* Global Tags Management */
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allTags.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma tag encontrada
                </p>
              ) : (
                allTags.map(({ tag, count }) => (
                  <div
                    key={tag}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded-md group"
                  >
                    {editingTag === tag ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') setEditingTag(null);
                        }}
                        autoFocus
                        className="h-8"
                      />
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{tag}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {count} {count === 1 ? 'conteúdo' : 'conteúdos'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleStartEdit(tag)}
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => handleDeleteGlobalTag(tag)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Content Tags Management */
            <>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="pl-3 pr-1 py-1.5 gap-1"
                    >
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add New Tag */}
              <div className="flex gap-2">
                <Input
                  placeholder="Nova tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Suggested Tags */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Sugestões:</p>
                <div className="flex flex-wrap gap-2">
                  {["Destaque", "Urgente", "Evento", "Testemunho", "Ensino"].map(
                    (suggestedTag) =>
                      !tags.includes(suggestedTag) && (
                        <Badge
                          key={suggestedTag}
                          variant="outline"
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => setTags([...tags, suggestedTag])}
                        >
                          + {suggestedTag}
                        </Badge>
                      )
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {mode === 'content' && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
