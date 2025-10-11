import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Video } from "lucide-react";
import { toast } from "sonner";

interface ReelViewProps {
  roteiro?: {
    cenas: Array<{
      numero: number;
      duracao: string;
      visual: string;
      audio: string;
    }>;
  };
  conteudo?: {
    legenda?: string;
    hashtags?: string[];
  };
  // Suporte para ContentViewer
  data?: any;
  contentType?: string;
}

export function ReelView({ roteiro, conteudo, data, contentType }: ReelViewProps) {
  // Extrair valores com fallback para ContentViewer
  const actualRoteiro = roteiro || data?.roteiro || data?.roteiro_video;
  const actualConteudo = conteudo || data?.conteudo;
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  return (
    <div className="space-y-6">
      {/* Roteiro de Vídeo */}
      {roteiro?.cenas && roteiro.cenas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Roteiro do Reel - {roteiro.cenas.length} Cenas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {roteiro.cenas.map((cena) => (
              <Card key={cena.numero} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Cena {cena.numero} ({cena.duracao})
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(
                        `Cena ${cena.numero}\nDuração: ${cena.duracao}\n\nVisual: ${cena.visual}\n\nÁudio: ${cena.audio}`,
                        `Cena ${cena.numero}`
                      )}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <strong>Visual:</strong>
                    <p className="text-muted-foreground">{cena.visual}</p>
                  </div>
                  <div>
                    <strong>Áudio/Texto:</strong>
                    <p className="text-muted-foreground">{cena.audio}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Legenda */}
      {conteudo?.legenda && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Legenda para Instagram</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(conteudo.legenda!, "Legenda")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm">{conteudo.legenda}</p>
          </CardContent>
        </Card>
      )}

      {/* Hashtags */}
      {actualConteudo?.hashtags && actualConteudo.hashtags.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Hashtags</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(conteudo.hashtags!.join(" "), "Hashtags")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {actualConteudo.hashtags.map((tag, i) => (
                <span key={i} className="text-sm text-primary">
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
