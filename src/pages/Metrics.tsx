import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Package, TrendingUp, MessageSquare, Zap, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, description, icon }: MetricCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

const Metrics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    packsGenerated7d: 0,
    conversionRate: 0,
    tourCompletionRate: 0,
    feedbackCount7d: 0,
    totalPacks: 0
  });

  useEffect(() => {
    const checkAdminAndLoadMetrics = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        // Check if user is admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (!roleData || roleData.role !== 'admin') {
          toast.error("Acesso negado. Apenas administradores podem ver métricas.");
          navigate('/dashboard');
          return;
        }

        // Calculate date for 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoISO = sevenDaysAgo.toISOString();

        // Fetch metrics
        const [
          { count: totalUsers },
          { count: packsGenerated7d },
          { count: totalPacks },
          { count: signups },
          { count: firstPacks },
          { count: tourCompleted },
          { count: tourTotal },
          { count: feedbackCount7d }
        ] = await Promise.all([
          // Total users
          supabase.from('user_roles').select('*', { count: 'exact', head: true }),
          
          // Packs generated last 7 days
          supabase
            .from('user_analytics')
            .select('*', { count: 'exact', head: true })
            .eq('event_type', 'pack_generated')
            .gte('created_at', sevenDaysAgoISO),
          
          // Total packs ever
          supabase
            .from('user_analytics')
            .select('*', { count: 'exact', head: true })
            .eq('event_type', 'pack_generated'),
          
          // Signups (for conversion rate)
          supabase
            .from('user_analytics')
            .select('*', { count: 'exact', head: true })
            .eq('event_type', 'signup_completed'),
          
          // First packs (for conversion rate)
          supabase
            .from('user_analytics')
            .select('user_id', { count: 'exact', head: true })
            .eq('event_type', 'pack_generated'),
          
          // Tour completed
          supabase
            .from('user_analytics')
            .select('*', { count: 'exact', head: true })
            .eq('event_type', 'tour_completed'),
          
          // Tour total (completed + skipped)
          supabase
            .from('user_analytics')
            .select('*', { count: 'exact', head: true })
            .in('event_type', ['tour_completed', 'tour_skipped']),
          
          // Feedback last 7 days
          supabase
            .from('user_feedback')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', sevenDaysAgoISO)
        ]);

        const conversionRate = signups && firstPacks 
          ? Math.round((firstPacks / signups) * 100) 
          : 0;

        const tourCompletionRate = tourTotal && tourCompleted
          ? Math.round((tourCompleted / tourTotal) * 100)
          : 0;

        setMetrics({
          totalUsers: totalUsers || 0,
          packsGenerated7d: packsGenerated7d || 0,
          conversionRate,
          tourCompletionRate,
          feedbackCount7d: feedbackCount7d || 0,
          totalPacks: totalPacks || 0
        });
      } catch (error) {
        console.error('Error loading metrics:', error);
        toast.error("Erro ao carregar métricas");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndLoadMetrics();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Dashboard de Métricas</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe o desempenho e engajamento do Ide.On
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Total de Usuários"
            value={metrics.totalUsers}
            description="Usuários cadastrados na plataforma"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
          
          <MetricCard
            title="Packs Gerados (7 dias)"
            value={metrics.packsGenerated7d}
            description="Weekly packs criados na última semana"
            icon={<Package className="h-4 w-4 text-muted-foreground" />}
          />
          
          <MetricCard
            title="Taxa de Conversão"
            value={`${metrics.conversionRate}%`}
            description="Usuários que geraram pelo menos 1 pack"
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          />
          
          <MetricCard
            title="Conclusão do Tour"
            value={`${metrics.tourCompletionRate}%`}
            description="Usuários que completaram o onboarding"
            icon={<Award className="h-4 w-4 text-muted-foreground" />}
          />
          
          <MetricCard
            title="Feedbacks (7 dias)"
            value={metrics.feedbackCount7d}
            description="Feedbacks recebidos na última semana"
            icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
          />
          
          <MetricCard
            title="Total de Packs"
            value={metrics.totalPacks}
            description="Todos os packs gerados desde o início"
            icon={<Zap className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
            <CardDescription>
              Sugestões para melhorar as métricas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.conversionRate < 50 && (
              <p className="text-sm">
                📈 <strong>Taxa de conversão baixa:</strong> Considere melhorar o onboarding ou reduzir fricção no primeiro uso
              </p>
            )}
            {metrics.tourCompletionRate < 60 && (
              <p className="text-sm">
                🎯 <strong>Tour incompleto:</strong> Muitos usuários pulam o tour. Talvez torná-lo mais interativo?
              </p>
            )}
            {metrics.feedbackCount7d === 0 && (
              <p className="text-sm">
                💬 <strong>Sem feedbacks recentes:</strong> Incentive usuários a compartilhar opiniões
              </p>
            )}
            {metrics.conversionRate >= 50 && metrics.tourCompletionRate >= 60 && (
              <p className="text-sm text-primary">
                ✨ <strong>Ótimo trabalho!</strong> As métricas estão saudáveis. Continue monitorando!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Metrics;
