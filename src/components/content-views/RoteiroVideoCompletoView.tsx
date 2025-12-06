import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Video, Copy, Clock, Sparkles, Lightbulb, RefreshCw, 
  Target, Users, CheckCircle, BarChart3, Shield, 
  Play, Clapperboard, Megaphone
} from "lucide-react";
import { toast } from "sonner";
import { FundamentoBiblicoCard } from "./shared/FundamentoBiblicoCard";
import { safeString, safeStringArray } from "@/lib/normalizeContentData";

interface RoteiroVideoCompletoViewProps {
  data?: any;
  onRegenerate?: () => void;
}

export const RoteiroVideoCompletoView = ({ data, onRegenerate }: RoteiroVideoCompletoViewProps) => {
  // Normalizar dados de múltiplas estruturas possíveis
  const rawData = data?.roteiro_video_completo || data?.roteiro_reels || data?.roteiro_video || data?.roteiro || data || {};
  
  const normalized = {
    titulo: rawData.titulo || data?.titulo || 'Roteiro de Vídeo',
    duracao_estimada: rawData.duracao_estimada || rawData.duracao || '60-90 segundos',
    formato: rawData.formato || 'Reel / Short',
    fundamento_biblico: rawData.fundamento_biblico || data?.fundamento_biblico,
    
    // Proposta Estratégica
    proposta_estrategica: {
      problema_real: rawData.proposta_estrategica?.problema_real || rawData.problema || '',
      solucao_proposta: rawData.proposta_estrategica?.solucao_proposta || rawData.solucao || '',
      hook_psicologico: rawData.proposta_estrategica?.hook_psicologico || rawData.gancho || '',
      publico_alvo: rawData.proposta_estrategica?.publico_alvo || rawData.publico || '',
    },
    
    // Roteiro
    roteiro: {
      hook: rawData.roteiro?.hook || rawData.hook || rawData.estrutura_visual?.hook || {},
      desenvolvimento: Array.isArray(rawData.roteiro?.desenvolvimento) 
        ? rawData.roteiro.desenvolvimento 
        : rawData.cenas || rawData.estrutura?.cenas || [],
      cta: rawData.roteiro?.cta || rawData.cta || rawData.estrutura_visual?.cta || {},
    },
    
    // Implementação
    implementacao: {
      equipe_solo: rawData.implementacao?.equipe_solo || rawData.como_fazer_sozinho || '',
      equipe_pequena: rawData.implementacao?.equipe_pequena || rawData.equipe_2_5 || '',
      equipe_estruturada: rawData.implementacao?.equipe_estruturada || rawData.equipe_profissional || '',
    },
    
    // Passos práticos
    passos_praticos: safeStringArray(rawData.passos_praticos || rawData.passos || rawData.passo_a_passo || []),
    
    // Métricas
    metricas_de_fruto: {
      indicadores: safeStringArray(rawData.metricas_de_fruto?.indicadores || rawData.metricas?.indicadores || []),
      meta_sugerida: rawData.metricas_de_fruto?.meta_sugerida || rawData.metricas?.meta || '',
      como_medir: rawData.metricas_de_fruto?.como_medir || rawData.metricas?.como_acompanhar || '',
    },
    
    // Filtro Ético
    filtro_etico_teologico: {
      aprovado: rawData.filtro_etico_teologico?.aprovado !== false,
      consideracoes: rawData.filtro_etico_teologico?.consideracoes || rawData.consideracoes_eticas || '',
      cuidados: safeStringArray(rawData.filtro_etico_teologico?.cuidados || rawData.cuidados || []),
    },
    
    // Dicas de Produção
    dicas_producao: {
      iluminacao: rawData.dicas_producao?.iluminacao || rawData.dica_producao?.iluminacao || '',
      audio: rawData.dicas_producao?.audio || rawData.dica_producao?.audio || '',
      edicao: rawData.dicas_producao?.edicao || rawData.dica_producao?.edicao || '',
      musica_sugerida: rawData.dicas_producao?.musica_sugerida || rawData.dica_producao?.audio_sugerido || '',
      hashtags: safeStringArray(rawData.dicas_producao?.hashtags || rawData.dica_producao?.hashtags || rawData.hashtags || []),
      melhor_horario: rawData.dicas_producao?.melhor_horario || rawData.dica_producao?.melhor_horario || '',
    },
  };
  
  // Verificar se há conteúdo mínimo
  const hasHook = normalized.roteiro.hook?.texto || typeof normalized.roteiro.hook === 'string';
  const hasCenas = normalized.roteiro.desenvolvimento.length > 0;
  const hasPropostaEstrategica = normalized.proposta_estrategica.problema_real || normalized.proposta_estrategica.solucao_proposta;
  const hasContent = normalized.titulo && (hasHook || hasCenas || hasPropostaEstrategica);

  const copyAll = () => {
    let text = `🎬 ROTEIRO DE VÍDEO COMPLETO\n\n`;
    text += `📌 TÍTULO: ${normalized.titulo}\n`;
    text += `⏱️ DURAÇÃO: ${normalized.duracao_estimada}\n`;
    text += `📹 FORMATO: ${normalized.formato}\n\n`;
    
    if (hasPropostaEstrategica) {
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `🎯 PROPOSTA ESTRATÉGICA\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      if (normalized.proposta_estrategica.problema_real) {
        text += `❓ Problema: ${normalized.proposta_estrategica.problema_real}\n`;
      }
      if (normalized.proposta_estrategica.solucao_proposta) {
        text += `💡 Solução: ${normalized.proposta_estrategica.solucao_proposta}\n`;
      }
      if (normalized.proposta_estrategica.hook_psicologico) {
        text += `🧠 Gatilho: ${normalized.proposta_estrategica.hook_psicologico}\n`;
      }
      if (normalized.proposta_estrategica.publico_alvo) {
        text += `👥 Público: ${normalized.proposta_estrategica.publico_alvo}\n`;
      }
      text += `\n`;
    }
    
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📹 ROTEIRO DETALHADO\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    if (hasHook) {
      const hookText = typeof normalized.roteiro.hook === 'string' 
        ? normalized.roteiro.hook 
        : normalized.roteiro.hook?.texto || '';
      text += `\n🔥 HOOK (0-3s):\n${hookText}\n`;
    }
    
    if (hasCenas) {
      text += `\n📍 DESENVOLVIMENTO:\n`;
      normalized.roteiro.desenvolvimento.forEach((cena: any, i: number) => {
        text += `\nCena ${i + 1} (${cena.duracao || '?s'}):\n`;
        text += `  📝 Fala: ${cena.texto_fala || cena.texto || cena.audio || ''}\n`;
        text += `  🎥 Visual: ${cena.visual || ''}\n`;
        if (cena.texto_tela) text += `  📺 Texto na tela: ${cena.texto_tela}\n`;
      });
    }
    
    if (normalized.roteiro.cta?.texto || typeof normalized.roteiro.cta === 'string') {
      const ctaText = typeof normalized.roteiro.cta === 'string'
        ? normalized.roteiro.cta
        : normalized.roteiro.cta?.texto || '';
      text += `\n📢 CTA:\n${ctaText}\n`;
    }
    
    if (normalized.passos_praticos.length > 0) {
      text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `✅ PASSO A PASSO\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      normalized.passos_praticos.forEach((passo, i) => {
        text += `${i + 1}. ${passo}\n`;
      });
    }
    
    if (normalized.dicas_producao.hashtags.length > 0) {
      text += `\n#️⃣ HASHTAGS:\n${normalized.dicas_producao.hashtags.join(' ')}\n`;
    }
    
    navigator.clipboard.writeText(text.trim());
    toast.success("Roteiro completo copiado!");
  };

  if (!hasContent) {
    return (
      <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
        <CardContent className="pt-6 text-center">
          <p className="text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Roteiro de vídeo incompleto</p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
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
    <div className="space-y-5 p-3 sm:p-4 max-w-4xl mx-auto">
      
      {/* Header Principal */}
      <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <Video className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-purple-600 text-white hover:bg-purple-700">
                    {normalized.formato}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {normalized.duracao_estimada}
                  </Badge>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground break-words">
                  {normalized.titulo}
                </h1>
              </div>
            </div>
            <Button onClick={copyAll} size="sm" variant="secondary" className="shrink-0">
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
      
      {/* Proposta Estratégica */}
      {hasPropostaEstrategica && (
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-600" />
              Proposta Estratégica
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="grid gap-3">
              {normalized.proposta_estrategica.problema_real && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-sm mb-1 text-red-800 dark:text-red-200">❓ Problema que resolve</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">{normalized.proposta_estrategica.problema_real}</p>
                </div>
              )}
              {normalized.proposta_estrategica.solucao_proposta && (
                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-sm mb-1 text-green-800 dark:text-green-200">💡 Solução proposta</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">{normalized.proposta_estrategica.solucao_proposta}</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {normalized.proposta_estrategica.hook_psicologico && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-sm mb-1 text-purple-800 dark:text-purple-200">🧠 Gatilho psicológico</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">{normalized.proposta_estrategica.hook_psicologico}</p>
                </div>
              )}
              {normalized.proposta_estrategica.publico_alvo && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-sm mb-1 text-blue-800 dark:text-blue-200 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Público-alvo
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{normalized.proposta_estrategica.publico_alvo}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Roteiro Detalhado - DESTAQUE PRINCIPAL */}
      <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-md">
        <CardHeader className="bg-purple-50 dark:bg-purple-950/40 border-b border-purple-200 dark:border-purple-800">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-purple-900 dark:text-purple-100">
            <Clapperboard className="w-5 h-5" />
            Roteiro Detalhado
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          
          {/* Hook */}
          {hasHook && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/40 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h4 className="font-bold text-red-800 dark:text-red-200">
                  Hook (0-3s) — Pare o scroll!
                </h4>
              </div>
              <p className="text-base font-medium text-red-900 dark:text-red-100 whitespace-pre-line">
                {typeof normalized.roteiro.hook === 'string' 
                  ? normalized.roteiro.hook 
                  : normalized.roteiro.hook?.texto || ''}
              </p>
              {normalized.roteiro.hook?.visual && (
                <p className="text-sm text-red-700 dark:text-red-300 mt-2 flex items-center gap-1">
                  🎥 {normalized.roteiro.hook.visual}
                </p>
              )}
            </div>
          )}
          
          {/* Cenas do Desenvolvimento */}
          {hasCenas && (
            <div className="space-y-3">
              {normalized.roteiro.desenvolvimento.map((cena: any, i: number) => (
                <div key={i} className="p-4 bg-card rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2 text-foreground">
                      <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {cena.cena || i + 1}
                      </span>
                      Cena {cena.cena || i + 1}
                    </h4>
                    <Badge variant="secondary">
                      {cena.duracao || '?s'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 pl-9">
                    {(cena.texto_fala || cena.texto || cena.audio) && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">📝 Fala:</span>
                        <p className="text-sm text-foreground mt-1 whitespace-pre-line">{cena.texto_fala || cena.texto || cena.audio}</p>
                      </div>
                    )}
                    {cena.visual && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">🎥 Visual:</span>
                        <p className="text-sm text-muted-foreground mt-1">{cena.visual}</p>
                      </div>
                    )}
                    {cena.texto_tela && (
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">📺 Texto na tela:</span>
                        <p className="text-sm font-bold text-foreground">{cena.texto_tela}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* CTA */}
          {(normalized.roteiro.cta?.texto || typeof normalized.roteiro.cta === 'string') && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Megaphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="font-bold text-green-800 dark:text-green-200">
                  Call to Action (CTA)
                </h4>
              </div>
              <p className="text-base font-medium text-green-900 dark:text-green-100 whitespace-pre-line">
                {typeof normalized.roteiro.cta === 'string'
                  ? normalized.roteiro.cta
                  : normalized.roteiro.cta?.texto || ''}
              </p>
              {normalized.roteiro.cta?.visual && (
                <p className="text-sm text-green-700 dark:text-green-300 mt-2 flex items-center gap-1">
                  🎥 {normalized.roteiro.cta.visual}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Como Implementar */}
      {(normalized.implementacao.equipe_solo || normalized.implementacao.equipe_pequena || normalized.implementacao.equipe_estruturada) && (
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Como Implementar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {normalized.implementacao.equipe_solo && (
              <div className="p-3 rounded-lg border bg-card">
                <h4 className="font-semibold text-sm mb-1 text-foreground">👤 Sozinho (celular)</h4>
                <p className="text-sm text-muted-foreground">{normalized.implementacao.equipe_solo}</p>
              </div>
            )}
            {normalized.implementacao.equipe_pequena && (
              <div className="p-3 rounded-lg border bg-card">
                <h4 className="font-semibold text-sm mb-1 text-foreground">👥 Equipe pequena (2-5 pessoas)</h4>
                <p className="text-sm text-muted-foreground">{normalized.implementacao.equipe_pequena}</p>
              </div>
            )}
            {normalized.implementacao.equipe_estruturada && (
              <div className="p-3 rounded-lg border bg-card">
                <h4 className="font-semibold text-sm mb-1 text-foreground">🎬 Equipe profissional</h4>
                <p className="text-sm text-muted-foreground">{normalized.implementacao.equipe_estruturada}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Passo a Passo */}
      {normalized.passos_praticos.length > 0 && (
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Passo a Passo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ol className="space-y-2">
              {normalized.passos_praticos.map((passo, i) => (
                <li key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-foreground">{passo}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
      
      {/* Métricas de Impacto */}
      {(normalized.metricas_de_fruto.indicadores.length > 0 || normalized.metricas_de_fruto.meta_sugerida) && (
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Como Medir o Impacto
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {normalized.metricas_de_fruto.indicadores.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 text-foreground">📊 Indicadores para acompanhar:</h4>
                <div className="flex flex-wrap gap-2">
                  {normalized.metricas_de_fruto.indicadores.map((indicador, i) => (
                    <Badge key={i} variant="secondary">{indicador}</Badge>
                  ))}
                </div>
              </div>
            )}
            {normalized.metricas_de_fruto.meta_sugerida && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <h4 className="font-semibold text-sm mb-1 text-indigo-800 dark:text-indigo-200">🎯 Meta sugerida:</h4>
                <p className="text-sm text-indigo-700 dark:text-indigo-300">{normalized.metricas_de_fruto.meta_sugerida}</p>
              </div>
            )}
            {normalized.metricas_de_fruto.como_medir && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-1 text-foreground">📱 Onde acompanhar:</h4>
                <p className="text-sm text-muted-foreground">{normalized.metricas_de_fruto.como_medir}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Filtro Ético e Teológico */}
      {(normalized.filtro_etico_teologico.consideracoes || normalized.filtro_etico_teologico.cuidados.length > 0) && (
        <Card>
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className={`w-5 h-5 ${normalized.filtro_etico_teologico.aprovado ? 'text-green-600' : 'text-yellow-600'}`} />
                Filtro Ético e Teológico
              </CardTitle>
              {normalized.filtro_etico_teologico.aprovado && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  ✅ Aprovado
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {normalized.filtro_etico_teologico.consideracoes && (
              <p className="text-sm text-muted-foreground">{normalized.filtro_etico_teologico.consideracoes}</p>
            )}
            {normalized.filtro_etico_teologico.cuidados.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 text-foreground">⚠️ Cuidados importantes:</h4>
                <ul className="space-y-1">
                  {normalized.filtro_etico_teologico.cuidados.map((cuidado, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      {cuidado}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Dicas de Produção */}
      {(normalized.dicas_producao.iluminacao || normalized.dicas_producao.audio || normalized.dicas_producao.edicao) && (
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Dicas de Produção
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {normalized.dicas_producao.iluminacao && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1 text-foreground">💡 Iluminação</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{normalized.dicas_producao.iluminacao}</p>
                </div>
              )}
              {normalized.dicas_producao.audio && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1 text-foreground">🎙️ Áudio</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{normalized.dicas_producao.audio}</p>
                </div>
              )}
              {normalized.dicas_producao.edicao && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1 text-foreground">✂️ Edição</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{normalized.dicas_producao.edicao}</p>
                </div>
              )}
              {normalized.dicas_producao.musica_sugerida && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1 text-foreground">🎵 Música sugerida</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{normalized.dicas_producao.musica_sugerida}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Hashtags e Melhor Horário */}
      {(normalized.dicas_producao.hashtags.length > 0 || normalized.dicas_producao.melhor_horario) && (
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base">Publicação</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {normalized.dicas_producao.melhor_horario && (
              <p className="text-sm text-muted-foreground">
                🕐 <span className="font-medium text-foreground">Melhor horário:</span> {normalized.dicas_producao.melhor_horario}
              </p>
            )}
            {normalized.dicas_producao.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {normalized.dicas_producao.hashtags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {tag.startsWith('#') ? tag : `#${tag}`}
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
