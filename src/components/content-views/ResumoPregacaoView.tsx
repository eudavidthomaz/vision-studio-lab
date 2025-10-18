import { FileText, Copy, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ResumoPregacaoViewProps {
  data: {
    fundamento_biblico: {
      versiculos: string[];
      contexto: string;
      principio: string;
    };
    resumo_pregacao: {
      titulo: string;
      introducao: string;
      pontos_principais: Array<{
        numero: number;
        titulo: string;
        conteudo: string;
      }>;
      ilustracoes?: string[];
      conclusao: string;
      aplicacao_pratica: string;
    };
    frases_impactantes?: string[];
  };
}

export const ResumoPregacaoView = ({ data }: ResumoPregacaoViewProps) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const copyAll = () => {
    const allText = `
📖 ${data.resumo_pregacao.titulo.toUpperCase()}

FUNDAMENTO BÍBLICO
${data.fundamento_biblico.versiculos.join('\n\n')}

INTRODUÇÃO
${data.resumo_pregacao.introducao}

PONTOS PRINCIPAIS
${data.resumo_pregacao.pontos_principais.map(p => `
${p.numero}. ${p.titulo}
${p.conteudo}
`).join('\n')}

${data.resumo_pregacao.ilustracoes && data.resumo_pregacao.ilustracoes.length > 0 ? `
ILUSTRAÇÕES E HISTÓRIAS
${data.resumo_pregacao.ilustracoes.map((i, idx) => `${idx + 1}. ${i}`).join('\n\n')}
` : ''}

CONCLUSÃO
${data.resumo_pregacao.conclusao}

APLICAÇÃO PRÁTICA
${data.resumo_pregacao.aplicacao_pratica}

${data.frases_impactantes && data.frases_impactantes.length > 0 ? `
FRASES MARCANTES
${data.frases_impactantes.map(f => `• ${f}`).join('\n')}
` : ''}
`;
    copyToClipboard(allText, "Resumo completo");
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <FileText className="w-6 h-6 text-primary" />
            {data.resumo_pregacao.titulo}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Fundamento Bíblico */}
      <Card>
        <CardHeader>
          <CardTitle>Fundamento Bíblico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {data.fundamento_biblico.versiculos.map((versiculo, idx) => (
              <div key={idx} className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                <p className="text-sm leading-relaxed italic">{versiculo}</p>
              </div>
            ))}
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-semibold text-sm mb-2">Contexto</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.fundamento_biblico.contexto}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-2">Princípio Central</h4>
            <p className="text-sm font-medium text-primary">
              {data.fundamento_biblico.principio}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Introdução */}
      <Card>
        <CardHeader>
          <CardTitle>Introdução</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {data.resumo_pregacao.introducao}
          </p>
        </CardContent>
      </Card>

      {/* Pontos Principais */}
      <Card>
        <CardHeader>
          <CardTitle>Pontos Principais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.resumo_pregacao.pontos_principais.map((ponto, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge className="text-base px-3 py-1">{ponto.numero}</Badge>
                <h3 className="font-semibold text-lg">{ponto.titulo}</h3>
              </div>
              <p className="text-sm leading-relaxed pl-12">
                {ponto.conteudo}
              </p>
              {idx < data.resumo_pregacao.pontos_principais.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Ilustrações */}
      {data.resumo_pregacao.ilustracoes && data.resumo_pregacao.ilustracoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Ilustrações e Histórias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.resumo_pregacao.ilustracoes.map((ilustracao, idx) => (
                <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm leading-relaxed">
                    <span className="font-semibold text-primary">{idx + 1}.</span> {ilustracao}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conclusão */}
      <Card>
        <CardHeader>
          <CardTitle>Conclusão</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {data.resumo_pregacao.conclusao}
          </p>
        </CardContent>
      </Card>

      {/* Aplicação Prática */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-primary">Como Aplicar no Dia a Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">
            {data.resumo_pregacao.aplicacao_pratica}
          </p>
        </CardContent>
      </Card>

      {/* Frases Impactantes */}
      {data.frases_impactantes && data.frases_impactantes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Frases Marcantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.frases_impactantes.map((frase, idx) => (
                <div key={idx} className="p-3 bg-gradient-to-r from-primary/10 to-transparent rounded-lg border-l-4 border-primary">
                  <p className="text-sm font-medium italic">"{frase}"</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4 -mx-4 md:mx-0 md:border md:rounded-lg">
        <Button onClick={copyAll} className="w-full">
          <Copy className="w-4 h-4 mr-2" />
          Copiar Resumo Completo
        </Button>
      </div>
    </div>
  );
};
