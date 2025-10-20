import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "./ui/badge";
import { useContentLibrary } from "@/hooks/useContentLibrary";
export const RecentContentSection = () => {
  const navigate = useNavigate();
  const {
    items,
    loading
  } = useContentLibrary();
  const recentContents = items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3);
  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR
      });
    } catch {
      return "Recente";
    }
  };
  if (loading) {
    return null;
  }
  const getContentTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'carrossel': '🎠',
      'reel': '🎬',
      'stories': '📱',
      'post': '📝',
      'devocional': '📖',
      'estudo': '📚',
      'esboco': '📋'
    };
    return icons[type] || '✨';
  };
  return <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="text-sm">Meus Conteúdos Recentes</span>
          <Button variant="ghost" size="sm" onClick={() => navigate("/biblioteca")} className="text-xs group">
            Ver Todos
            <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentContents.length === 0 ? <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhum conteúdo criado ainda
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate("/biblioteca")} className="mt-2">
              Criar Primeiro Conteúdo
            </Button>
          </div> : recentContents.map(content => <div key={content.id} onClick={() => navigate(`/biblioteca/${content.id}`)} className="group relative overflow-hidden rounded-lg border bg-gradient-to-br from-card to-card/50 hover:shadow-md transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative p-4 flex items-start gap-3">
                <div className="flex-shrink-0 text-2xl">
                  {getContentTypeIcon(content.content_type)}
                </div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {content.source_type === 'ai-creator' ? 'IA Creator' : content.source_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {getRelativeTime(content.created_at)}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {content.title}
                  </p>
                </div>
                
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </div>)}
      </CardContent>
    </Card>;
};