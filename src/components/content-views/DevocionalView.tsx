import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Book, MessageSquare, Target } from "lucide-react";

interface DevocionalViewProps {
  titulo?: string;
  reflexao?: string;
  perguntas_pessoais?: string[];
  oracao?: string;
  desafio_do_dia?: string;
  data?: any;
}

export const DevocionalView = ({ 
  titulo = "Devocional",
  reflexao = "",
  perguntas_pessoais = [],
  oracao = "",
  desafio_do_dia = "",
  data
}: DevocionalViewProps) => {
  // Se os dados vierem no objeto 'data', usar esses
  const devocional = data || {
    titulo,
    reflexao,
    perguntas_pessoais,
    oracao,
    desafio_do_dia
  };
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10">
        <CardHeader className="p-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Heart className="h-4 w-4 text-purple-500" />
            <span className="leading-tight">{devocional.titulo}</span>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="p-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Book className="h-4 w-4" />
            Reflexão
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="whitespace-pre-line text-sm text-muted-foreground">{devocional.reflexao}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <MessageSquare className="h-4 w-4" />
            Perguntas para Reflexão
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <ol className="space-y-2 list-decimal list-inside text-sm text-muted-foreground">
            {devocional.perguntas_pessoais.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardHeader className="p-3">
          <CardTitle className="flex items-center gap-2 text-amber-600 text-sm font-semibold">
            <Heart className="h-4 w-4" />
            Oração
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="italic text-sm text-muted-foreground">{devocional.oracao}</p>
        </CardContent>
      </Card>

      <Card className="bg-green-500/10 border-green-500/20">
        <CardHeader className="p-3">
          <CardTitle className="flex items-center gap-2 text-green-600 text-sm font-semibold">
            <Target className="h-4 w-4" />
            Desafio do Dia
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="font-medium text-sm text-muted-foreground">{devocional.desafio_do_dia}</p>
        </CardContent>
      </Card>
    </div>
  );
};
