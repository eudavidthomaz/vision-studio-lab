import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Clock, Hash, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RoteiroVideoViewProps {
  conteudo_criativo: {
    roteiro: string;
    duracao_estimada: string;
    cta: string;
  };
  dica_producao: {
    formato: string;
    hashtags: string[];
  };
}

export const RoteiroVideoView = ({ conteudo_criativo, dica_producao }: RoteiroVideoViewProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Roteiro do Vídeo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-muted-foreground">{conteudo_criativo.roteiro}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-5 h-5" />
              Duração Estimada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-lg">{conteudo_criativo.duracao_estimada}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Video className="w-5 h-5" />
              Formato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-base px-4 py-1">
              {dica_producao.formato}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-orange-500/10 border-orange-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <Target className="w-5 h-5" />
            Call to Action
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium text-muted-foreground">{conteudo_criativo.cta}</p>
        </CardContent>
      </Card>

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
