import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, BookOpen } from "lucide-react";

interface QAEstruturadoViewProps {
  qa: {
    tema: string;
    introducao: string;
    questoes: Array<{
      numero: number;
      pergunta: string;
      resposta: string;
      versiculo_relacionado: string;
    }>;
  };
}

export const QAEstruturadoView = ({ qa }: QAEstruturadoViewProps) => {
  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <CardTitle>Perguntas e Respostas: {qa.tema}</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{qa.introducao}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qa.questoes.map((questao, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-xs">
                        {questao.numero}
                      </Badge>
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="font-semibold text-primary mb-2">❓ {questao.pergunta}</p>
                          <p className="text-sm text-muted-foreground">{questao.resposta}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg flex items-start gap-2">
                          <BookOpen className="h-4 w-4 text-primary mt-0.5" />
                          <p className="text-sm text-muted-foreground italic flex-1">
                            {questao.versiculo_relacionado}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
