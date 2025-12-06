import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Target, CheckCircle2, Copy, RotateCw } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { safeString, safeStringArray } from "@/lib/normalizeContentData";

interface TreinoVoluntarioViewProps {
  data?: any;
  treino?: any;
  onRegenerate?: () => void;
}

export const TreinoVoluntarioView = ({ data, treino, onRegenerate }: TreinoVoluntarioViewProps) => {
  // Normalização robusta - aceita múltiplas estruturas
  const t = data || treino || {};
  
  const titulo = t?.titulo || 'Treino de Voluntário';
  const area_ministerio = t?.area_ministerio || t?.area || t?.ministerio || '';
  const nivel = t?.nivel || 'Iniciante';
  const duracao_estimada = t?.duracao_estimada || t?.duracao || '1 hora';
  const modulos = t?.modulos || t?.aulas || [];
  const checklist_competencias = t?.checklist_competencias || t?.competencias || [];
  
  // Validação
  if (modulos.length === 0) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Treino incompleto</p>
          <p className="text-sm text-muted-foreground mb-4">
            Os módulos do treinamento não foram gerados corretamente.
          </p>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline">
              <RotateCw className="w-4 h-4 mr-2" />
              Regenerar Treino
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const getNivelColor = (n: string) => {
    const colors: Record<string, string> = {
      'Iniciante': 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400',
      'Intermediário': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400',
      'Avançado': 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400',
    };
    return colors[n] || 'bg-gray-100 text-gray-700';
  };

  const copyAll = () => {
    const text = `
🎓 ${titulo}
📋 Área: ${area_ministerio}
📊 Nível: ${nivel}
⏱️ Duração: ${duracao_estimada}

MÓDULOS DE TREINAMENTO

${modulos.map((m: any, i: number) => `
MÓDULO ${m.numero || i + 1}: ${m.titulo || ''}

Objetivos:
${(m.objetivos || []).map((o: string) => `✓ ${o}`).join('\n')}

Conteúdo Teórico:
${m.conteudo_teorico || m.conteudo || m.teoria || ''}

Exercício Prático:
${m.exercicio_pratico || m.exercicio || m.pratica || ''}
`).join('\n---\n')}

✅ CHECKLIST DE COMPETÊNCIAS
${checklist_competencias.map((c: string) => `☐ ${c}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    toast.success("Treino copiado!");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-start gap-3">
            <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl break-words">
                {titulo}
              </CardTitle>
              <div className="flex flex-wrap gap-2 mt-3">
                {area_ministerio && (
                  <Badge variant="secondary" className="text-xs">
                    📋 {area_ministerio}
                  </Badge>
                )}
                <Badge className={getNivelColor(nivel)}>
                  {nivel}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ⏱️ {duracao_estimada}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Módulos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Módulos de Treinamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {modulos.map((modulo: any, index: number) => (
              <AccordionItem key={index} value={`modulo-${index}`}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="shrink-0">
                      Módulo {modulo.numero || index + 1}
                    </Badge>
                    <span className="text-sm sm:text-base">{modulo.titulo}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  
                  {/* Objetivos */}
                  {modulo.objetivos && modulo.objetivos.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Objetivos
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {safeStringArray(modulo.objetivos).map((obj, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                            <span>{safeString(obj)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Conteúdo Teórico */}
                  {(modulo.conteudo_teorico || modulo.conteudo || modulo.teoria) && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">📚 Conteúdo Teórico</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {modulo.conteudo_teorico || modulo.conteudo || modulo.teoria}
                      </p>
                    </div>
                  )}
                  
                  {/* Exercício Prático */}
                  {(modulo.exercicio_pratico || modulo.exercicio || modulo.pratica) && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border-l-4 border-amber-500">
                      <h4 className="font-semibold text-sm mb-2">💪 Exercício Prático</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {modulo.exercicio_pratico || modulo.exercicio || modulo.pratica}
                      </p>
                    </div>
                  )}
                  
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      
      {/* Checklist de Competências */}
      {checklist_competencias.length > 0 && (
        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg text-green-700 dark:text-green-400">
              ✅ Checklist de Competências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              Ao final do treinamento, você deve ser capaz de:
            </p>
            <div className="space-y-2">
              {safeStringArray(checklist_competencias).map((competencia, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-sm">{safeString(competencia)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={copyAll} variant="outline" className="flex-1">
          <Copy className="w-4 h-4 mr-2" />
          Copiar Treino
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
