import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Instagram, Facebook, Edit, Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ContentItem {
  id: string;
  titulo: string;
  tipo: string;
  copy: string;
  hashtags: string[];
  cta: string;
  imagem_url?: string;
  pilar: string;
}

interface PostPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ContentItem | null;
  onEdit?: () => void;
  onSave?: (updates: Partial<ContentItem>) => void;
}

export default function PostPreviewModal({ 
  open, 
  onOpenChange, 
  content,
  onEdit,
  onSave 
}: PostPreviewModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCopy, setEditedCopy] = useState("");

  if (!content) return null;

  const handleStartEdit = () => {
    setEditedCopy(content.copy);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onSave) {
      onSave({ copy: editedCopy });
    }
    setIsEditing(false);
    onOpenChange(false);
  };

  const fullCaption = `${content.copy}\n\n${content.cta}\n\n${content.hashtags.map(tag => `#${tag}`).join(" ")}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview do Post</DialogTitle>
          <DialogDescription>
            Veja como seu post ficará nas redes sociais
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="instagram" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Instagram
            </TabsTrigger>
            <TabsTrigger value="facebook" className="flex items-center gap-2">
              <Facebook className="h-4 w-4" />
              Facebook
            </TabsTrigger>
          </TabsList>

          {/* Instagram Preview */}
          <TabsContent value="instagram" className="space-y-4">
            <div className="max-w-md mx-auto bg-background border rounded-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 p-3 border-b">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>MC</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Minha Igreja</p>
                  <p className="text-xs text-muted-foreground">Patrocinado</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  •••
                </Button>
              </div>

              {/* Image */}
              {content.imagem_url ? (
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <img 
                    src={content.imagem_url} 
                    alt={content.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground p-6">
                    <p className="text-sm">Sem imagem</p>
                    <p className="text-xs mt-1">Adicione uma imagem ao post</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Heart className="h-6 w-6" />
                    <MessageCircle className="h-6 w-6" />
                    <Send className="h-6 w-6" />
                  </div>
                  <Bookmark className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-sm font-semibold mb-1">1.234 curtidas</p>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editedCopy}
                        onChange={(e) => setEditedCopy(e.target.value)}
                        rows={8}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>Salvar</Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm">
                        <span className="font-semibold">Minha Igreja </span>
                        {fullCaption}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 h-7 px-2"
                        onClick={handleStartEdit}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar texto
                      </Button>
                    </>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">Há 2 minutos</p>
              </div>
            </div>
          </TabsContent>

          {/* Facebook Preview */}
          <TabsContent value="facebook" className="space-y-4">
            <div className="max-w-2xl mx-auto bg-background border rounded-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>MC</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">Minha Igreja</p>
                  <p className="text-xs text-muted-foreground">Agora · 🌍</p>
                </div>
                <Button variant="ghost" size="icon">
                  •••
                </Button>
              </div>

              {/* Content */}
              <div className="p-4">
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editedCopy}
                      onChange={(e) => setEditedCopy(e.target.value)}
                      rows={8}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit}>Salvar</Button>
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap">{fullCaption}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 h-7 px-2"
                      onClick={handleStartEdit}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar texto
                    </Button>
                  </>
                )}
              </div>

              {/* Image */}
              {content.imagem_url ? (
                <img 
                  src={content.imagem_url} 
                  alt={content.titulo}
                  className="w-full"
                />
              ) : (
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground p-6">
                    <p className="text-sm">Sem imagem</p>
                    <p className="text-xs mt-1">Adicione uma imagem ao post</p>
                  </div>
                </div>
              )}

              {/* Reactions */}
              <div className="px-4 py-2 border-t">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>👍 ❤️ 234</span>
                  <div className="flex gap-4">
                    <span>45 comentários</span>
                    <span>12 compartilhamentos</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 py-2 border-t flex justify-around">
                <Button variant="ghost" size="sm" className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  Curtir
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Comentar
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Metadata */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <Badge variant="outline">{content.tipo}</Badge>
          <Badge variant="outline">{content.pilar}</Badge>
          {content.imagem_url && <Badge variant="secondary">Com imagem</Badge>}
        </div>

        <div className="flex justify-end gap-2">
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Post
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
