import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Circle, Book, Target, Share2, TrendingUp, Copy, Save, RotateCw } from "lucide-react";
import { toast } from "sonner";

interface DesafioSemanalProps {
  data: any;
  onSave: () => void;
  onRegenerate: () => void;
  isSaving: boolean;
}

export const DesafioSemanalView = ({ data, onSave, onRegenerate, isSaving }: DesafioSemanalProps) => {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const desafio = data.desafio_semanal;

  const toggleDay = (day: number) => {
    setCompletedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const copyProgress = () => {
    const text = `🔥 Estou no ${completedDays.length}/7 dias do desafio ${desafio.titulo}!\n\n${desafio.como_compartilhar.hashtag}\n\n${desafio.como_compartilhar.sugestao_post}`;
    navigator.clipboard.writeText(text);
    toast.success("Texto copiado! Cole nas suas redes 🚀");
  };

  const copyAll = () => {
    const allText = `
📖 FUNDAMENTO BÍBLICO

${data.fundamento_biblico.versiculos.join('\n\n')}

Contexto: ${data.fundamento_biblico.contexto}

Princípio: ${data.fundamento_biblico.principio_atemporal}

---

🔥 ${desafio.titulo}

🎯 Objetivo Espiritual: ${desafio.objetivo_espiritual}
📊 Objetivo Prático: ${desafio.objetivo_pratico}

Como funciona: ${desafio.como_funciona}

---

📅 CRONOGRAMA SEMANAL

${desafio.dias.map((dia: any) => `
DIA ${dia.dia}
Ação: ${dia.acao}
Versículo: ${dia.versiculo_do_dia}
Reflexão: ${dia.reflexao}
Exemplo: ${dia.exemplo_pratico}
`).join('\n')}

---

📱 COMO COMPARTILHAR

${desafio.como_compartilhar.hashtag}
${desafio.como_compartilhar.sugestao_post}
Formato: ${desafio.como_compartilhar.formato}

---

📈 MÉTRICAS DE IMPACTO

Individual: ${desafio.metricas_de_impacto.individual}
Comunitário: ${desafio.metricas_de_impacto.comunitario}
`;
    navigator.clipboard.writeText(allText);
    toast.success("Desafio completo copiado!");
  };

  return (
    <div className="space-y-6">
      {/* Fundamento Bíblico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            Fundamento Bíblico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {data.fundamento_biblico.versiculos.map((v: string, i: number) => (
              <div key={i} className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                <p className="text-sm leading-relaxed italic">{v}</p>
              </div>
            ))}
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold text-sm mb-2">Contexto Bíblico</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.fundamento_biblico.contexto}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Princípio Atemporal</h4>
            <p className="text-sm font-medium text-primary">
              {data.fundamento_biblico.principio_atemporal}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cabeçalho do Desafio */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="text-base px-3 py-1">{desafio.titulo}</Badge>
              </div>
              <CardTitle className="text-2xl">{desafio.objetivo_espiritual}</CardTitle>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{completedDays.length}/7</div>
              <p className="text-xs text-muted-foreground">dias completos</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Objetivo Prático</h4>
                <p className="text-sm text-muted-foreground">{desafio.objetivo_pratico}</p>
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>Como funciona:</strong> {desafio.como_funciona}
          </div>
        </CardContent>
      </Card>

      {/* Timeline dos 7 Dias */}
      <Card>
        <CardHeader>
          <CardTitle>Cronograma Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {desafio.dias.map((dia: any, idx: number) => {
              const isCompleted = completedDays.includes(dia.dia);
              const isHighlight = dia.dia === 1 || dia.dia === 4 || dia.dia === 7;
              
              return (
                <AccordionItem 
                  key={dia.dia} 
                  value={`day-${dia.dia}`}
                  className={`border rounded-lg ${isHighlight ? 'border-primary/40' : ''} ${isCompleted ? 'bg-primary/5' : ''}`}
                >
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-3 w-full">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDay(dia.dia);
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
                          <span className="font-semibold">Dia {dia.dia}</span>
                          {isHighlight && (
                            <Badge variant="secondary" className="text-xs">
                              {dia.dia === 1 ? 'Início' : dia.dia === 4 ? 'Virada' : 'Final'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{dia.acao}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-4">
                    <Separator />
                    <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
                      <p className="text-sm font-medium mb-1">📖 Versículo do dia</p>
                      <p className="text-sm italic text-muted-foreground">{dia.versiculo_do_dia}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">💭 Reflexão</p>
                      <p className="text-sm text-muted-foreground">{dia.reflexao}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">✅ Exemplo Prático</p>
                      <p className="text-sm text-muted-foreground">{dia.exemplo_pratico}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Como Compartilhar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Compartilhe seu Progresso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm whitespace-pre-wrap">
              {desafio.como_compartilhar.sugestao_post}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-base">
              {desafio.como_compartilhar.hashtag}
            </Badge>
            <span className="text-xs text-muted-foreground">
              • {desafio.como_compartilhar.formato}
            </span>
          </div>
          <Button onClick={copyProgress} variant="outline" className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Copiar Texto para Compartilhar
          </Button>
        </CardContent>
      </Card>

      {/* Métricas de Impacto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Métricas de Impacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-1">📊 Individual</p>
            <p className="text-sm text-muted-foreground">{desafio.metricas_de_impacto.individual}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-1">👥 Comunitário</p>
            <p className="text-sm text-muted-foreground">{desafio.metricas_de_impacto.comunitario}</p>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4 -mx-4 md:mx-0 md:border md:rounded-lg flex flex-col sm:flex-row gap-3">
        <Button onClick={onSave} disabled={isSaving} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Salvando..." : "Salvar Desafio"}
        </Button>
        <Button onClick={copyAll} variant="outline" className="flex-1">
          <Copy className="w-4 h-4 mr-2" />
          Copiar Tudo
        </Button>
        <Button onClick={onRegenerate} variant="outline" className="flex-1">
          <RotateCw className="w-4 h-4 mr-2" />
          Regenerar
        </Button>
      </div>
    </div>
  );
};
