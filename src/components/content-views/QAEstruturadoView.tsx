import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpCircle, BookOpen, Copy, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { safeString } from "@/lib/normalizeContentData";

interface QAEstruturadoViewProps {
  qa?: any;
  data?: any;
  onRegenerate?: () => void;
}

export const QAEstruturadoView = ({ qa, data, onRegenerate }: QAEstruturadoViewProps) => {
  // Normalização robusta - aceita múltiplas estruturas
  const q = qa || data?.qa || data?.qa_estruturado || data?.perguntas_respostas || data || {};
  
  const tema = q?.tema || data?.titulo || 'Perguntas e Respostas';
  const introducao = q?.introducao || '';
  const questoes = q?.questoes || q?.perguntas || q?.items || [];
  
  // Validação
  if (questoes.length === 0) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Q&A vazio</p>
          <p className="text-sm text-muted-foreground mb-4">
            As perguntas e respostas não foram geradas corretamente.
          </p>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline">
              <RotateCw className="w-4 h-4 mr-2" />
              Regenerar Q&A
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const copyAll = () => {
    const text = `
❓ ${tema}

${introducao ? `${introducao}\n` : ''}

${questoes.map((questao: any, i: number) => `
${questao.numero || i + 1}. ${questao.pergunta || questao.questao || ''}

${questao.resposta || ''}
${questao.versiculo_relacionado ? `📖 ${questao.versiculo_relacionado}` : ''}
`).join('\n---\n')}
`;
    navigator.clipboard.writeText(text);
    toast.success("Q&A copiado!");
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <CardTitle>{tema}</CardTitle>
          </div>
          {introducao && (
            <p className="text-sm text-muted-foreground mt-2">{introducao}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questoes.map((questao: any, index: number) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-xs">
                        {questao.numero || index + 1}
                      </Badge>
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="font-semibold text-primary mb-2">
                            ❓ {safeString(questao.pergunta || questao.questao)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {safeString(questao.resposta)}
                          </p>
                        </div>
                        {(questao.versiculo_relacionado || questao.versiculo) && (
                          <div className="p-3 bg-muted/50 rounded-lg flex items-start gap-2">
                            <BookOpen className="h-4 w-4 text-primary mt-0.5" />
                            <p className="text-sm text-muted-foreground italic flex-1">
                              {safeString(questao.versiculo_relacionado || questao.versiculo)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={copyAll} variant="outline" className="flex-1">
          <Copy className="w-4 h-4 mr-2" />
          Copiar Q&A
        </Button>
        {onRegenerate && (
          <Button onClick={onRegenerate} variant="outline" className="flex-1">
            <RotateCw className="w-4 h-4 mr-2" />
            Regenerar
          </Button>
        )}
      </div>
    </div>
  );
};
