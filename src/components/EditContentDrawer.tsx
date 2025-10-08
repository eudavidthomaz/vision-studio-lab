import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface EditContentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: {
    id: string;
    titulo: string;
    copy: string;
    hashtags: string[];
  } | null;
  onSave: (updates: any) => void;
}

export default function EditContentDrawer({
  open,
  onOpenChange,
  content,
  onSave,
}: EditContentDrawerProps) {
  const { toast } = useToast();
  const [titulo, setTitulo] = useState("");
  const [copy, setCopy] = useState("");
  const [hashtags, setHashtags] = useState("");

  useEffect(() => {
    if (content) {
      setTitulo(content.titulo);
      setCopy(content.copy);
      setHashtags(content.hashtags.join(" "));
    }
  }, [content]);

  const handleSave = () => {
    onSave({
      titulo,
      copy,
      hashtags: hashtags.split(" ").filter(h => h.trim()),
    });
    toast({
      title: "✓ Salvo!",
      description: "Conteúdo atualizado com sucesso.",
      duration: 2000,
    });
    onOpenChange(false);
  };

  if (!content) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Editar Conteúdo</DrawerTitle>
          <DrawerDescription>
            Faça as alterações e salve quando terminar.
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 flex-1 overflow-y-auto space-y-4 pb-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título do post"
              className="text-base h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="copy">Copy (Texto do Post)</Label>
            <Textarea
              id="copy"
              value={copy}
              onChange={(e) => setCopy(e.target.value)}
              placeholder="Escreva o texto do post..."
              rows={10}
              className="text-base resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {copy.length} caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hashtags">Hashtags</Label>
            <Input
              id="hashtags"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#exemplo #hashtags #separadas"
              className="text-base h-12"
            />
            <p className="text-xs text-muted-foreground">
              Separe as hashtags com espaço
            </p>
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Preview</h4>
            <h3 className="font-semibold">{titulo || "Título..."}</h3>
            <p className="text-sm whitespace-pre-wrap">{copy || "Texto do post..."}</p>
            <p className="text-xs text-primary">{hashtags || "#hashtags"}</p>
          </div>
        </div>

        <DrawerFooter className="pt-2 border-t">
          <Button onClick={handleSave} size="lg" className="h-12">
            Salvar Alterações
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" size="lg" className="h-12">
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
