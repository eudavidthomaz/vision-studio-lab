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
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Roteiro de vídeo incompleto</p>
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
      
      {/* Header Principal */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Video className="w-6 h-6 text-purple-600 shrink-0 mt-1" />
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    {normalized.formato}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {normalized.duracao_estimada}
                  </Badge>
                </div>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl break-words">
                  {normalized.titulo}
                </CardTitle>
              </div>
            </div>
            <Button onClick={copyAll} size="sm" className="shrink-0">
              <Copy className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Copiar Tudo</span>
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
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="bg-amber-50 dark:bg-amber-950/20">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-600" />
              Proposta Estratégica
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {normalized.proposta_estrategica.problema_real && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-sm mb-1 text-red-700 dark:text-red-400">❓ Problema que resolve</h4>
                  <p className="text-sm text-muted-foreground">{normalized.proposta_estrategica.problema_real}</p>
                </div>
              )}
              {normalized.proposta_estrategica.solucao_proposta && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-sm mb-1 text-green-700 dark:text-green-400">💡 Solução proposta</h4>
                  <p className="text-sm text-muted-foreground">{normalized.proposta_estrategica.solucao_proposta}</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {normalized.proposta_estrategica.hook_psicologico && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-sm mb-1 text-purple-700 dark:text-purple-400">🧠 Gatilho psicológico</h4>
                  <p className="text-sm text-muted-foreground">{normalized.proposta_estrategica.hook_psicologico}</p>
                </div>
              )}
              {normalized.proposta_estrategica.publico_alvo && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-sm mb-1 text-blue-700 dark:text-blue-400">
                    <Users className="w-4 h-4 inline mr-1" />
                    Público-alvo
                  </h4>
                  <p className="text-sm text-muted-foreground">{normalized.proposta_estrategica.publico_alvo}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Roteiro Detalhado */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="bg-purple-50 dark:bg-purple-950/20">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-purple-600" />
            Roteiro Detalhado
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          
          {/* Hook */}
          {hasHook && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border-l-4 border-l-red-500">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-red-600" />
                <h4 className="font-semibold text-sm text-red-700 dark:text-red-400">
                  Hook (0-3s) — Pare o scroll!
                </h4>
              </div>
              <p className="text-sm font-medium whitespace-pre-line">
                {typeof normalized.roteiro.hook === 'string' 
                  ? normalized.roteiro.hook 
                  : normalized.roteiro.hook?.texto || ''}
              </p>
              {normalized.roteiro.hook?.visual && (
                <p className="text-xs text-muted-foreground mt-2">
                  🎥 Visual: {normalized.roteiro.hook.visual}
                </p>
              )}
            </div>
          )}
          
          {/* Cenas do Desenvolvimento */}
          {hasCenas && (
            <div className="space-y-3">
              {normalized.roteiro.desenvolvimento.map((cena: any, i: number) => (
                <div key={i} className="p-4 bg-muted/50 rounded-lg border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Play className="w-4 h-4 text-blue-600" />
                      Cena {cena.cena || i + 1}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {cena.duracao || '?s'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {(cena.texto_fala || cena.texto || cena.audio) && (
                      <div>
                        <span className="text-xs text-muted-foreground">📝 Fala:</span>
                        <p className="text-sm whitespace-pre-line">{cena.texto_fala || cena.texto || cena.audio}</p>
                      </div>
                    )}
                    {cena.visual && (
                      <div>
                        <span className="text-xs text-muted-foreground">🎥 Visual:</span>
                        <p className="text-sm text-muted-foreground">{cena.visual}</p>
                      </div>
                    )}
                    {cena.texto_tela && (
                      <div className="p-2 bg-primary/10 rounded text-center">
                        <span className="text-xs text-muted-foreground block">📺 Texto na tela:</span>
                        <p className="text-sm font-bold">{cena.texto_tela}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* CTA */}
          {(normalized.roteiro.cta?.texto || typeof normalized.roteiro.cta === 'string') && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-l-green-500">
              <div className="flex items-center gap-2 mb-2">
                <Megaphone className="w-4 h-4 text-green-600" />
                <h4 className="font-semibold text-sm text-green-700 dark:text-green-400">
                  Call to Action (CTA)
                </h4>
              </div>
              <p className="text-sm font-medium whitespace-pre-line">
                {typeof normalized.roteiro.cta === 'string'
                  ? normalized.roteiro.cta
                  : normalized.roteiro.cta?.texto || ''}
              </p>
              {normalized.roteiro.cta?.visual && (
                <p className="text-xs text-muted-foreground mt-2">
                  🎥 Visual: {normalized.roteiro.cta.visual}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Como Implementar */}
      {(normalized.implementacao.equipe_solo || normalized.implementacao.equipe_pequena || normalized.implementacao.equipe_estruturada) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Como Implementar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {normalized.implementacao.equipe_solo && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-sm mb-1">👤 Sozinho (celular)</h4>
                <p className="text-sm text-muted-foreground">{normalized.implementacao.equipe_solo}</p>
              </div>
            )}
            {normalized.implementacao.equipe_pequena && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-sm mb-1">👥 Equipe pequena (2-5 pessoas)</h4>
                <p className="text-sm text-muted-foreground">{normalized.implementacao.equipe_pequena}</p>
              </div>
            )}
            {normalized.implementacao.equipe_estruturada && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-sm mb-1">🎬 Equipe profissional</h4>
                <p className="text-sm text-muted-foreground">{normalized.implementacao.equipe_estruturada}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Passo a Passo */}
      {normalized.passos_praticos.length > 0 && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="bg-green-50 dark:bg-green-950/20">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Passo a Passo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ol className="space-y-2">
              {normalized.passos_praticos.map((passo, i) => (
                <li key={i} className="flex items-start gap-3 p-2 bg-muted/30 rounded">
                  <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm">{passo}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
      
      {/* Métricas de Impacto */}
      {(normalized.metricas_de_fruto.indicadores.length > 0 || normalized.metricas_de_fruto.meta_sugerida) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Como Medir o Impacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {normalized.metricas_de_fruto.indicadores.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">📊 Indicadores para acompanhar:</h4>
                <div className="flex flex-wrap gap-2">
                  {normalized.metricas_de_fruto.indicadores.map((indicador, i) => (
                    <Badge key={i} variant="secondary">{indicador}</Badge>
                  ))}
                </div>
              </div>
            )}
            {normalized.metricas_de_fruto.meta_sugerida && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">🎯 Meta sugerida:</h4>
                <p className="text-sm text-muted-foreground">{normalized.metricas_de_fruto.meta_sugerida}</p>
              </div>
            )}
            {normalized.metricas_de_fruto.como_medir && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">📱 Onde acompanhar:</h4>
                <p className="text-sm text-muted-foreground">{normalized.metricas_de_fruto.como_medir}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Filtro Ético e Teológico */}
      {(normalized.filtro_etico_teologico.consideracoes || normalized.filtro_etico_teologico.cuidados.length > 0) && (
        <Card className={`border-l-4 ${normalized.filtro_etico_teologico.aprovado ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
          <CardHeader className={normalized.filtro_etico_teologico.aprovado ? 'bg-green-50 dark:bg-green-950/20' : 'bg-yellow-50 dark:bg-yellow-950/20'}>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Shield className={`w-5 h-5 ${normalized.filtro_etico_teologico.aprovado ? 'text-green-600' : 'text-yellow-600'}`} />
              Filtro Ético e Teológico
              {normalized.filtro_etico_teologico.aprovado && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  ✅ Aprovado
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {normalized.filtro_etico_teologico.consideracoes && (
              <p className="text-sm text-muted-foreground">{normalized.filtro_etico_teologico.consideracoes}</p>
            )}
            {normalized.filtro_etico_teologico.cuidados.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">⚠️ Cuidados importantes:</h4>
                <ul className="space-y-1">
                  {normalized.filtro_etico_teologico.cuidados.map((cuidado, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-yellow-600">•</span>
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
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Dicas de Produção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {normalized.dicas_producao.iluminacao && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">💡 Iluminação</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{normalized.dicas_producao.iluminacao}</p>
                </div>
              )}
              {normalized.dicas_producao.audio && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">🎙️ Áudio</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{normalized.dicas_producao.audio}</p>
                </div>
              )}
            </div>
            
            {normalized.dicas_producao.edicao && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">✂️ Edição</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">{normalized.dicas_producao.edicao}</p>
              </div>
            )}
            
            {normalized.dicas_producao.musica_sugerida && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">🎵 Música sugerida</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">{normalized.dicas_producao.musica_sugerida}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Hashtags e Melhor Horário */}
      {(normalized.dicas_producao.hashtags.length > 0 || normalized.dicas_producao.melhor_horario) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Publicação</CardTitle>
            {normalized.dicas_producao.melhor_horario && (
              <p className="text-sm text-muted-foreground">
                🕐 Melhor horário: {normalized.dicas_producao.melhor_horario}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {normalized.dicas_producao.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {normalized.dicas_producao.hashtags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
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
