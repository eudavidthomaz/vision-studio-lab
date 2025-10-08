import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecentItem {
  id: string;
  type: 'pack' | 'challenge';
  title: string;
  preview: string;
  date: Date;
  count?: number;
}

export function RecentContentSection() {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentContent();
  }, []);

  const loadRecentContent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get recent weekly packs
      const { data: packs } = await supabase
        .from('weekly_packs')
        .select('id, created_at, pack')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2);

      // Get recent challenges
      const { data: challenges } = await supabase
        .from('ideon_challenges')
        .select('id, created_at, challenge')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2);

      const items: RecentItem[] = [];

      // Process packs
      if (packs) {
        packs.forEach(pack => {
          const packData = pack.pack as any;
          const firstDay = packData.Segunda || packData.Terça || packData.Quarta || {};
          items.push({
            id: pack.id,
            type: 'pack',
            title: 'Pack Semanal Completo',
            preview: firstDay.copy?.substring(0, 80) + '...' || 'Pack de conteúdo',
            date: new Date(pack.created_at),
            count: Object.keys(packData).length
          });
        });
      }

      // Process challenges
      if (challenges) {
        challenges.forEach(challenge => {
          const challengeData = challenge.challenge as any;
          items.push({
            id: challenge.id,
            type: 'challenge',
            title: challengeData.titulo || 'Desafio Ide.On',
            preview: challengeData.descricao?.substring(0, 80) + '...' || 'Desafio criado',
            date: new Date(challenge.created_at)
          });
        });
      }

      // Sort by date and take top 4
      items.sort((a, b) => b.date.getTime() - a.date.getTime());
      setRecentItems(items.slice(0, 4));
    } catch (error) {
      console.error('Error loading recent content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Últimos Conteúdos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (recentItems.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Últimos Conteúdos
        </h2>
        <Card className="p-8 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Você ainda não criou nenhum conteúdo. Use os cards acima para começar!
          </p>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Clock className="w-6 h-6" />
        Últimos Conteúdos
      </h2>
      <div className="flex flex-col md:grid gap-4 md:grid-cols-2 md:gap-4">
        {recentItems.map(item => (
          <Card 
            key={item.id} 
            className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              if (item.type === 'pack') {
                window.location.href = '/historico';
              }
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold">{item.title}</h3>
              <Badge variant={item.type === 'pack' ? 'default' : 'secondary'}>
                {item.type === 'pack' ? '📦 Pack' : '⚡ Desafio'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {item.preview}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {format(item.date, "dd 'de' MMMM", { locale: ptBR })}
              </span>
              {item.count && (
                <span>{item.count} dias de conteúdo</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
