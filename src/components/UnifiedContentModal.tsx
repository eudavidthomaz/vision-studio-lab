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

  // Mobile usa Sheet dedicado (já responsivo)
  if (isMobile) {
    return <MobileContentSheet content={content} open={open} onClose={onClose} />;
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      carrossel: "🎠 Carrossel",
      reel: "🎬 Reels",
      stories: "📱 Stories",
      post: "📝 Post",
      foto_post: "📸 Foto Post",
      devocional: "📖 Devocional",
      estudo: "📚 Estudo Bíblico",
      esboco: "📋 Esboço",
      desafio_semanal: "💪 Desafio Semanal",
      roteiro_video: "🎥 Roteiro de Vídeo",
      convite: "🎉 Convite",
      aviso: "📢 Aviso",
      resumo: "📄 Resumo",
      resumo_breve: "📝 Resumo Breve",
      guia: "📖 Guia",
      calendario: "📅 Calendário",
      perguntas: "❓ Perguntas",
      treino_voluntario: "🎓 Treino",
      campanha_tematica: "📣 Campanha",
      manual_etica: "🛡️ Manual de Ética",
      estrategia_social: "📊 Estratégia Social",
      kit_basico: "📦 Kit Básico",
    };
    return labels[type] || type;
  };

  const getPilarColor = (pilar: string) => {
    const colors: Record<string, string> = {
      ALCANÇAR: "bg-blue-500",
      EDIFICAR: "bg-green-500",
      ENVIAR: "bg-purple-500",
      EXALTAR: "bg-yellow-500",
    };
    return colors[pilar] || "bg-gray-500";
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) onClose();
      }}
    >
      {/* Desktop modal: mobile-first, largura fluida e altura com svh/dvh, sem overflow lateral */}
      <DialogContent
        className="
          w-[min(92vw,42rem)] max-w-none p-0 overflow-hidden
          h-[min(92svh,92dvh)] rounded-xl md:rounded-2xl
        "
      >
        {/* Layout em coluna: header fixo + área scrollável */}
        <div className="flex h-full w-full min-w-0 flex-col overflow-x-clip">
          <DialogHeader className="px-4 py-3 border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 space-y-2">
            <h2 className="text-base font-semibold line-clamp-2 leading-tight">{content.title}</h2>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                {getContentTypeLabel(content.content_type)}
              </Badge>

              <Badge className={`${getPilarColor(content.pilar)} text-white text-xs`}>{content.pilar}</Badge>

              {content.source_type && (
                <Badge variant="secondary" className="text-xs">
                  {content.source_type === "ai-creator"
                    ? "🤖 IA"
                    : content.source_type === "audio-pack"
                      ? "🎙️ Pack Semanal"
                      : "✍️ Manual"}
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

          {/* Área scrollável: sem zoom, sem scroll horizontal, com safe-area no fundo */}
          <ScrollArea className="flex-1 min-w-0 touch-pan-y overscroll-contain scroll-smooth-ios">
            <div
              className="
                px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5
                w-full min-w-0 break-words overflow-x-hidden
                pb-[env(safe-area-inset-bottom)]
                text-sm sm:text-base
                [&_img]:max-w-full [&_img]:h-auto [&_img]:object-contain
                [&_video]:max-w-full [&_video]:h-auto [&_video]:object-contain
                [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:max-h-[60vh]
                [&_table]:w-full [&_table]:block [&_table]:overflow-x-auto [&_table]:text-xs [&_table]:sm:text-sm
                [&_pre]:text-xs [&_pre]:sm:text-sm [&_pre]:overflow-x-auto [&_pre]:max-w-full
                [&_code]:text-xs [&_code]:sm:text-sm [&_code]:break-all
                [&_h1]:text-xl [&_h1]:sm:text-2xl [&_h1]:md:text-3xl [&_h1]:font-bold [&_h1]:mb-4
                [&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:md:text-2xl [&_h2]:font-semibold [&_h2]:mb-3
                [&_h3]:text-base [&_h3]:sm:text-lg [&_h3]:md:text-xl [&_h3]:font-semibold [&_h3]:mb-2
                [&_p]:mb-3 [&_p]:leading-relaxed
                [&_ul]:mb-3 [&_ul]:pl-4 [&_ul]:sm:pl-6
                [&_ol]:mb-3 [&_ol]:pl-4 [&_ol]:sm:pl-6
                [&_li]:mb-2
              "
            >
              <ContentViewer content={content} />
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
