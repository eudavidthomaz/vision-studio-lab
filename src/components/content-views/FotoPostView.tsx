import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Palette, Hash, Type } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FotoPostViewProps {
  conteudo_criativo: {
    descricao_visual: string;
    sugestoes_composicao: string[];
    legenda_sugerida: string;
  };
  dica_producao: {
    ferramentas?: string[];
    cores?: string[];
    hashtags: string[];
  };
}

export const FotoPostView = ({ conteudo_criativo, dica_producao }: FotoPostViewProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Descrição Visual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-muted-foreground">{conteudo_criativo.descricao_visual}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Sugestões de Composição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
            {conteudo_criativo.sugestoes_composicao.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Legenda Sugerida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-muted-foreground">{conteudo_criativo.legenda_sugerida}</p>
        </CardContent>
      </Card>

      {dica_producao.cores && dica_producao.cores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Paleta de Cores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {dica_producao.cores.map((cor, i) => (
                <Badge key={i} variant="secondary">{cor}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Hashtags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {dica_producao.hashtags.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-blue-600 border-blue-300">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
