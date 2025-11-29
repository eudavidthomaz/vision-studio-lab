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
import { StructuredContentTabs } from "./StructuredContentTabs";

interface UnifiedContentModalProps {
  content: ContentLibraryItem | null;
  open: boolean;
  onClose: () => void;
}

export function UnifiedContentModal({ content, open, onClose }: UnifiedContentModalProps) {
  const isMobile = useIsMobile();
  
  if (!content) return null;

  const hasStructuredBlocks = Boolean(content.modalidades && Object.keys(content.modalidades || {}).length);

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
      <DialogContent className="w-[min(95vw,48rem)] max-w-none max-h-[92dvh] overflow-hidden p-0 rounded-xl shadow-2xl border-border/50">
        <DialogHeader className="px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-xl z-10 space-y-2">
          <h2 className="text-sm sm:text-base font-semibold line-clamp-2 leading-tight pr-8">{content.title}</h2>
            
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5">
              {getContentTypeLabel(content.content_type)}
            </Badge>
            
            <Badge className={`${getPilarColor(content.pilar)} text-white text-[10px] sm:text-xs px-1.5 py-0.5`}>
              {content.pilar}
            </Badge>

            {content.source_type && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0.5">
                {content.source_type === 'ai-creator' ? '🤖 IA' : 
                 content.source_type === 'audio-pack' ? '🎙️ Pack' : 
                 '✍️ Manual'}
              </Badge>
            )}

            <Badge variant="outline" className="flex items-center gap-1 text-[10px] sm:text-xs px-1.5 py-0.5">
              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">{formatDate(content.created_at)}</span>
              <span className="sm:hidden">{format(new Date(content.created_at), "dd/MM/yy", { locale: ptBR })}</span>
            </Badge>
          </div>

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground" />
              {content.tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {hasStructuredBlocks && (
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0.5">Estruturado multimodal</Badge>
          )}
        </DialogHeader>

        {/* Conteúdo scrollável */}
        <ScrollArea className="max-h-[calc(92dvh-110px)]">
          <div className="
            px-3 sm:px-4 md:px-5 lg:px-6 
            py-3 sm:py-4 md:py-5 
            w-full min-w-0 
            break-words overflow-x-hidden
            text-xs sm:text-sm md:text-base
            [&_img]:max-w-full [&_img]:h-auto [&_img]:object-contain [&_img]:rounded-lg
            [&_video]:max-w-full [&_video]:h-auto [&_video]:object-contain [&_video]:rounded-lg
            [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:max-h-[60vh] [&_iframe]:rounded-lg
            [&_table]:w-full [&_table]:block [&_table]:overflow-x-auto [&_table]:text-[10px] [&_table]:sm:text-xs [&_table]:md:text-sm
            [&_pre]:text-[10px] [&_pre]:sm:text-xs [&_pre]:md:text-sm [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_pre]:rounded-lg [&_pre]:p-3
            [&_code]:text-[10px] [&_code]:sm:text-xs [&_code]:md:text-sm [&_code]:break-all
            [&_h1]:text-base [&_h1]:sm:text-lg [&_h1]:md:text-xl [&_h1]:lg:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:sm:mb-4
            [&_h2]:text-sm [&_h2]:sm:text-base [&_h2]:md:text-lg [&_h2]:lg:text-xl [&_h2]:font-semibold [&_h2]:mb-2.5 [&_h2]:sm:mb-3
            [&_h3]:text-xs [&_h3]:sm:text-sm [&_h3]:md:text-base [&_h3]:lg:text-lg [&_h3]:font-semibold [&_h3]:mb-2
            [&_p]:mb-2.5 [&_p]:sm:mb-3 [&_p]:leading-relaxed
            [&_ul]:mb-2.5 [&_ul]:sm:mb-3 [&_ul]:pl-3 [&_ul]:sm:pl-4 [&_ul]:md:pl-5
            [&_ol]:mb-2.5 [&_ol]:sm:mb-3 [&_ol]:pl-3 [&_ol]:sm:pl-4 [&_ol]:md:pl-5
            [&_li]:mb-1.5 [&_li]:sm:mb-2
          ">
            {hasStructuredBlocks ? (
              <StructuredContentTabs modalidades={content.modalidades || {}} />
            ) : (
              <ContentViewer content={content} />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
