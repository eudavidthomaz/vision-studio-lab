import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { ContentViewer } from "./ContentViewer";
import { ContentLibraryItem } from "@/hooks/useContentLibrary";
import { Badge } from "@/components/ui/badge";
import { Calendar, Tag } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UnifiedContentModalProps {
  content: ContentLibraryItem | null;
  open: boolean;
  onClose: () => void;
}

export function UnifiedContentModal({ content, open, onClose }: UnifiedContentModalProps) {
  if (!content) return null;

  // FILTRAR CAMPOS TÉCNICOS (não mostrar para o usuário)
  const technicalFields = [
    'sermon_hash',
    'transcription_time_ms',
    'error_message',
    'search_vector',
    'audio_description', // ❌ NUNCA mostrar descrição de áudio
    'metadata',
    'raw_transcript'
  ];

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'carrossel': '🎠 Carrossel',
      'reel': '🎬 Reels',
      'stories': '📱 Stories',
      'post': '📝 Post',
      'foto_post': '📸 Foto Post',
      'devocional': '📖 Devocional',
      'estudo': '📚 Estudo Bíblico',
      'esboco': '📋 Esboço',
      'desafio_semanal': '💪 Desafio Semanal',
      'roteiro_video': '🎥 Roteiro de Vídeo',
      'convite': '🎉 Convite',
      'aviso': '📢 Aviso',
      'resumo': '📄 Resumo',
      'resumo_breve': '📝 Resumo Breve',
      'guia': '📖 Guia',
      'calendario': '📅 Calendário',
      'perguntas': '❓ Perguntas',
      'treino_voluntario': '🎓 Treino',
      'campanha_tematica': '📣 Campanha',
      'manual_etica': '🛡️ Manual de Ética',
      'estrategia_social': '📊 Estratégia Social',
      'kit_basico': '📦 Kit Básico',
    };
    return labels[type] || type;
  };

  const getPilarColor = (pilar: string) => {
    const colors: Record<string, string> = {
      'ALCANÇAR': 'bg-blue-500',
      'EDIFICAR': 'bg-green-500',
      'ENVIAR': 'bg-purple-500',
      'EXALTAR': 'bg-yellow-500'
    };
    return colors[pilar] || 'bg-gray-500';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          {/* Título e Badges */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">{content.title}</h2>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-sm">
                {getContentTypeLabel(content.content_type)}
              </Badge>
              
              <Badge className={`${getPilarColor(content.pilar)} text-white`}>
                {content.pilar}
              </Badge>

              {content.source_type && (
                <Badge variant="secondary">
                  {content.source_type === 'ai-creator' ? '🤖 IA' : 
                   content.source_type === 'audio-pack' ? '🎙️ Pack Semanal' : 
                   '✍️ Manual'}
                </Badge>
              )}

              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(content.created_at)}
              </Badge>
            </div>

            {/* Tags */}
            {content.tags && content.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {content.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Prompt Original (só se existir E não for muito longo) */}
            {content.prompt_original && content.prompt_original.length < 500 && (
              <details className="p-3 bg-muted/30 rounded-lg border">
                <summary className="text-xs text-muted-foreground cursor-pointer">
                  Ver prompt original
                </summary>
                <p className="text-sm mt-2">{content.prompt_original}</p>
              </details>
            )}
          </div>
        </DialogHeader>

        {/* Conteúdo dinâmico */}
        <div className="mt-6">
          <ContentViewer content={content} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
