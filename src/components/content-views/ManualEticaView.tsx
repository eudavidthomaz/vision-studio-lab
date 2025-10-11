import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ManualEticaViewProps {
  data: {
    titulo: string;
    introducao: string;
    principios_gerais: string[];
    secoes: Array<{
      titulo: string;
      contexto: string;
      fazer: string[];
      nao_fazer: string[];
      exemplo_pratico: string;
    }>;
  };
}

export const ManualEticaView = ({ data }: ManualEticaViewProps) => {
  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 max-w-4xl mx-auto">
      
      {/* Header */}
      <Card className="bg-gradient-to-br from-slate-500/10 to-zinc-500/10 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl break-words">
                {data.titulo}
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Guia de proteção de imagem e comunicação responsável
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Introdução */}
      {data.introducao && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Introdução</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line">
              {data.introducao}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Princípios Gerais */}
      {data.principios_gerais && data.principios_gerais.length > 0 && (
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Princípios Fundamentais</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.principios_gerais.map((principio, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{principio}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Seções */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Diretrizes Detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {data.secoes?.map((secao, index) => (
              <AccordionItem key={index} value={`secao-${index}`}>
                <AccordionTrigger className="text-left text-sm sm:text-base">
                  {secao.titulo}
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
                        {secao.fazer.map((item, i) => (
                          <li key={i} className="text-xs sm:text-sm flex items-start gap-2">
                            <span className="text-green-600">•</span>
                            <span>{item}</span>
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
                        {secao.nao_fazer.map((item, i) => (
                          <li key={i} className="text-xs sm:text-sm flex items-start gap-2">
                            <span className="text-red-600">•</span>
                            <span>{item}</span>
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
      
    </div>
  );
};
