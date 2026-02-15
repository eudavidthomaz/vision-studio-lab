import { Youtube, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface YouTubeCreatorCardProps {
  onClick: () => void;
  isLocked?: boolean;
}

export const YouTubeCreatorCard = ({ onClick, isLocked }: YouTubeCreatorCardProps) => {
  return (
    <button
      onClick={onClick}
      className="group relative w-full text-left rounded-xl border border-border bg-card p-5 sm:p-6 transition-all hover:shadow-lg hover:border-red-500/40 hover:bg-red-500/5 focus:outline-none focus:ring-2 focus:ring-red-500/50"
    >
      {isLocked && (
        <Badge className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-semibold">
          PRO
        </Badge>
      )}
      <div className="flex items-start gap-4">
        <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-red-500/10 text-red-500 group-hover:bg-red-500/20 transition-colors">
          <Youtube className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-base sm:text-lg text-foreground flex items-center gap-2">
            Extrair do YouTube
            {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            Cole o link de um vídeo e nossa IA extrai transcrição, pontos-chave e versículos para criar conteúdo.
          </p>
        </div>
      </div>
    </button>
  );
};
