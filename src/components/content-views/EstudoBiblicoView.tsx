import { Book, Copy, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface EstudoBiblicoViewProps {
  data: {
    fundamento_biblico: {
      versiculos: string[];
      contexto: string;
      principio?: string;
      principio_atemporal?: string;
    };
    estudo_biblico: {
      tema: string;
      introducao: string;
      desenvolvimento: Array<{
        ponto: string;
        explicacao: string;
        aplicacao: string;
      }>;
      perguntas: string[];
      conclusao: string;
      desafio: string;
    };
  };
}

export const EstudoBiblicoView = ({ data }: EstudoBiblicoViewProps) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const copyAll = () => {
    const allText = `
${data.estudo_biblico.tema.toUpperCase()}

${data.fundamento_biblico.versiculos.join('\n\n')}

INTRODUÇÃO
${data.estudo_biblico.introducao}

DESENVOLVIMENTO
${data.estudo_biblico.desenvolvimento.map((item, i) => `
${i + 1}. ${item.ponto}

${item.explicacao}

→ Aplicação Prática: ${item.aplicacao}
`).join('\n')}

PERGUNTAS PARA REFLEXÃO
${data.estudo_biblico.perguntas.map((p, i) => `${i + 1}. ${p}`).join('\n')}

CONCLUSÃO
${data.estudo_biblico.conclusao}

DESAFIO SEMANAL
${data.estudo_biblico.desafio}
`;
    copyToClipboard(allText, "Estudo bíblico completo");
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Book className="w-6 h-6 text-primary" />
            {data.estudo_biblico.tema}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Fundamento Bíblico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="w-5 h-5 text-primary" />
            Fundamento Bíblico
          </CardTitle>
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
            <h4 className="font-semibold text-sm mb-2">Contexto Histórico e Cultural</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.fundamento_biblico.contexto}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-2">Princípio Atemporal</h4>
            <p className="text-sm font-medium text-primary">
              {data.fundamento_biblico.principio_atemporal || data.fundamento_biblico.principio}
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
            {data.estudo_biblico.introducao}
          </p>
        </CardContent>
      </Card>

      {/* Desenvolvimento */}
      <Card>
        <CardHeader>
          <CardTitle>Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.estudo_biblico.desenvolvimento.map((item, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg">{item.ponto}</h3>
                  <p className="text-sm leading-relaxed">{item.explicacao}</p>
                  <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
                    <p className="text-sm font-medium flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                      <span><strong>Aplicação Prática:</strong> {item.aplicacao}</span>
                    </p>
                  </div>
                </div>
              </div>
              {idx < data.estudo_biblico.desenvolvimento.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Perguntas para Reflexão */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas para Reflexão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.estudo_biblico.perguntas.map((pergunta, idx) => (
              <div key={idx} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                <span className="text-primary font-bold flex-shrink-0">{idx + 1}.</span>
                <p className="text-sm">{pergunta}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conclusão */}
      <Card>
        <CardHeader>
          <CardTitle>Conclusão</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {data.estudo_biblico.conclusao}
          </p>
        </CardContent>
      </Card>

      {/* Desafio */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-primary">Desafio Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed font-medium">
            {data.estudo_biblico.desafio}
          </p>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4 -mx-4 md:mx-0 md:border md:rounded-lg">
        <Button onClick={copyAll} className="w-full">
          <Copy className="w-4 h-4 mr-2" />
          Copiar Estudo Completo
        </Button>
      </div>
    </div>
  );
};
