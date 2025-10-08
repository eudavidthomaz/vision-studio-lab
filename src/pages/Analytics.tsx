import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Eye, ThumbsUp, Share2, Calendar } from 'lucide-react';

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['user-analytics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 animate-fade-in">
        <div className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  // Processar dados para gráficos
  const eventsByType = analytics?.reduce((acc: any, event: any) => {
    const type = event.event_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(eventsByType || {}).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
  }));

  // Eventos por dia
  const eventsByDay = analytics?.reduce((acc: any, event: any) => {
    const date = new Date(event.created_at).toLocaleDateString('pt-BR');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const timelineData = Object.entries(eventsByDay || {})
    .slice(-7)
    .map(([date, count]) => ({ date, count }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  const stats = [
    {
      label: 'Total de Eventos',
      value: analytics?.length || 0,
      icon: TrendingUp,
      color: 'text-blue-500',
    },
    {
      label: 'Packs Criados',
      value: analytics?.filter((e: any) => e.event_type === 'pack_created').length || 0,
      icon: Eye,
      color: 'text-purple-500',
    },
    {
      label: 'Desafios Criados',
      value: analytics?.filter((e: any) => e.event_type === 'challenge_created').length || 0,
      icon: ThumbsUp,
      color: 'text-yellow-500',
    },
    {
      label: 'Conteúdos Exportados',
      value: analytics?.filter((e: any) => e.event_type === 'content_exported').length || 0,
      icon: Share2,
      color: 'text-green-500',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Insights sobre seu uso da plataforma
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Atividade por Tipo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Últimos 7 Dias
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Distribuição de Eventos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
