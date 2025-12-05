import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Copy, Clock, Sparkles, Lightbulb, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { FundamentoBiblicoCard } from "./shared/FundamentoBiblicoCard";

interface RoteiroReelsViewProps {
  data?: any;
  onRegenerate?: () => void;
}

export const RoteiroReelsView = ({ data, onRegenerate }: RoteiroReelsViewProps) => {
  // Normalizar dados de múltiplas estruturas possíveis
  const rawData = data?.roteiro_reels || data?.roteiro || data || {};
  const ev = rawData.estrutura_visual || rawData || {};
  const dp = rawData.dica_producao || rawData.dicas || {};
  
  const normalized = {
    titulo: rawData.titulo || data?.titulo || 'Roteiro de Reels',
    fundamento_biblico: rawData.fundamento_biblico || data?.fundamento_biblico,
    estrutura_visual: {
      hook: ev.hook || '',
      desenvolvimento: ev.desenvolvimento || ev.conteudo || '',
      cta: ev.cta || ev.chamada_acao || '',
      duracao_total: ev.duracao_total || ev.duracao || '15s',
      audio_sugerido: ev.audio_sugerido || ev.audio || '',
      texto_tela: Array.isArray(ev.texto_tela) ? ev.texto_tela : [],
    },
    legenda: rawData.legenda || '',
    dica_producao: {
      iluminacao: dp.iluminacao || '',
      angulo_camera: dp.angulo_camera || dp.angulo || '',
      edicao: dp.edicao || '',
      melhor_horario: dp.melhor_horario || '',
      hashtags: Array.isArray(dp.hashtags) ? dp.hashtags : [],
    },
  };
  
  const hasContent = normalized.titulo && (normalized.estrutura_visual.hook || normalized.estrutura_visual.desenvolvimento);

  const copyScript = () => {
    let text = `🎬 ROTEIRO DO REEL: ${normalized.titulo}\n\n`;
    text += `⏱️ DURAÇÃO: ${normalized.estrutura_visual.duracao_total}\n\n`;
    
    if (normalized.estrutura_visual.hook) {
      text += `📍 HOOK (0-3s):\n${normalized.estrutura_visual.hook}\n\n`;
    }
    if (normalized.estrutura_visual.desenvolvimento) {
      text += `📍 DESENVOLVIMENTO (3-10s):\n${normalized.estrutura_visual.desenvolvimento}\n\n`;
    }
    if (normalized.estrutura_visual.cta) {
      text += `📍 CTA (10-15s):\n${normalized.estrutura_visual.cta}\n\n`;
    }
    if (normalized.estrutura_visual.audio_sugerido) {
      text += `🎵 ÁUDIO:\n${normalized.estrutura_visual.audio_sugerido}\n\n`;
    }
    if (normalized.legenda) {
      text += `📝 LEGENDA:\n${normalized.legenda}\n\n`;
    }
    if (normalized.dica_producao.hashtags.length > 0) {
      text += `#️⃣ HASHTAGS:\n${normalized.dica_producao.hashtags.join(' ')}`;
    }
    
    navigator.clipboard.writeText(text.trim());
    toast.success("Roteiro copiado!");
  };

  if (!hasContent) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Roteiro incompleto</p>
          <p className="text-sm text-muted-foreground mb-4">
            O conteúdo não foi gerado corretamente. Tente regenerar.
          </p>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerar
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 max-w-4xl mx-auto">
      
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Video className="w-6 h-6 text-purple-600 shrink-0" />
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    Reel / Short
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {normalized.estrutura_visual.duracao_total}
                  </Badge>
                </div>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl break-words">
                  {normalized.titulo}
                </CardTitle>
              </div>
            </div>
            <Button onClick={copyScript} size="sm" className="shrink-0">
              <Copy className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Copiar</span>
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      {/* Fundamento Bíblico */}
      {normalized.fundamento_biblico && (
        <FundamentoBiblicoCard fundamento={normalized.fundamento_biblico} />
      )}
      
      {/* Hook */}
      {normalized.estrutura_visual.hook && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="bg-red-50 dark:bg-red-950/20">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-600" />
              Hook (0-3s)
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Primeiros 3 segundos para parar o scroll
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm sm:text-base font-medium whitespace-pre-line">
              {normalized.estrutura_visual.hook}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Desenvolvimento */}
      {normalized.estrutura_visual.desenvolvimento && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
            <CardTitle className="text-base sm:text-lg">Desenvolvimento (3-10s)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm sm:text-base whitespace-pre-line text-muted-foreground">
              {normalized.estrutura_visual.desenvolvimento}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* CTA */}
      {normalized.estrutura_visual.cta && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="bg-green-50 dark:bg-green-950/20">
            <CardTitle className="text-base sm:text-lg">Call to Action (10-15s)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm sm:text-base font-medium whitespace-pre-line">
              {normalized.estrutura_visual.cta}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Texto na Tela */}
      {normalized.estrutura_visual.texto_tela.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Texto na Tela (Overlays)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {normalized.estrutura_visual.texto_tela.map((texto, i) => (
                <div key={i} className="p-3 bg-primary/5 rounded-md border border-primary/20 text-center">
                  <p className="font-bold text-sm sm:text-lg">{texto}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Dicas de Produção */}
      {(normalized.dica_producao.iluminacao || normalized.dica_producao.angulo_camera || normalized.dica_producao.edicao) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Dicas de Produção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {normalized.dica_producao.iluminacao && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">💡 Iluminação</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {normalized.dica_producao.iluminacao}
                  </p>
                </div>
              )}
              {normalized.dica_producao.angulo_camera && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">📹 Ângulo</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {normalized.dica_producao.angulo_camera}
                  </p>
                </div>
              )}
            </div>
            
            {normalized.dica_producao.edicao && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">✂️ Edição</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {normalized.dica_producao.edicao}
                </p>
              </div>
            )}
            
            {normalized.estrutura_visual.audio_sugerido && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">🎵 Áudio</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {normalized.estrutura_visual.audio_sugerido}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Legenda e Hashtags */}
      {(normalized.legenda || normalized.dica_producao.hashtags.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Legenda e Hashtags</CardTitle>
            {normalized.dica_producao.melhor_horario && (
              <p className="text-xs text-muted-foreground">
                Melhor horário: {normalized.dica_producao.melhor_horario}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {normalized.legenda && (
              <p className="text-sm whitespace-pre-line">{normalized.legenda}</p>
            )}
            {normalized.dica_producao.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-3 border-t">
                {normalized.dica_producao.hashtags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
    </div>
  );
};
