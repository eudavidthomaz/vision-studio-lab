import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, FileText } from "lucide-react";
import { toast } from "sonner";

interface PostSimplesViewProps {
  conteudo?: {
    texto?: string;
    legenda?: string;
    hashtags?: string[];
  };
  imagem?: {
    descricao?: string;
    elementos?: string[];
  };
  // Suporte para ContentViewer
  data?: any;
  contentType?: string;
}

export function PostSimplesView({ conteudo, imagem, data, contentType }: PostSimplesViewProps) {
  // Extrair valores com fallback para ContentViewer
  const actualConteudo = conteudo || data?.conteudo;
  const actualImagem = imagem || data?.imagem;
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  return (
    <div className="space-y-6">
      {/* Texto do Post */}
      {actualConteudo?.texto && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Texto do Post
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(conteudo.texto!, "Texto")}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm">{conteudo.texto}</p>
          </CardContent>
        </Card>
      )}

      {/* Legenda */}
      {actualConteudo?.legenda && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Legenda</CardTitle>
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

      {/* Sugestão de Imagem */}
      {actualImagem?.descricao && (
        <Card>
          <CardHeader>
            <CardTitle>Sugestão de Imagem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{imagem.descricao}</p>
            {imagem.elementos && imagem.elementos.length > 0 && (
              <div>
                <strong className="text-sm">Elementos visuais:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {imagem.elementos.map((elemento, i) => (
                    <li key={i} className="text-sm text-muted-foreground">{elemento}</li>
                  ))}
                </ul>
              </div>
            )}
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
