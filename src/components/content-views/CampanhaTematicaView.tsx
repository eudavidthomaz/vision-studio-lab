import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Megaphone, TrendingUp, Calendar, Copy, RotateCw } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";

interface CampanhaTematicaViewProps {
  data?: any;
  campanha?: any;
  onRegenerate?: () => void;
}

export const CampanhaTematicaView = ({ data, campanha, onRegenerate }: CampanhaTematicaViewProps) => {
  // Normalização robusta - aceita múltiplas estruturas
  const camp = data || campanha || {};
  
  const titulo = camp?.titulo || 'Campanha Temática';
  const duracao = camp?.duracao || camp?.periodo || '4 semanas';
  const objetivo_geral = camp?.objetivo_geral || camp?.objetivo || '';
  const semanas = camp?.semanas || camp?.fases || [];
  
  // Validação
  if (semanas.length === 0) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Campanha sem semanas definidas</p>
          <p className="text-sm text-muted-foreground mb-4">
            As semanas da campanha não foram geradas corretamente.
          </p>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline">
              <RotateCw className="w-4 h-4 mr-2" />
              Regenerar Campanha
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const copyAll = () => {
    const text = `
📢 ${titulo}
📅 Duração: ${duracao}

🎯 OBJETIVO GERAL
${objetivo_geral}

📆 CRONOGRAMA SEMANAL

${semanas.map((s: any, i: number) => `
SEMANA ${s.numero || i + 1}: ${s.tema || ''}
Objetivo: ${s.objetivo || ''}
Formatos: ${(s.formatos_sugeridos || []).join(', ')}
${s.exemplo_post ? `Exemplo: ${s.exemplo_post}` : ''}
${(s.metricas || []).length > 0 ? `Métricas: ${s.metricas.join(', ')}` : ''}
`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    toast.success("Campanha copiada!");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200 dark:border-orange-800">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Megaphone className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl break-words">
                {titulo}
              </CardTitle>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {duracao}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Objetivo Geral */}
      {objetivo_geral && (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              Objetivo da Campanha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-muted-foreground">
              {objetivo_geral}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Semanas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Cronograma Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {semanas.map((semana: any, index: number) => (
              <AccordionItem key={index} value={`semana-${index}`}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="shrink-0">
                      Semana {semana.numero || index + 1}
                    </Badge>
                    <span className="text-sm sm:text-base">{semana.tema || semana.titulo}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  
                  {/* Objetivo */}
                  {semana.objetivo && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">🎯 Objetivo</h4>
                      <p className="text-sm text-muted-foreground">
                        {semana.objetivo}
                      </p>
                    </div>
                  )}
                  
                  {/* Formatos Sugeridos */}
                  {semana.formatos_sugeridos && semana.formatos_sugeridos.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">📱 Formatos Sugeridos</h4>
                      <div className="flex flex-wrap gap-2">
                        {semana.formatos_sugeridos.map((formato: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {formato}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Exemplo de Post */}
                  {semana.exemplo_post && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-semibold text-sm mb-2">💡 Exemplo de Post</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {semana.exemplo_post}
                      </p>
                    </div>
                  )}
                  
                  {/* Métricas */}
                  {semana.metricas && semana.metricas.length > 0 && (
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">📊 Métricas de Acompanhamento</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {semana.metricas.map((metrica: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-600">•</span>
                            <span>{metrica}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={copyAll} variant="outline" className="flex-1">
          <Copy className="w-4 h-4 mr-2" />
          Copiar Campanha
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
