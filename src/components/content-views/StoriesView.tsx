import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Layers } from "lucide-react";
import { toast } from "sonner";

interface StoriesViewProps {
  estrutura?: {
    slides: Array<{
      numero: number;
      titulo: string;
      texto: string;
      sugestao_visual?: string;
    }>;
  };
  conteudo?: {
    cta?: string;
  };
  // Suporte para ContentViewer
  data?: any;
  contentType?: string;
}

export function StoriesView({ estrutura, conteudo, data, contentType }: StoriesViewProps) {
  // Extrair valores com fallback para ContentViewer
  const actualEstrutura = estrutura || data?.estrutura;
  const actualConteudo = conteudo || data?.conteudo;
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  return (
    <div className="space-y-6">
      {/* Slides dos Stories */}
      {estrutura?.slides && estrutura.slides.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Sequência de Stories - {estrutura.slides.length} Slides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {estrutura.slides.map((slide) => (
              <Card key={slide.numero} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Slide {slide.numero}: {slide.titulo}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(
                        `${slide.titulo}\n\n${slide.texto}${slide.visual ? `\n\nVisual: ${slide.visual}` : ''}`,
                        `Slide ${slide.numero}`
                      )}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">{slide.texto}</p>
                  {slide.visual && (
                    <div className="mt-3 pt-3 border-t">
                      <strong>Sugestão Visual:</strong>
                      <p className="text-muted-foreground">{slide.visual}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      {conteudo?.cta && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Call to Action</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(conteudo.cta!, "CTA")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{conteudo.cta}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
