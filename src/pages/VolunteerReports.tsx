import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Users, BarChart3, TrendingUp, Calendar, Download, RefreshCw } from "lucide-react";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useVolunteerReports, VolunteerStats, AttendanceTrend, RoleDistribution } from "@/hooks/useVolunteerReports";
import { AttendanceChart } from "@/components/reports/AttendanceChart";
import { RoleDistributionChart } from "@/components/reports/RoleDistributionChart";
import { VolunteerStatsCard } from "@/components/volunteers/VolunteerStatsCard";

export default function VolunteerReports() {
  const navigate = useNavigate();
  
  // Estado para filtros de data
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 3), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  
  // Estado para dados dos relatórios
  const [attendanceData, setAttendanceData] = useState<AttendanceTrend[]>([]);
  const [roleData, setRoleData] = useState<RoleDistribution[]>([]);
  const [summaryData, setSummaryData] = useState<{
    total_volunteers: number;
    total_schedules: number;
    attendance_rate: number;
    volunteers: VolunteerStats[];
  } | null>(null);
  
  // Hook de relatórios
  const { 
    volunteerStats, 
    getVolunteerSummary,
    getRoleDistribution,
    getAttendanceTrend,
    isLoading,
  } = useVolunteerReports();

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  // Carregar dados ao montar
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      // Carregar resumo de voluntários
      const summaryResult = await getVolunteerSummary(startDate, endDate);
      if (summaryResult?.type === 'volunteer_summary') {
        setSummaryData({
          total_volunteers: summaryResult.data.total_volunteers,
          total_schedules: summaryResult.data.total_services,
          attendance_rate: summaryResult.data.overall_attendance_rate,
          volunteers: summaryResult.data.volunteers,
        });
      }

      // Carregar distribuição por função
      const roleResult = await getRoleDistribution(startDate, endDate);
      if (roleResult?.type === 'role_distribution') {
        setRoleData(roleResult.data.distribution);
      }

      // Carregar tendência de presença
      const trendResult = await getAttendanceTrend(startDate, endDate);
      if (trendResult?.type === 'attendance_trend') {
        setAttendanceData(trendResult.data.trends);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const handleRefresh = () => {
    loadReports();
  };

  const handleExportPDF = () => {
    // TODO: Implementar exportação PDF
    console.log('Export PDF not yet implemented');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/voluntarios")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                Relatórios de Voluntários
              </h1>
              <p className="text-muted-foreground text-sm">
                Métricas de participação e engajamento
              </p>
            </div>
          </div>
        </div>

        {/* Filtros de Data */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-1">
                <Label htmlFor="start-date">Data Início</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="end-date">Data Fim</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button onClick={handleRefresh} disabled={isLoading} className="gap-2">
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button variant="outline" onClick={handleExportPDF} className="gap-2">
                <Download className="w-4 h-4" />
                Exportar PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPIs Cards */}
        {isLoading && !summaryData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Voluntários</span>
                </div>
                <div className="text-2xl font-bold">
                  {summaryData?.total_volunteers || volunteerStats.data?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Ativos no período</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Escalas</span>
                </div>
                <div className="text-2xl font-bold">
                  {summaryData?.total_schedules || 0}
                </div>
                <p className="text-xs text-muted-foreground">Total de serviços</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Presença</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {summaryData?.attendance_rate?.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">Taxa de presença</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Média/Voluntário</span>
                </div>
                <div className="text-2xl font-bold">
                  {summaryData && summaryData.total_volunteers > 0 
                    ? (summaryData.total_schedules / summaryData.total_volunteers).toFixed(1) 
                    : 0
                  }
                </div>
                <p className="text-xs text-muted-foreground">Escalas por pessoa</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {isLoading && attendanceData.length === 0 ? (
            <>
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
            </>
          ) : (
            <>
              <AttendanceChart data={attendanceData} />
              <RoleDistributionChart data={roleData} />
            </>
          )}
        </div>

        {/* Lista de Voluntários com Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Voluntário</CardTitle>
            <CardDescription>Métricas individuais de participação</CardDescription>
          </CardHeader>
          <CardContent>
            {volunteerStats.isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-40" />
                ))}
              </div>
            ) : volunteerStats.data && volunteerStats.data.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {volunteerStats.data.map((stats) => (
                  <VolunteerStatsCard key={stats.volunteer_id} stats={stats} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Sem dados disponíveis
                </h3>
                <p className="text-muted-foreground">
                  Nenhum voluntário com escalas no período selecionado.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
