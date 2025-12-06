import { Book, Copy, CheckCircle2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { normalizeEstudoBiblicoData, safeString } from "@/lib/normalizeContentData";

interface EstudoBiblicoViewProps {
  data?: any;
  onRegenerate?: () => void;
}

export const EstudoBiblicoView = ({ data, onRegenerate }: EstudoBiblicoViewProps) => {
  // Normalizar dados de múltiplas fontes
  const normalized = normalizeEstudoBiblicoData(data);
  
  const { fundamento_biblico, estudo_biblico } = normalized;
  const hasContent = estudo_biblico.tema && (estudo_biblico.desenvolvimento.length > 0 || estudo_biblico.introducao);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const copyAll = () => {
    let allText = `📖 ${estudo_biblico.tema.toUpperCase()}\n\n`;
    
    if (fundamento_biblico.versiculos.length > 0) {
      allText += `📜 VERSÍCULOS BASE:\n${fundamento_biblico.versiculos.join('\n\n')}\n\n`;
    }
    
    if (fundamento_biblico.contexto) {
      allText += `📚 CONTEXTO:\n${fundamento_biblico.contexto}\n\n`;
    }
    
    if (fundamento_biblico.principio_atemporal) {
      allText += `💡 PRINCÍPIO:\n${fundamento_biblico.principio_atemporal}\n\n`;
    }
    
    if (estudo_biblico.introducao) {
      allText += `INTRODUÇÃO\n${estudo_biblico.introducao}\n\n`;
    }
    
    if (estudo_biblico.desenvolvimento.length > 0) {
      allText += `DESENVOLVIMENTO\n`;
      estudo_biblico.desenvolvimento.forEach((item, i) => {
        allText += `\n${i + 1}. ${item.ponto}\n${item.explicacao}\n→ Aplicação: ${item.aplicacao}\n`;
      });
      allText += '\n';
    }
    
    if (estudo_biblico.perguntas.length > 0) {
      allText += `PERGUNTAS PARA REFLEXÃO\n`;
      estudo_biblico.perguntas.forEach((p, i) => {
        allText += `${i + 1}. ${p}\n`;
      });
      allText += '\n';
    }
    
    if (estudo_biblico.conclusao) {
      allText += `CONCLUSÃO\n${estudo_biblico.conclusao}\n\n`;
    }
    
    if (estudo_biblico.desafio) {
      allText += `DESAFIO SEMANAL\n${estudo_biblico.desafio}`;
    }
    
    copyToClipboard(allText, "Estudo bíblico completo");
  };

  if (!hasContent) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Estudo Bíblico incompleto</p>
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
              <Book className="w-6 h-6 text-primary" />
              {estudo_biblico.tema}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={copyAll}>
              <Copy className="w-4 h-4 mr-2" />
              Copiar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Fundamento Bíblico */}
      {(fundamento_biblico.versiculos.length > 0 || fundamento_biblico.contexto) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="w-5 h-5 text-primary" />
              Fundamento Bíblico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fundamento_biblico.versiculos.length > 0 && (
              <div className="space-y-3">
                {fundamento_biblico.versiculos.map((versiculo, idx) => (
                  <div key={idx} className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                    <p className="text-sm leading-relaxed italic">{safeString(versiculo)}</p>
                  </div>
                ))}
              </div>
            )}
            
            {fundamento_biblico.contexto && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold text-sm mb-2">Contexto Histórico e Cultural</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {fundamento_biblico.contexto}
                  </p>
                </div>
              </>
            )}
            
            {fundamento_biblico.principio_atemporal && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Princípio Atemporal</h4>
                <p className="text-sm font-medium text-primary">
                  {fundamento_biblico.principio_atemporal}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Introdução */}
      {estudo_biblico.introducao && (
        <Card>
          <CardHeader>
            <CardTitle>Introdução</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {estudo_biblico.introducao}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Desenvolvimento */}
      {estudo_biblico.desenvolvimento.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Desenvolvimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {estudo_biblico.desenvolvimento.map((item, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg">{item.ponto}</h3>
                    <p className="text-sm leading-relaxed">{item.explicacao}</p>
                    {item.aplicacao && (
                      <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
                        <p className="text-sm font-medium flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                          <span><strong>Aplicação Prática:</strong> {item.aplicacao}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {idx < estudo_biblico.desenvolvimento.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Perguntas para Reflexão */}
      {estudo_biblico.perguntas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Perguntas para Reflexão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {estudo_biblico.perguntas.map((pergunta, idx) => (
                <div key={idx} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                  <span className="text-primary font-bold flex-shrink-0">{idx + 1}.</span>
                  <p className="text-sm">{safeString(pergunta)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conclusão */}
      {estudo_biblico.conclusao && (
        <Card>
          <CardHeader>
            <CardTitle>Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {estudo_biblico.conclusao}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Desafio */}
      {estudo_biblico.desafio && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Desafio Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed font-medium">
              {estudo_biblico.desafio}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};