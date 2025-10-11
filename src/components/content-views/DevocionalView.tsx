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
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Heart className="h-5 w-5 text-purple-500" />
            <span className="leading-tight">{devocional.titulo}</span>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Book className="h-5 w-5" />
            Reflexão
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <p className="whitespace-pre-line text-sm sm:text-base text-muted-foreground">{devocional.reflexao}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MessageSquare className="h-5 w-5" />
            Perguntas para Reflexão
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <ol className="space-y-2 list-decimal list-inside text-sm sm:text-base text-muted-foreground">
            {devocional.perguntas_pessoais.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-amber-600 text-base sm:text-lg">
            <Heart className="h-5 w-5" />
            Oração
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <p className="italic text-sm sm:text-base text-muted-foreground">{devocional.oracao}</p>
        </CardContent>
      </Card>

      <Card className="bg-green-500/10 border-green-500/20">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-green-600 text-base sm:text-lg">
            <Target className="h-5 w-5" />
            Desafio do Dia
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <p className="font-medium text-sm sm:text-base text-muted-foreground">{devocional.desafio_do_dia}</p>
        </CardContent>
      </Card>
    </div>
  );
};
