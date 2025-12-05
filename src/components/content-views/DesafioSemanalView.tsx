import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Circle, Book, Target, Share2, TrendingUp, Copy, RotateCw } from "lucide-react";
import { toast } from "sonner";

interface DesafioSemanalViewProps {
  desafio_semanal?: any;
  fundamento_biblico?: any;
  data?: any;
  onRegenerate?: () => void;
}

export const DesafioSemanalView = ({ desafio_semanal, fundamento_biblico, data, onRegenerate }: DesafioSemanalViewProps) => {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  
  // Normalização robusta - aceita múltiplas estruturas
  const desafio = desafio_semanal || data?.desafio_semanal || data?.desafio || data;
  const fundamento = fundamento_biblico || data?.fundamento_biblico || desafio?.fundamento_biblico;
  
  // Normalizar dias de diferentes estruturas
  let dias = desafio?.dias || [];
  
  // Se veio como objeto dia_1, dia_2, etc
  if (dias.length === 0) {
    for (let i = 1; i <= 7; i++) {
      const diaKey = `dia_${i}`;
      if (desafio?.[diaKey]) {
        const d = desafio[diaKey];
        dias.push({
          dia: i,
          acao: d.desafio || d.acao || d.titulo || '',
          versiculo_do_dia: d.reflexao || d.versiculo || '',
          reflexao: typeof d.reflexao === 'string' ? d.reflexao : '',
          exemplo_pratico: d.exemplo || d.exemplo_pratico || '',
        });
      }
    }
  }
  
  // Validação - mostrar mensagem amigável se dados estão incompletos
  if (!desafio || dias.length === 0) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Desafio semanal incompleto</p>
          <p className="text-sm text-muted-foreground mb-4">
            Os dias do desafio não foram gerados corretamente.
          </p>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline">
              <RotateCw className="w-4 h-4 mr-2" />
              Regenerar Desafio
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const toggleDay = (day: number) => {
    setCompletedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const copyProgress = () => {
    const hashtag = desafio?.como_compartilhar?.hashtag || '#DesafioSemanal';
    const sugestao = desafio?.como_compartilhar?.sugestao_post || 'Estou participando deste desafio!';
    const text = `🔥 Estou no ${completedDays.length}/7 dias do desafio ${desafio?.titulo || 'Semanal'}!\n\n${hashtag}\n\n${sugestao}`;
    navigator.clipboard.writeText(text);
    toast.success("Texto copiado! Cole nas suas redes 🚀");
  };

  const copyAll = () => {
    const allText = `
${fundamento ? `📖 FUNDAMENTO BÍBLICO

${Array.isArray(fundamento.versiculos) ? fundamento.versiculos.join('\n\n') : fundamento.versiculos || ''}

Contexto: ${fundamento.contexto || ''}

Princípio: ${fundamento.principio || fundamento.principio_atemporal || ''}

---` : ''}

🔥 ${desafio?.titulo || 'Desafio Semanal'}

${desafio?.objetivo_espiritual ? `🎯 Objetivo Espiritual: ${desafio.objetivo_espiritual}` : ''}
${desafio?.objetivo_pratico ? `📊 Objetivo Prático: ${desafio.objetivo_pratico}` : ''}
${desafio?.como_funciona ? `\nComo funciona: ${desafio.como_funciona}` : ''}

---

📅 CRONOGRAMA SEMANAL

${dias.map((dia: any) => `
DIA ${dia.dia}
Ação: ${dia.acao || ''}
${dia.versiculo_do_dia ? `Versículo: ${dia.versiculo_do_dia}` : ''}
${dia.reflexao ? `Reflexão: ${dia.reflexao}` : ''}
${dia.exemplo_pratico ? `Exemplo: ${dia.exemplo_pratico}` : ''}
`).join('\n')}
`;
    navigator.clipboard.writeText(allText);
    toast.success("Desafio completo copiado!");
  };

  return (
    <div className="space-y-6">
      {/* Fundamento Bíblico */}
      {fundamento?.versiculos && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" />
              Fundamento Bíblico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {(Array.isArray(fundamento.versiculos) ? fundamento.versiculos : [fundamento.versiculos]).map((v: string, i: number) => (
                <div key={i} className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                  <p className="text-sm leading-relaxed italic">{v}</p>
                </div>
              ))}
            </div>
            {fundamento.contexto && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold text-sm mb-2">Contexto Bíblico</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {fundamento.contexto}
                  </p>
                </div>
              </>
            )}
            {(fundamento.principio || fundamento.principio_atemporal) && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Princípio Atemporal</h4>
                <p className="text-sm font-medium text-primary">
                  {fundamento.principio || fundamento.principio_atemporal}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cabeçalho do Desafio */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="text-base px-3 py-1">{desafio?.titulo || 'Desafio Semanal'}</Badge>
              </div>
              {desafio?.objetivo_espiritual && (
                <CardTitle className="text-xl">{desafio.objetivo_espiritual}</CardTitle>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{completedDays.length}/7</div>
              <p className="text-xs text-muted-foreground">dias completos</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {desafio?.objetivo_pratico && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Objetivo Prático</h4>
                  <p className="text-sm text-muted-foreground">{desafio.objetivo_pratico}</p>
                </div>
              </div>
            </div>
          )}
          {desafio?.como_funciona && (
            <div className="text-sm text-muted-foreground">
              <strong>Como funciona:</strong> {desafio.como_funciona}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline dos 7 Dias */}
      <Card>
        <CardHeader>
          <CardTitle>Cronograma Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {dias.map((dia: any) => {
              const diaNum = dia.dia || 1;
              const isCompleted = completedDays.includes(diaNum);
              const isHighlight = diaNum === 1 || diaNum === 4 || diaNum === 7;
              
              return (
                <AccordionItem 
                  key={diaNum} 
                  value={`day-${diaNum}`}
                  className={`border rounded-lg ${isHighlight ? 'border-primary/40' : ''} ${isCompleted ? 'bg-primary/5' : ''}`}
                >
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-3 w-full">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDay(diaNum);
                        }}
                        className="flex-shrink-0"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                        ) : (
                          <Circle className="w-6 h-6 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Dia {diaNum}</span>
                          {isHighlight && (
                            <Badge variant="secondary" className="text-xs">
                              {diaNum === 1 ? 'Início' : diaNum === 4 ? 'Virada' : 'Final'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{dia.acao}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-4">
                    <Separator />
                    {dia.versiculo_do_dia && (
                      <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
                        <p className="text-sm font-medium mb-1">📖 Versículo do dia</p>
                        <p className="text-sm italic text-muted-foreground">{dia.versiculo_do_dia}</p>
                      </div>
                    )}
                    {dia.reflexao && (
                      <div>
                        <p className="text-sm font-medium mb-1">💭 Reflexão</p>
                        <p className="text-sm text-muted-foreground">{dia.reflexao}</p>
                      </div>
                    )}
                    {dia.exemplo_pratico && (
                      <div>
                        <p className="text-sm font-medium mb-1">✅ Exemplo Prático</p>
                        <p className="text-sm text-muted-foreground">{dia.exemplo_pratico}</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Como Compartilhar */}
      {desafio?.como_compartilhar && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Compartilhe seu Progresso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {desafio.como_compartilhar.sugestao_post && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">
                  {desafio.como_compartilhar.sugestao_post}
                </p>
              </div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {desafio.como_compartilhar.hashtag && (
                <Badge variant="secondary" className="text-base">
                  {desafio.como_compartilhar.hashtag}
                </Badge>
              )}
              {desafio.como_compartilhar.formato && (
                <span className="text-xs text-muted-foreground">
                  • {desafio.como_compartilhar.formato}
                </span>
              )}
            </div>
            <Button onClick={copyProgress} variant="outline" className="w-full">
              <Share2 className="w-4 h-4 mr-2" />
              Copiar Texto para Compartilhar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Métricas de Impacto */}
      {desafio?.metricas_de_impacto && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Métricas de Impacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {desafio.metricas_de_impacto.individual && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-1">📊 Individual</p>
                <p className="text-sm text-muted-foreground">{desafio.metricas_de_impacto.individual}</p>
              </div>
            )}
            {desafio.metricas_de_impacto.comunitario && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-1">👥 Comunitário</p>
                <p className="text-sm text-muted-foreground">{desafio.metricas_de_impacto.comunitario}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={copyAll} variant="outline" className="flex-1">
          <Copy className="w-4 h-4 mr-2" />
          Copiar Tudo
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
