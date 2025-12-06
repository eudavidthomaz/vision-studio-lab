import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, BarChart3, Copy, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { safeString, safeStringArray } from "@/lib/normalizeContentData";

interface EstrategiaSocialViewProps {
  data?: any;
  estrategia?: any;
  onRegenerate?: () => void;
}

export const EstrategiaSocialView = ({ data, estrategia, onRegenerate }: EstrategiaSocialViewProps) => {
  // Normalização robusta - aceita múltiplas estruturas
  const e = data || estrategia || {};
  
  const titulo = e?.titulo || 'Estratégia Social';
  const objetivo_estrategico = e?.objetivo_estrategico || e?.objetivo || '';
  const publico_alvo = e?.publico_alvo || e?.publico || '';
  const pilares_conteudo = e?.pilares_conteudo || e?.pilares || [];
  const metricas_acompanhamento = e?.metricas_acompanhamento || e?.metricas || [];
  const proximos_passos = e?.proximos_passos || e?.acoes || [];
  
  // Validação
  if (pilares_conteudo.length === 0 && !objetivo_estrategico) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Estratégia incompleta</p>
          <p className="text-sm text-muted-foreground mb-4">
            O conteúdo da estratégia não foi gerado corretamente.
          </p>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline">
              <RotateCw className="w-4 h-4 mr-2" />
              Regenerar Estratégia
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const copyAll = () => {
    const text = `
📈 ${titulo}

🎯 OBJETIVO ESTRATÉGICO
${objetivo_estrategico}

👥 PÚBLICO-ALVO
${publico_alvo}

📊 PILARES DE CONTEÚDO
${pilares_conteudo.map((p: any) => `
${p.nome || p.titulo}
${p.descricao || ''}
Frequência: ${p.frequencia || ''}
${(p.exemplos || []).length > 0 ? `Exemplos: ${p.exemplos.join(', ')}` : ''}
`).join('\n')}

📈 MÉTRICAS DE ACOMPANHAMENTO
${metricas_acompanhamento.map((m: any) => `• ${m.metrica || m.nome}: Meta ${m.meta} - ${m.como_medir || ''}`).join('\n')}

🚀 PRÓXIMOS PASSOS
${proximos_passos.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    toast.success("Estratégia copiada!");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-200 dark:border-violet-800">
        <CardHeader>
          <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-violet-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl break-words">
                {titulo}
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Plano estratégico para crescimento nas redes sociais
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Objetivo e Público */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {objetivo_estrategico && (
          <Card className="border-l-4 border-l-violet-500">
            <CardHeader>
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Target className="w-4 h-4" />
                Objetivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {objetivo_estrategico}
              </p>
            </CardContent>
          </Card>
        )}
        
        {publico_alvo && (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-sm sm:text-base">Público-Alvo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {publico_alvo}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Pilares de Conteúdo */}
      {pilares_conteudo.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Pilares de Conteúdo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pilares_conteudo.map((pilar: any, index: number) => (
              <div key={index} className="p-4 bg-muted/30 rounded-lg space-y-2">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h4 className="font-semibold text-sm sm:text-base">{pilar.nome || pilar.titulo}</h4>
                  {pilar.frequencia && (
                    <Badge variant="secondary" className="text-xs">
                      {pilar.frequencia}
                    </Badge>
                  )}
                </div>
                {pilar.descricao && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {pilar.descricao}
                  </p>
                )}
                {pilar.exemplos && pilar.exemplos.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold mb-1">Exemplos:</p>
                    <ul className="space-y-1">
                      {safeStringArray(pilar.exemplos).map((exemplo, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-violet-600">•</span>
                          <span>{safeString(exemplo)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Métricas */}
      {metricas_acompanhamento.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              Métricas de Acompanhamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metricas_acompanhamento.map((metrica: any, index: number) => (
                <div key={index} className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="font-semibold text-sm">{metrica.metrica || metrica.nome}</p>
                    {metrica.meta && (
                      <Badge className="bg-green-600 shrink-0 text-xs">
                        Meta: {metrica.meta}
                      </Badge>
                    )}
                  </div>
                  {(metrica.como_medir || metrica.medicao) && (
                    <p className="text-xs text-muted-foreground">
                      {metrica.como_medir || metrica.medicao}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Próximos Passos */}
      {proximos_passos.length > 0 && (
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">🚀 Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {safeStringArray(proximos_passos).map((passo, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                  <Badge variant="outline" className="shrink-0 font-mono">
                    {i + 1}
                  </Badge>
                  <span>{safeString(passo)}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={copyAll} variant="outline" className="flex-1">
          <Copy className="w-4 h-4 mr-2" />
          Copiar Estratégia
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
