import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Shield, AlertTriangle, Activity, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SecurityLog {
  id: string;
  user_id: string;
  event_type: string;
  endpoint: string;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

interface RateLimit {
  endpoint: string;
  request_count: number;
  window_start: string;
}

export default function SecurityDashboard() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user is admin
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roles) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página.",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await loadData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      // Load security logs
      const { data: logsData, error: logsError } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;
      setLogs(logsData || []);

      // Load rate limits
      const { data: limitsData, error: limitsError } = await supabase
        .from('rate_limits')
        .select('endpoint, request_count, window_start')
        .order('created_at', { ascending: false })
        .limit(50);

      if (limitsError) throw limitsError;
      
      // Group by endpoint
      const limitsByEndpoint = new Map<string, RateLimit>();
      limitsData?.forEach(item => {
        if (!limitsByEndpoint.has(item.endpoint)) {
          limitsByEndpoint.set(item.endpoint, item);
        }
      });
      
      setRateLimits(Array.from(limitsByEndpoint.values()));
    } catch (error) {
      console.error('Error loading security data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de segurança.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getEventBadge = (eventType: string, success: boolean) => {
    if (!success) {
      return <Badge variant="destructive">{eventType}</Badge>;
    }
    
    if (eventType.includes('success')) {
      return <Badge variant="default">{eventType}</Badge>;
    }
    
    return <Badge variant="secondary">{eventType}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 animate-pulse mx-auto mb-4" />
          <p>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const failedLogs = logs.filter(log => !log.success);
  const successRate = logs.length > 0 
    ? ((logs.filter(log => log.success).length / logs.length) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Painel de Segurança
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Eventos
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logs.length}</div>
              <p className="text-xs text-muted-foreground">
                Últimas 100 operações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Sucesso
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate}%</div>
              <p className="text-xs text-muted-foreground">
                {logs.filter(log => log.success).length} sucessos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Falhas Recentes
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{failedLogs.length}</div>
              <p className="text-xs text-muted-foreground">
                Requerem atenção
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts for recent failures */}
        {failedLogs.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Há {failedLogs.length} evento(s) com falha nas últimas operações. Revise os logs abaixo.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs defaultValue="logs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="logs">Logs de Auditoria</TabsTrigger>
            <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Logs de Segurança</CardTitle>
                <CardDescription>
                  Últimos 100 eventos de segurança registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Evento</TableHead>
                        <TableHead>Endpoint</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Erro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs">
                            {formatDate(log.created_at)}
                          </TableCell>
                          <TableCell>
                            {getEventBadge(log.event_type, log.success)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.endpoint}
                          </TableCell>
                          <TableCell>
                            {log.success ? (
                              <Badge variant="outline" className="bg-green-500/10">
                                Sucesso
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-500/10">
                                Falha
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                            {log.error_message || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rate-limits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rate Limits Atuais</CardTitle>
                <CardDescription>
                  Uso de API por endpoint na janela atual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Endpoint</TableHead>
                        <TableHead>Requisições</TableHead>
                        <TableHead>Janela Iniciada</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rateLimits.map((limit, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-xs">
                            {limit.endpoint}
                          </TableCell>
                          <TableCell>
                            <Badge variant={limit.request_count > 40 ? "destructive" : "default"}>
                              {limit.request_count} req
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {formatDate(limit.window_start)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Refresh Button */}
        <div className="flex justify-center">
          <Button onClick={loadData} variant="outline">
            Atualizar Dados
          </Button>
        </div>
      </div>
    </div>
  );
}
