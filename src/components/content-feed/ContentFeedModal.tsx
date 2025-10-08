import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { NormalizedContent } from "@/hooks/useContentFeed";
import { ContentResultDisplay } from "@/components/ContentResultDisplay";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Sparkles, Image } from "lucide-react";
import ImageGenerationModal from "@/components/ImageGenerationModal";

interface ContentFeedModalProps {
  content: NormalizedContent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContentFeedModal({ content, open, onOpenChange }: ContentFeedModalProps) {
  const navigate = useNavigate();
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<{ copy: string; pilar: string } | null>(null);

  if (!content) return null;

  const openImageModal = (copy: string, pilar: string) => {
    setSelectedContent({ copy, pilar });
    setImageModalOpen(true);
  };

  const handleSave = () => {
    toast({
      title: "✅ Já salvo!",
      description: "Este conteúdo já está salvo na sua biblioteca",
    });
  };

  const handleEdit = () => {
    const [type, uuid] = content.id.split("-");
    onOpenChange(false);
    if (type === "ai") {
      navigate(`/conteudo/${uuid}`);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "✅ Copiado!",
      description: "Conteúdo copiado para a área de transferência",
    });
  };

  // Renderizar conteúdo de IA
  if (content.source === "ai-creator") {
    const formattedContent = {
      fundamento_biblico: content.rawData.fundamento_biblico,
      conteudo: content.rawData.conteudo,
      estrutura_visual: content.rawData.estrutura_visual,
      dica_producao: content.rawData.dica_producao,
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-hidden p-0">
          <div className="overflow-y-auto max-h-[90vh]">
            <ContentResultDisplay
              content={formattedContent}
              onSave={handleSave}
              onRegenerate={handleEdit}
              isSaving={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Renderizar Pack Semanal
  const packData = content.rawData;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6 py-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Sparkles className="h-3 w-3 mr-1" />
                Pack Semanal
              </Badge>
              <Badge variant="outline">{content.format}</Badge>
            </div>
            <h2 className="text-2xl font-bold">{packData.titulo_principal}</h2>
            {packData.versiculo_principal && (
              <p className="text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                "{packData.versiculo_principal}"
              </p>
            )}
          </div>

          {/* Resumo */}
          {packData.resumo_pregacao && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Resumo da Pregação
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(packData.resumo_pregacao)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {packData.resumo_pregacao}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Frases Impactantes */}
          {packData.frases_impactantes && packData.frases_impactantes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Frases Impactantes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {packData.frases_impactantes.map((frase: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-sm text-muted-foreground flex-1">{frase}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(frase)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => openImageModal(frase, content.pilar)}
                        >
                          <Image className="h-3 w-3" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Ideias de Posts */}
          {packData.ideias_posts && packData.ideias_posts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ideias de Posts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {packData.ideias_posts.map((post: any, i: number) => (
                  <div key={i} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge>{post.formato}</Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(`${post.titulo}\n\n${post.legenda}`)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => openImageModal(post.legenda, content.pilar)}
                        >
                          <Image className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <h4 className="font-semibold">{post.titulo}</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {post.legenda}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Hashtags */}
          {packData.hashtags_sugeridas && packData.hashtags_sugeridas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Hashtags Sugeridas
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(packData.hashtags_sugeridas.join(" "))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {packData.hashtags_sugeridas.map((tag: string, i: number) => (
                    <Badge key={i} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Image Generation Modal */}
      {selectedContent && (
        <ImageGenerationModal
          open={imageModalOpen}
          onOpenChange={setImageModalOpen}
          copy={selectedContent.copy}
          pilar={selectedContent.pilar}
        />
      )}
    </Dialog>
  );
}
