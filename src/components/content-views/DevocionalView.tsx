import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Book, MessageSquare, Target } from "lucide-react";

interface DevocionalViewProps {
  devocional: {
    titulo: string;
    reflexao: string;
    perguntas_pessoais: string[];
    oracao: string;
    desafio_do_dia: string;
  };
}

export const DevocionalView = ({ devocional }: DevocionalViewProps) => {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-purple-500" />
            {devocional.titulo}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="w-5 h-5" />
            Reflexão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-muted-foreground">{devocional.reflexao}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Perguntas para Reflexão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
            {devocional.perguntas_pessoais.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <Heart className="w-5 h-5" />
            Oração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="italic text-muted-foreground">{devocional.oracao}</p>
        </CardContent>
      </Card>

      <Card className="bg-green-500/10 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Target className="w-5 h-5" />
            Desafio do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium text-muted-foreground">{devocional.desafio_do_dia}</p>
        </CardContent>
      </Card>
    </div>
  );
};
