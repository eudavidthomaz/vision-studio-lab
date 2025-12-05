import { FileText, Copy, Lightbulb, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ResumoPregacaoViewProps {
  data?: any;
  onRegenerate?: () => void;
}

export const ResumoPregacaoView = ({ data, onRegenerate }: ResumoPregacaoViewProps) => {
  // Normalizar dados de múltiplas estruturas possíveis
  const rawData = data?.resumo_pregacao || data?.resumo || data || {};
  const fb = data?.fundamento_biblico || rawData?.fundamento_biblico || {};
  
  const normalized = {
    fundamento_biblico: {
      versiculos: Array.isArray(fb.versiculos) ? fb.versiculos : fb.versiculos ? [fb.versiculos] : [],
      contexto: fb.contexto || '',
      principio: fb.principio_atemporal || fb.principio || '',
    },
    resumo_pregacao: {
      titulo: rawData.titulo || data?.titulo || 'Resumo da Pregação',
      introducao: rawData.introducao || '',
      pontos_principais: Array.isArray(rawData.pontos_principais) ? rawData.pontos_principais : 
                         Array.isArray(rawData.pontos) ? rawData.pontos : [],
      ilustracoes: Array.isArray(rawData.ilustracoes) ? rawData.ilustracoes : [],
      conclusao: rawData.conclusao || '',
      aplicacao_pratica: rawData.aplicacao_pratica || rawData.aplicacao || '',
    },
    frases_impactantes: Array.isArray(data?.frases_impactantes) ? data.frases_impactantes : 
                        Array.isArray(rawData?.frases_impactantes) ? rawData.frases_impactantes : [],
  };
  
  const hasContent = normalized.resumo_pregacao.titulo && 
    (normalized.resumo_pregacao.introducao || normalized.resumo_pregacao.pontos_principais.length > 0);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const copyAll = () => {
    let allText = `📖 ${normalized.resumo_pregacao.titulo.toUpperCase()}\n\n`;
    
    if (normalized.fundamento_biblico.versiculos.length > 0) {
      allText += `FUNDAMENTO BÍBLICO\n${normalized.fundamento_biblico.versiculos.join('\n\n')}\n\n`;
    }
    
    if (normalized.resumo_pregacao.introducao) {
      allText += `INTRODUÇÃO\n${normalized.resumo_pregacao.introducao}\n\n`;
    }
    
    if (normalized.resumo_pregacao.pontos_principais.length > 0) {
      allText += `PONTOS PRINCIPAIS\n`;
      normalized.resumo_pregacao.pontos_principais.forEach(p => {
        allText += `\n${p.numero || '•'}. ${p.titulo || ''}\n${p.conteudo || ''}\n`;
      });
      allText += '\n';
    }
    
    if (normalized.resumo_pregacao.ilustracoes.length > 0) {
      allText += `ILUSTRAÇÕES E HISTÓRIAS\n`;
      normalized.resumo_pregacao.ilustracoes.forEach((i, idx) => {
        allText += `${idx + 1}. ${i}\n\n`;
      });
    }
    
    if (normalized.resumo_pregacao.conclusao) {
      allText += `CONCLUSÃO\n${normalized.resumo_pregacao.conclusao}\n\n`;
    }
    
    if (normalized.resumo_pregacao.aplicacao_pratica) {
      allText += `APLICAÇÃO PRÁTICA\n${normalized.resumo_pregacao.aplicacao_pratica}\n\n`;
    }
    
    if (normalized.frases_impactantes.length > 0) {
      allText += `FRASES MARCANTES\n`;
      normalized.frases_impactantes.forEach(f => {
        allText += `• ${f}\n`;
      });
    }
    
    copyToClipboard(allText, "Resumo completo");
  };

  if (!hasContent) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Resumo incompleto</p>
          <p className="text-sm text-muted-foreground mb-4">
            O conteúdo não foi gerado corretamente. Tente regenerar.
          </p>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerar
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="w-6 h-6 text-primary" />
              {normalized.resumo_pregacao.titulo}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={copyAll}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Fundamento Bíblico */}
      {normalized.fundamento_biblico.versiculos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fundamento Bíblico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {normalized.fundamento_biblico.versiculos.map((versiculo, idx) => (
                <div key={idx} className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                  <p className="text-sm leading-relaxed italic">{versiculo}</p>
                </div>
              ))}
            </div>
            
            {normalized.fundamento_biblico.contexto && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold text-sm mb-2">Contexto</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {normalized.fundamento_biblico.contexto}
                  </p>
                </div>
              </>
            )}
            
            {normalized.fundamento_biblico.principio && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Princípio Central</h4>
                <p className="text-sm font-medium text-primary">
                  {normalized.fundamento_biblico.principio}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Introdução */}
      {normalized.resumo_pregacao.introducao && (
        <Card>
          <CardHeader>
            <CardTitle>Introdução</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {normalized.resumo_pregacao.introducao}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pontos Principais */}
      {normalized.resumo_pregacao.pontos_principais.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pontos Principais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {normalized.resumo_pregacao.pontos_principais.map((ponto, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge className="text-base px-3 py-1">{ponto.numero || idx + 1}</Badge>
                  <h3 className="font-semibold text-lg">{ponto.titulo || `Ponto ${idx + 1}`}</h3>
                </div>
                <p className="text-sm leading-relaxed pl-12">
                  {ponto.conteudo || ''}
                </p>
                {idx < normalized.resumo_pregacao.pontos_principais.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Ilustrações */}
      {normalized.resumo_pregacao.ilustracoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Ilustrações e Histórias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {normalized.resumo_pregacao.ilustracoes.map((ilustracao, idx) => (
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
      {normalized.resumo_pregacao.conclusao && (
        <Card>
          <CardHeader>
            <CardTitle>Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {normalized.resumo_pregacao.conclusao}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Aplicação Prática */}
      {normalized.resumo_pregacao.aplicacao_pratica && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Como Aplicar no Dia a Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">
              {normalized.resumo_pregacao.aplicacao_pratica}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Frases Impactantes */}
      {normalized.frases_impactantes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Frases Marcantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {normalized.frases_impactantes.map((frase, idx) => (
                <div key={idx} className="p-3 bg-gradient-to-r from-primary/10 to-transparent rounded-lg border-l-4 border-primary">
                  <p className="text-sm font-medium italic">"{frase}"</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
