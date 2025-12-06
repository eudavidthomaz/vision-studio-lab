import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle2, Copy, RotateCw } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { safeString, safeStringArray } from "@/lib/normalizeContentData";

interface ManualEticaViewProps {
  data?: any;
  manual?: any;
  onRegenerate?: () => void;
}

export const ManualEticaView = ({ data, manual, onRegenerate }: ManualEticaViewProps) => {
  // Normalização robusta - aceita múltiplas estruturas
  const m = data || manual || {};
  
  const titulo = m?.titulo || 'Manual de Ética';
  const introducao = m?.introducao || '';
  const principios_gerais = m?.principios_gerais || m?.principios || [];
  const secoes = m?.secoes || m?.diretrizes || [];
  
  // Validação
  if (secoes.length === 0 && principios_gerais.length === 0) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Manual incompleto</p>
          <p className="text-sm text-muted-foreground mb-4">
            O conteúdo do manual não foi gerado corretamente.
          </p>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline">
              <RotateCw className="w-4 h-4 mr-2" />
              Regenerar Manual
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const copyAll = () => {
    const text = `
🛡️ ${titulo}

${introducao ? `INTRODUÇÃO\n${introducao}\n` : ''}

${principios_gerais.length > 0 ? `PRINCÍPIOS FUNDAMENTAIS\n${principios_gerais.map((p: string) => `✓ ${p}`).join('\n')}\n` : ''}

DIRETRIZES DETALHADAS

${secoes.map((s: any) => `
${s.titulo || ''}
${s.contexto ? `Contexto: ${s.contexto}` : ''}

✅ FAZER:
${(s.fazer || []).map((f: string) => `• ${f}`).join('\n')}

❌ NÃO FAZER:
${(s.nao_fazer || []).map((n: string) => `• ${n}`).join('\n')}

${s.exemplo_pratico ? `💡 Exemplo: ${s.exemplo_pratico}` : ''}
`).join('\n---\n')}
`;
    navigator.clipboard.writeText(text);
    toast.success("Manual copiado!");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-slate-500/10 to-zinc-500/10 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl break-words">
                {titulo}
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Guia de proteção de imagem e comunicação responsável
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Introdução */}
      {introducao && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Introdução</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line">
              {introducao}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Princípios Gerais */}
      {principios_gerais.length > 0 && (
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Princípios Fundamentais</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {safeStringArray(principios_gerais).map((principio, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{safeString(principio)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Seções */}
      {secoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Diretrizes Detalhadas</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {secoes.map((secao: any, index: number) => (
                <AccordionItem key={index} value={`secao-${index}`}>
                  <AccordionTrigger className="text-left text-sm sm:text-base">
                    {secao.titulo || `Seção ${index + 1}`}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    
                    {/* Contexto */}
                    {secao.contexto && (
                      <p className="text-sm text-muted-foreground">
                        {secao.contexto}
                      </p>
                    )}
                    
                    {/* Fazer */}
                    {secao.fazer && secao.fazer.length > 0 && (
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2 text-green-700 dark:text-green-400 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          ✅ Fazer
                        </h4>
                        <ul className="space-y-1">
                          {safeStringArray(secao.fazer).map((item, i) => (
                            <li key={i} className="text-xs sm:text-sm flex items-start gap-2">
                              <span className="text-green-600">•</span>
                              <span>{safeString(item)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Não Fazer */}
                    {secao.nao_fazer && secao.nao_fazer.length > 0 && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2 text-red-700 dark:text-red-400 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          ❌ Não Fazer
                        </h4>
                        <ul className="space-y-1">
                          {safeStringArray(secao.nao_fazer).map((item, i) => (
                            <li key={i} className="text-xs sm:text-sm flex items-start gap-2">
                              <span className="text-red-600">•</span>
                              <span>{safeString(item)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Exemplo Prático */}
                    {secao.exemplo_pratico && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-blue-500">
                        <h4 className="font-semibold text-sm mb-1">💡 Exemplo Prático</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {secao.exemplo_pratico}
                        </p>
                      </div>
                    )}
                    
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={copyAll} variant="outline" className="flex-1">
          <Copy className="w-4 h-4 mr-2" />
          Copiar Manual
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
