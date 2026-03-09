import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ContentViewer } from "./ContentViewer";
import { ContentLibraryItem } from "@/hooks/useContentLibrary";
import { Badge } from "@/components/ui/badge";
import { Calendar, Tag, X } from "lucide-react";
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
        className="h-[88dvh] w-screen max-w-full p-0 rounded-t-2xl overflow-hidden shadow-2xl border-t border-border/50 pb-safe"
      >
        {/* Handle de arrastar */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Container com altura fixa e overflow controlado */}
        <div className="flex flex-col h-[calc(100%-1.75rem)] w-full">
          {/* Header fixo - não rola */}
          <SheetHeader className="relative flex-shrink-0 px-3 py-2.5 border-b border-border/50 bg-background/95 backdrop-blur-xl z-10 space-y-2">
            {/* Botão fechar explícito */}
            <button
              onClick={onClose}
              className="absolute right-3 top-2.5 z-20 flex items-center justify-center h-8 w-8 rounded-full bg-muted/80 hover:bg-muted transition-colors"
              aria-label="Fechar"
            >
              <X className="h-4 w-4 text-foreground" />
            </button>

            <SheetTitle className="text-sm font-semibold line-clamp-2 text-left pr-10 leading-tight">
              {content.title}
            </SheetTitle>
            
            <div className="flex gap-1 flex-wrap">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                {getContentTypeLabel(content.content_type)}
              </Badge>
              
              <Badge className={`${getPilarColor(content.pilar)} text-white text-[10px] px-1.5 py-0.5`}>
                {content.pilar}
              </Badge>

              {content.source_type && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                  {content.source_type === 'ai-creator' ? '🤖 IA' : 
                   content.source_type === 'audio-pack' ? '🎙️ Pack' : 
                   '✍️ Manual'}
                </Badge>
              )}
            </div>

            {/* Tags */}
            {content.tags && content.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <Tag className="h-2.5 w-2.5 text-muted-foreground" />
                {content.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0.5">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </SheetHeader>

          {/* Conteúdo scrollável - cresce para preencher espaço */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
            <div className="
              p-3 w-full min-w-0 
              text-xs leading-relaxed
              [&_*]:max-w-full
              [&_img]:w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-2
              [&_video]:w-full [&_video]:h-auto [&_video]:rounded-lg [&_video]:my-2
              [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:my-2
              [&_table]:w-full [&_table]:block [&_table]:overflow-x-auto [&_table]:text-[10px]
              [&_pre]:text-[10px] [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-2
              [&_code]:text-[10px] [&_code]:break-all
              [&_h1]:text-base [&_h1]:font-bold [&_h1]:mb-2.5
              [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mb-2
              [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:mb-1.5
              [&_p]:mb-2 [&_p]:leading-relaxed
              [&_ul]:mb-2 [&_ul]:pl-3
              [&_ol]:mb-2 [&_ol]:pl-3
              [&_li]:mb-1
            ">
              <ContentViewer content={content} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
