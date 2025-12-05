import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, ExternalLink, Copy, RotateCw } from "lucide-react";
import { toast } from "sonner";

interface KitBasicoViewProps {
  data?: any;
  kit?: any;
  onRegenerate?: () => void;
}

export const KitBasicoView = ({ data, kit, onRegenerate }: KitBasicoViewProps) => {
  // Normalização robusta - aceita múltiplas estruturas
  const k = data || kit || {};
  
  const titulo = k?.titulo || 'Kit Básico';
  const finalidade = k?.finalidade || k?.descricao || k?.objetivo || '';
  const orcamento_estimado = k?.orcamento_estimado || k?.orcamento || 'A definir';
  const itens = k?.itens || k?.equipamentos || k?.lista || [];
  const dicas_uso = k?.dicas_uso || k?.dicas || [];
  
  // Validação
  if (itens.length === 0) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Kit incompleto</p>
          <p className="text-sm text-muted-foreground mb-4">
            Os itens do kit não foram gerados corretamente.
          </p>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline">
              <RotateCw className="w-4 h-4 mr-2" />
              Regenerar Kit
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const copyAll = () => {
    const text = `
📦 ${titulo}
${finalidade ? `\n${finalidade}\n` : ''}
💰 Orçamento Estimado: ${orcamento_estimado}

LISTA DE ITENS

${itens.map((item: any) => `
[${item.categoria || 'Geral'}] ${item.nome || item.item}
Especificação: ${item.especificacao || item.descricao || ''}
Preço: ${item.preco_referencia || item.preco || ''}
${item.alternativa_economica ? `Alternativa: ${item.alternativa_economica}` : ''}
`).join('\n---\n')}

${dicas_uso.length > 0 ? `
💡 DICAS DE USO
${dicas_uso.map((d: string) => `• ${d}`).join('\n')}
` : ''}
`;
    navigator.clipboard.writeText(text);
    toast.success("Kit copiado!");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-800">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl break-words">
                {titulo}
              </CardTitle>
              {finalidade && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  {finalidade}
                </p>
              )}
              <Badge variant="secondary" className="mt-2 flex items-center gap-1 w-fit">
                <DollarSign className="w-3 h-3" />
                Orçamento: {orcamento_estimado}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Itens */}
      <div className="space-y-3">
        {itens.map((item: any, index: number) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Badge variant="outline" className="mb-2 text-xs">
                    {item.categoria || 'Geral'}
                  </Badge>
                  <CardTitle className="text-base sm:text-lg break-words">
                    {item.nome || item.item}
                  </CardTitle>
                </div>
                {(item.preco_referencia || item.preco) && (
                  <Badge className="shrink-0">{item.preco_referencia || item.preco}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(item.especificacao || item.descricao) && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">📋 Especificação</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {item.especificacao || item.descricao}
                  </p>
                </div>
              )}
              
              {(item.alternativa_economica || item.alternativa) && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-2 border-green-500">
                  <h4 className="font-semibold text-sm mb-1 text-green-700 dark:text-green-400">
                    💰 Alternativa Econômica
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {item.alternativa_economica || item.alternativa}
                  </p>
                </div>
              )}
              
              {(item.link_referencia || item.link) && (
                <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                  <a href={item.link_referencia || item.link} target="_blank" rel="noopener noreferrer">
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
      {dicas_uso.length > 0 && (
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">💡 Dicas de Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {dicas_uso.map((dica: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                  <span className="text-amber-600 shrink-0">•</span>
                  <span>{dica}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={copyAll} variant="outline" className="flex-1">
          <Copy className="w-4 h-4 mr-2" />
          Copiar Kit
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
