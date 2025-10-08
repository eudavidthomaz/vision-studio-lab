import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RecentContent {
  id: string;
  type: "ai" | "pack";
  title: string;
  createdAt: Date;
}

export function RecentContentSection() {
  const [recentContents, setRecentContents] = useState<RecentContent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecentContent();
  }, []);

  const loadRecentContent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const contents: RecentContent[] = [];

      // Buscar últimos 2 conteúdos de IA
      const { data: aiContent } = await supabase
        .from("content_planners")
        .select("id, content, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(2);

      aiContent?.forEach((item) => {
        const plannerDataArray = item.content as any[];
        const plannerData = plannerDataArray?.[0];
        if (plannerData?.prompt_original) {
          contents.push({
            id: `ai-${item.id}`,
            type: "ai",
            title: plannerData.prompt_original,
            createdAt: new Date(item.created_at),
          });
        }
      });

      // Buscar último pack semanal
      const { data: weekPacks } = await supabase
        .from("weekly_packs")
        .select("id, pack, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      weekPacks?.forEach((item) => {
        const packData = item.pack as any;
        if (packData?.titulo_principal) {
          contents.push({
            id: `pack-${item.id}`,
            type: "pack",
            title: packData.titulo_principal,
            createdAt: new Date(item.created_at),
          });
        }
      });

      contents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setRecentContents(contents.slice(0, 3));
    } catch (error) {
      console.error("Erro ao carregar conteúdos recentes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || recentContents.length === 0) return null;

  return (
    <Card className="w-full bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Meus Conteúdos</h3>
            {recentContents.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {recentContents.length}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/meus-conteudos")}
            className="gap-2"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {recentContents.map((content) => (
            <div
              key={content.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer"
              onClick={() => navigate("/meus-conteudos")}
            >
              {content.type === "ai" ? (
                <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
              ) : (
                <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{content.title}</p>
                <p className="text-xs text-muted-foreground">
                  {content.type === "ai" ? "IA Creator" : "Pack Semanal"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
