import { useIsMobile } from "@/hooks/use-mobile";
import { MobileContentSheet } from "./MobileContentSheet";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const isMobile = useIsMobile();
  
  if (!content) return null;

  // Mobile: usa Sheet
  if (isMobile) {
    return <MobileContentSheet content={content} open={open} onClose={onClose} />;
  }

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

  // Desktop: usa Dialog
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[min(92vw,42rem)] max-w-none max-h-[90dvh] overflow-hidden p-0">
        <DialogHeader className="px-4 py-3 border-b sticky top-0 bg-background z-10 space-y-2">
          <h2 className="text-base font-semibold line-clamp-2 leading-tight">{content.title}</h2>
            
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {getContentTypeLabel(content.content_type)}
            </Badge>
            
            <Badge className={`${getPilarColor(content.pilar)} text-white text-xs`}>
              {content.pilar}
            </Badge>

            {content.source_type && (
              <Badge variant="secondary" className="text-xs">
                {content.source_type === 'ai-creator' ? '🤖 IA' : 
                 content.source_type === 'audio-pack' ? '🎙️ Pack Semanal' : 
                 '✍️ Manual'}
              </Badge>
            )}

            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              {formatDate(content.created_at)}
            </Badge>
          </div>

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-3 w-3 text-muted-foreground" />
              {content.tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </DialogHeader>

        {/* Conteúdo scrollável */}
        <ScrollArea className="max-h-[calc(90dvh-120px)]">
          <div 
            className="
              px-4 py-4 w-full min-w-0 break-words overflow-x-hidden
              [&_img]:max-w-full [&_img]:h-auto
              [&_video]:max-w-full [&_video]:h-auto
              [&_iframe]:w-full [&_iframe]:aspect-video
              [&_table]:w-full [&_table]:block [&_table]:overflow-x-auto
            "
          >
            <ContentViewer content={content} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
