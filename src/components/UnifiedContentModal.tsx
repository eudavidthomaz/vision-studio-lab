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
      'devocional': '📖 Devocional',
      'estudo': '📚 Estudo Bíblico',
      'esboco': '📋 Esboço',
      'desafio_semanal': '💪 Desafio Semanal',
      'roteiro_video': '🎥 Roteiro de Vídeo'
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

            {/* Prompt Original */}
            {content.prompt_original && (
              <div className="p-3 bg-muted/50 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">Prompt original:</p>
                <p className="text-sm italic">{content.prompt_original}</p>
              </div>
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
