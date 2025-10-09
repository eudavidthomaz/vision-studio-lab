import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Sparkles, Calendar, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "./ui/badge";

interface RecentContent {
  id: string;
  type: "ai" | "pack";
  title: string;
  createdAt: string;
}

export const RecentContentSection = () => {
  const [recentContents, setRecentContents] = useState<RecentContent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecentContent();
  }, []);

  const loadRecentContent = async () => {
    try {
      // SECURITY: Validate user before any query
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user?.id) {
        throw new Error('Unauthorized');
      }

      const [aiContentResponse, weeklyPackResponse] = await Promise.all([
        supabase
          .from("content_planners")
          .select("id, content, created_at, user_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(2),
        supabase
          .from("weekly_packs")
          .select("id, pack, created_at, user_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1),
      ]);

      // SECURITY: Validate all data belongs to user
      if (aiContentResponse.data?.some(item => item.user_id !== user.id)) {
        throw new Error('Data integrity violation detected');
      }
      if (weeklyPackResponse.data?.some(item => item.user_id !== user.id)) {
        throw new Error('Data integrity violation detected');
      }

      const contents: RecentContent[] = [];

      if (aiContentResponse.data) {
        aiContentResponse.data.forEach((item) => {
          const plannerDataArray = item.content as any[];
          const plannerData = plannerDataArray?.[0];
          
          if (plannerData?.prompt_original) {
            contents.push({
              id: item.id,
              type: "ai",
              title: plannerData.prompt_original.substring(0, 50) + "...",
              createdAt: item.created_at,
            });
          }
        });
      }

      if (weeklyPackResponse.data?.[0]) {
        const pack = weeklyPackResponse.data[0];
        const packData = pack.pack as any;
        contents.push({
          id: pack.id,
          type: "pack",
          title: packData?.titulo_principal || "Pack Semanal",
          createdAt: pack.created_at,
        });
      }

      contents.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setRecentContents(contents.slice(0, 3));
    } catch (error) {
      console.error("Error loading recent content:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return "Recente";
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Meus Conteúdos Recentes</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/meus-conteudos")}
            className="text-xs group"
          >
            Ver Todos
            <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentContents.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhum conteúdo criado ainda
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/meus-conteudos")}
              className="mt-2"
            >
              Criar Primeiro Conteúdo
            </Button>
          </div>
        ) : (
          recentContents.map((content) => (
            <div
              key={content.id}
              onClick={() => navigate("/meus-conteudos")}
              className="group relative overflow-hidden rounded-lg border bg-gradient-to-br from-card to-card/50 hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative p-4 flex items-start gap-3">
                <div className={`flex-shrink-0 p-2 rounded-lg ${
                  content.type === "ai" 
                    ? "bg-primary/10" 
                    : "bg-accent/10"
                }`}>
                  {content.type === "ai" ? (
                    <Sparkles className="w-5 h-5 text-primary" />
                  ) : (
                    <Calendar className="w-5 h-5 text-accent" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                    >
                      {content.type === "ai" ? "IA Creator" : "Pack Semanal"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {getRelativeTime(content.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {content.title}
                  </p>
                </div>
                
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
