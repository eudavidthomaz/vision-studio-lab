import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentViewer } from "./ContentViewer";
import { ContentLibraryItem } from "@/hooks/useContentLibrary";
import { Badge } from "@/components/ui/badge";
import { Calendar, Tag } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MobileContentSheetProps {
  content: ContentLibraryItem | null;
  open: boolean;
  onClose: () => void;
}

export function MobileContentSheet({ content, open, onClose }: MobileContentSheetProps) {
  if (!content) return null;

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
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="h-[min(95svh,95dvh)] w-screen max-w-full p-0 rounded-t-2xl overflow-hidden pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex flex-col h-full w-full min-w-0 overflow-x-clip">
          {/* Header fixo */}
          <SheetHeader className="px-4 py-3 border-b sticky top-0 bg-background z-10 space-y-2">
            <SheetTitle className="text-base font-semibold line-clamp-2 text-left">
              {content.title}
            </SheetTitle>
            
            <div className="flex gap-1.5 flex-wrap">
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
            </div>

            {/* Tags */}
            {content.tags && content.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="h-3 w-3 text-muted-foreground" />
                {content.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </SheetHeader>

          {/* Conteúdo scrollável */}
          <ScrollArea className="flex-1 min-w-0">
            <div 
              className="
                p-4 w-full min-w-0 break-words overflow-x-hidden
                [&_img]:max-w-full [&_img]:h-auto
                [&_video]:max-w-full [&_video]:h-auto
                [&_iframe]:w-full [&_iframe]:aspect-video
                [&_table]:w-full [&_table]:block [&_table]:overflow-x-auto
              "
            >
              <ContentViewer content={content} />
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
