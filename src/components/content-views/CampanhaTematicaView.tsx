import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, TrendingUp, Calendar } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface CampanhaTematicaViewProps {
  data: {
    titulo: string;
    duracao: string;
    objetivo_geral: string;
    semanas: Array<{
      numero: number;
      tema: string;
      objetivo: string;
      formatos_sugeridos: string[];
      exemplo_post: string;
      metricas: string[];
    }>;
  };
}

export const CampanhaTematicaView = ({ data }: CampanhaTematicaViewProps) => {
  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 max-w-4xl mx-auto">
      
      {/* Header */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200 dark:border-orange-800">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Megaphone className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl break-words">
                {data.titulo}
              </CardTitle>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {data.duracao}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Objetivo Geral */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            Objetivo da Campanha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm sm:text-base text-muted-foreground">
            {data.objetivo_geral}
          </p>
        </CardContent>
      </Card>
      
      {/* Semanas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Cronograma Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {data.semanas?.map((semana, index) => (
              <AccordionItem key={index} value={`semana-${index}`}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="shrink-0">
                      Semana {semana.numero}
                    </Badge>
                    <span className="text-sm sm:text-base">{semana.tema}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  
                  {/* Objetivo */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">🎯 Objetivo</h4>
                    <p className="text-sm text-muted-foreground">
                      {semana.objetivo}
                    </p>
                  </div>
                  
                  {/* Formatos Sugeridos */}
                  {semana.formatos_sugeridos && semana.formatos_sugeridos.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">📱 Formatos Sugeridos</h4>
                      <div className="flex flex-wrap gap-2">
                        {semana.formatos_sugeridos.map((formato, i) => (
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
                        {semana.metricas.map((metrica, i) => (
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
      
    </div>
  );
};
