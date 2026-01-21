import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, User, Check, X, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { useScheduleConfirmation } from "@/hooks/useScheduleConfirmation";
import { VOLUNTEER_ROLES } from "@/hooks/useVolunteers";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ScheduleDetails {
  id: string;
  service_date: string;
  service_name: string;
  role: string;
  volunteer_name: string;
  start_time?: string;
  end_time?: string;
  status: string;
  already_responded: boolean;
}

export default function ConfirmSchedule() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { confirmSchedule, fetchScheduleByToken } = useScheduleConfirmation();
  
  const [schedule, setSchedule] = useState<ScheduleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedAction, setSubmittedAction] = useState<string | null>(null);

  useEffect(() => {
    const loadSchedule = async () => {
      if (!token) {
        setError("Token inválido");
        setLoading(false);
        return;
      }
      try {
        const data = await fetchScheduleByToken(token);
        setSchedule(data.schedule);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar escala");
      } finally {
        setLoading(false);
      }
    };
    loadSchedule();
  }, [token]);

  const getRoleLabel = (value: string) => VOLUNTEER_ROLES.find(r => r.value === value)?.label || value;

  const handleAction = async (action: 'confirm' | 'decline' | 'request_substitute') => {
    if (!token) return;
    try {
      await confirmSchedule.mutateAsync({ token, action, notes: notes || undefined });
      setSubmitted(true);
      setSubmittedAction(action);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar confirmação");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erro</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={() => navigate("/")}>Voltar ao início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    const actionMessages = {
      confirm: { title: "Presença Confirmada!", icon: <CheckCircle className="w-12 h-12 text-green-500" />, desc: "Obrigado por confirmar. Vemos você no culto!" },
      decline: { title: "Ausência Registrada", icon: <X className="w-12 h-12 text-destructive" />, desc: "Sua ausência foi registrada. O líder será notificado." },
      request_substitute: { title: "Substituto Solicitado", icon: <RefreshCw className="w-12 h-12 text-yellow-500" />, desc: "O líder buscará um substituto." },
    };
    const msg = actionMessages[submittedAction as keyof typeof actionMessages] || actionMessages.confirm;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            {msg.icon}
            <h2 className="text-xl font-semibold mt-4 mb-2">{msg.title}</h2>
            <p className="text-muted-foreground">{msg.desc}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (schedule?.already_responded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Check className="w-12 h-12 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Já Respondido</h2>
            <p className="text-muted-foreground">Você já respondeu a este pedido de confirmação.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Confirmar Presença</CardTitle>
          <CardDescription>Você foi escalado para um culto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{schedule?.volunteer_name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{schedule?.service_date && format(parseISO(schedule.service_date), "EEEE, dd 'de' MMMM", { locale: ptBR })}</span>
            </div>
            {schedule?.start_time && (
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{schedule.start_time}{schedule.end_time && ` - ${schedule.end_time}`}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{getRoleLabel(schedule?.role || "")}</Badge>
              <span className="text-sm text-muted-foreground">{schedule?.service_name}</span>
            </div>
          </div>

          <Textarea placeholder="Observações (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />

          <div className="grid gap-2">
            <Button className="w-full gap-2" onClick={() => handleAction('confirm')} disabled={confirmSchedule.isPending}>
              {confirmSchedule.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Confirmar Presença
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={() => handleAction('request_substitute')} disabled={confirmSchedule.isPending}>
              <RefreshCw className="w-4 h-4" />
              Solicitar Substituto
            </Button>
            <Button variant="ghost" className="w-full gap-2 text-destructive" onClick={() => handleAction('decline')} disabled={confirmSchedule.isPending}>
              <X className="w-4 h-4" />
              Não Poderei Ir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
