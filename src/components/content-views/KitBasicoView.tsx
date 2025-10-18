import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, DollarSign, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KitBasicoViewProps {
  data: {
    titulo: string;
    finalidade: string;
    orcamento_estimado: string;
    itens: Array<{
      categoria: string;
      nome: string;
      especificacao: string;
      preco_referencia: string;
      alternativa_economica?: string;
      link_referencia?: string;
    }>;
    dicas_uso: string[];
  };
}

export const KitBasicoView = ({ data }: KitBasicoViewProps) => {
  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 max-w-4xl mx-auto">
      
      {/* Header */}
      <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-800">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl break-words">
                {data.titulo}
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                {data.finalidade}
              </p>
              <Badge variant="secondary" className="mt-2 flex items-center gap-1 w-fit">
                <DollarSign className="w-3 h-3" />
                Orçamento: {data.orcamento_estimado}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Itens */}
      <div className="space-y-3">
        {data.itens?.map((item, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Badge variant="outline" className="mb-2 text-xs">
                    {item.categoria}
                  </Badge>
                  <CardTitle className="text-base sm:text-lg break-words">
                    {item.nome}
                  </CardTitle>
                </div>
                <Badge className="shrink-0">{item.preco_referencia}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-1">📋 Especificação</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {item.especificacao}
                </p>
              </div>
              
              {item.alternativa_economica && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-2 border-green-500">
                  <h4 className="font-semibold text-sm mb-1 text-green-700 dark:text-green-400">
                    💰 Alternativa Econômica
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {item.alternativa_economica}
                  </p>
                </div>
              )}
              
              {item.link_referencia && (
                <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                  <a href={item.link_referencia} target="_blank" rel="noopener noreferrer">
                    Ver Referência
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Dicas de Uso */}
      {data.dicas_uso && data.dicas_uso.length > 0 && (
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">💡 Dicas de Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.dicas_uso.map((dica, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                  <span className="text-amber-600 shrink-0">•</span>
                  <span>{dica}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
    </div>
  );
};
