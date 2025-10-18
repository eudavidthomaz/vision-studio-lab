import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users } from "lucide-react";
import { FundamentoBiblicoCard } from "./shared/FundamentoBiblicoCard";

interface PerguntasViewProps {
  data: {
    titulo: string;
    fundamento_biblico?: {
      versiculos: string[];
      contexto: string;
      principio_atemporal: string;
    };
    perguntas: Array<{
      numero: number;
      pergunta: string;
      objetivo: string;
      dica_facilitador: string;
    }>;
    contexto_uso: string;
  };
}

export const PerguntasView = ({ data }: PerguntasViewProps) => {
  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 max-w-4xl mx-auto">
      
      {/* Header */}
      <Card className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-teal-200 dark:border-teal-800">
        <CardHeader>
          <div className="flex items-start gap-3">
            <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl break-words">
                {data.titulo}
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Perguntas para grupos pequenos, células e discussões em comunidade
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Fundamento Bíblico */}
      {data.fundamento_biblico && (
        <FundamentoBiblicoCard fundamento={data.fundamento_biblico} />
      )}
      
      {/* Contexto de Uso */}
      {data.contexto_uso && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              Como Usar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line text-muted-foreground">
              {data.contexto_uso}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Perguntas */}
      <div className="space-y-4">
        {data.perguntas?.map((item, index) => (
          <Card key={index} className="border-l-4 border-l-teal-500">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="shrink-0 font-mono">
                    {item.numero}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base sm:text-lg mb-2 break-words">
                      {item.pergunta}
                    </p>
                    
                    {item.objetivo && (
                      <div className="p-3 bg-teal-50 dark:bg-teal-950/20 rounded-lg mb-3">
                        <p className="text-xs sm:text-sm">
                          <span className="font-semibold">Objetivo:</span> {item.objetivo}
                        </p>
                      </div>
                    )}
                    
                    {item.dica_facilitador && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border-l-2 border-amber-400">
                        <p className="text-xs sm:text-sm">
                          <span className="font-semibold">💡 Dica para o facilitador:</span> {item.dica_facilitador}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
    </div>
  );
};
