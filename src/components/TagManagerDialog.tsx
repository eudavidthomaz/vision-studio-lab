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
  currentTags: string[];
  onSave: (tags: string[]) => void;
}

export default function TagManagerDialog({
  open,
  onOpenChange,
  currentTags,
  onSave,
}: TagManagerDialogProps) {
  const [tags, setTags] = useState<string[]>(currentTags);
  const [newTag, setNewTag] = useState("");

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
    onSave(tags);
    onOpenChange(false);
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
          <DialogTitle>Gerenciar Tags</DialogTitle>
          <DialogDescription>
            Adicione tags para organizar e encontrar seus conteúdos mais facilmente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Tags */}
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
