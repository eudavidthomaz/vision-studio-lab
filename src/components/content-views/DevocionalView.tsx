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
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-500 flex-shrink-0" />
            <span className="leading-tight">{devocional.titulo}</span>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
            <Book className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            Reflexão
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          <p className="whitespace-pre-line text-xs sm:text-sm text-muted-foreground leading-relaxed">{devocional.reflexao}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            Perguntas para Reflexão
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          <ol className="space-y-2 sm:space-y-3 list-decimal list-inside text-xs sm:text-sm text-muted-foreground">
            {devocional.perguntas_pessoais.map((p, i) => (
              <li key={i} className="leading-relaxed">{p}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-amber-600 text-sm sm:text-base md:text-lg">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            Oração
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          <p className="italic text-xs sm:text-sm text-muted-foreground leading-relaxed">{devocional.oracao}</p>
        </CardContent>
      </Card>

      <Card className="bg-green-500/10 border-green-500/20">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-green-600 text-sm sm:text-base md:text-lg">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            Desafio do Dia
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
          <p className="font-medium text-xs sm:text-sm text-muted-foreground leading-relaxed">{devocional.desafio_do_dia}</p>
        </CardContent>
      </Card>
    </div>
  );
};
