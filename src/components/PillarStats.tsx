import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, AlertCircle } from "lucide-react";

interface ContentItem {
  id: string;
  titulo: string;
  pilar: string;
  tipo: string;
}

interface PillarStatsProps {
  contentByDay: Record<string, ContentItem[]>;
}

const pillarColors: Record<string, string> = {
  "Edificar": "#3b82f6",
  "Alcançar": "#10b981",
  "Pertencer": "#f59e0b",
  "Servir": "#ef4444",
  "Convite": "#8b5cf6",
  "Comunidade": "#ec4899",
  "Cobertura": "#06b6d4",
};

export default function PillarStats({ contentByDay }: PillarStatsProps) {
  const stats = useMemo(() => {
    const allContent = Object.values(contentByDay).flat();
    const totalPosts = allContent.length;

    // Count by pillar
    const pillarCount = allContent.reduce((acc, content) => {
      acc[content.pilar] = (acc[content.pilar] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate percentages and prepare chart data
    const chartData = Object.entries(pillarCount).map(([pilar, count]) => ({
      name: pilar,
      count,
      percentage: totalPosts > 0 ? Math.round((count / totalPosts) * 100) : 0,
      fill: pillarColors[pilar] || "#gray",
    }));

    // Sort by count descending
    chartData.sort((a, b) => b.count - a.count);

    // Find imbalances (less than 10% of total)
    const imbalanced = chartData.filter(d => d.percentage < 10 && totalPosts >= 7);

    // Calculate balance score (0-100)
    const idealPercentage = 100 / 7; // ~14.3%
    const variance = chartData.reduce((acc, d) => {
      return acc + Math.abs(d.percentage - idealPercentage);
    }, 0);
    const balanceScore = Math.max(0, 100 - variance);

    return {
      totalPosts,
      pillarCount,
      chartData,
      imbalanced,
      balanceScore: Math.round(balanceScore),
    };
  }, [contentByDay]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Distribuição por Pilar
          </CardTitle>
          <CardDescription>
            Visualize o equilíbrio entre os 7 pilares de conteúdo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Balance Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Score de Balanceamento</span>
              <Badge variant={stats.balanceScore >= 70 ? "default" : "secondary"}>
                {stats.balanceScore}%
              </Badge>
            </div>
            <Progress value={stats.balanceScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {stats.balanceScore >= 70 
                ? "Ótimo! Seu conteúdo está bem distribuído." 
                : "Considere equilibrar melhor seus pilares."}
            </p>
          </div>

          {/* Pillar Breakdown */}
          <div className="space-y-3">
            {stats.chartData.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <Progress 
                  value={item.percentage} 
                  className="h-2"
                  style={{ 
                    // @ts-ignore
                    "--progress-background": item.fill 
                  }}
                />
              </div>
            ))}
          </div>

          {/* Warnings */}
          {stats.imbalanced.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Pilares com pouco conteúdo:</p>
                  <div className="flex flex-wrap gap-2">
                    {stats.imbalanced.map((item) => (
                      <Badge key={item.name} variant="outline" className="text-xs">
                        {item.name} ({item.percentage}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Card */}
      <Card>
        <CardHeader>
          <CardTitle>Visualizações</CardTitle>
          <CardDescription>Gráficos de distribuição de conteúdo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {stats.totalPosts > 0 ? (
            <>
              {/* Bar Chart */}
              <div>
                <p className="text-sm font-medium mb-3">Quantidade por Pilar</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.chartData}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div>
                <p className="text-sm font-medium mb-3">Proporção Percentual</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.chartData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.percentage}%`}
                    >
                      {stats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Adicione conteúdo ao planner para ver as estatísticas</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
