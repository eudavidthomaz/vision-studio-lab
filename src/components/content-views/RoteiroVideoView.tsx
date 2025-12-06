import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Clock, Hash, Target, Copy, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { normalizeRoteiroVideoData, safeString, safeStringArray } from "@/lib/normalizeContentData";

interface RoteiroVideoViewProps {
  conteudo_criativo?: any;
  dica_producao?: any;
  roteiro?: any;
  data?: any;
  onRegenerate?: () => void;
}

export const RoteiroVideoView = ({ conteudo_criativo, dica_producao, roteiro, data, onRegenerate }: RoteiroVideoViewProps) => {
  // Normalizar dados de múltiplas fontes - buscar em várias estruturas possíveis
  const rawData = data?.roteiro_video || 
    data?.conteudo?.roteiro_video || 
    data?.roteiro || 
    roteiro || 
    data || 
    { conteudo_criativo, dica_producao };
  const normalized = normalizeRoteiroVideoData(rawData);
  
  const hasContent = normalized.cenas && normalized.cenas.length > 0;
  
  // Fallback para estrutura antiga
  const legacyRoteiro = conteudo_criativo?.roteiro;
  const legacyDuracao = conteudo_criativo?.duracao_estimada;
  const legacyCta = conteudo_criativo?.cta;
  const legacyFormato = dica_producao?.formato;
  const legacyHashtags = dica_producao?.hashtags || [];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const copyAll = () => {
    let fullText = `🎬 ${normalized.titulo}\n`;
    fullText += `⏱️ Duração: ${normalized.duracao_total}\n`;
    if (normalized.objetivo) fullText += `🎯 Objetivo: ${normalized.objetivo}\n`;
    fullText += '\n';
    
    if (normalized.cenas.length > 0) {
      fullText += `📋 ROTEIRO:\n\n`;
      normalized.cenas.forEach((cena) => {
        fullText += `--- Cena ${cena.numero} (${cena.duracao}) ---\n`;
        fullText += `📹 Visual: ${cena.descricao_visual}\n`;
        fullText += `🎙️ Áudio/Fala: ${cena.audio_fala}\n`;
        if (cena.texto_tela) fullText += `📝 Texto na tela: ${cena.texto_tela}\n`;
        fullText += '\n';
      });
    } else if (legacyRoteiro) {
      fullText += `📋 ROTEIRO:\n${legacyRoteiro}\n\n`;
    }
    
    if (normalized.equipamentos_sugeridos.length > 0) {
      fullText += `🎥 EQUIPAMENTOS:\n`;
      normalized.equipamentos_sugeridos.forEach(e => fullText += `• ${e}\n`);
      fullText += '\n';
    }
    
    if (normalized.dicas_gravacao.length > 0) {
      fullText += `💡 DICAS:\n`;
      normalized.dicas_gravacao.forEach(d => fullText += `• ${d}\n`);
    }
    
    copyToClipboard(fullText, "Roteiro completo");
  };

  // Se não tem conteúdo normalizado e nem legacy
  if (!hasContent && !legacyRoteiro) {
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              {normalized.titulo}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={copyAll}>
              <Copy className="w-4 h-4 mr-2" />
              Copiar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {hasContent ? (
            <div className="space-y-4">
              {normalized.cenas.map((cena) => (
                <Card key={cena.numero} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Cena {cena.numero}</Badge>
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="w-3 h-3" />
                        {cena.duracao}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">📹 Visual:</p>
                      <p className="text-sm text-muted-foreground">{cena.descricao_visual}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">🎙️ Áudio/Fala:</p>
                      <p className="text-sm text-muted-foreground">{cena.audio_fala}</p>
                    </div>
                    {cena.texto_tela && (
                      <div>
                        <p className="text-sm font-medium">📝 Texto na tela:</p>
                        <p className="text-sm text-muted-foreground">{cena.texto_tela}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="whitespace-pre-line text-muted-foreground">{legacyRoteiro}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-5 h-5" />
              Duração Estimada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-lg">{normalized.duracao_total || legacyDuracao}</p>
          </CardContent>
        </Card>

        {legacyFormato && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Video className="w-5 h-5" />
                Formato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-base px-4 py-1">
                {legacyFormato}
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>

      {(normalized.objetivo || legacyCta) && (
        <Card className="bg-orange-500/10 border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Target className="w-5 h-5" />
              {normalized.objetivo ? 'Objetivo' : 'Call to Action'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-muted-foreground">{normalized.objetivo || legacyCta}</p>
          </CardContent>
        </Card>
      )}

      {normalized.equipamentos_sugeridos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              🎥 Equipamentos Sugeridos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {safeStringArray(normalized.equipamentos_sugeridos).map((equip, i) => (
                <li key={i}>{safeString(equip)}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {normalized.dicas_gravacao.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              💡 Dicas de Gravação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {safeStringArray(normalized.dicas_gravacao).map((dica, i) => (
                <li key={i}>{safeString(dica)}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {legacyHashtags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Hashtags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {safeStringArray(legacyHashtags).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-blue-600 border-blue-300">
                  {safeString(tag)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};