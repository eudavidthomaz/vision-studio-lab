import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Calendar, Clock, Users, Sparkles, AlertCircle, Check, X, Info } from "lucide-react";
import { VOLUNTEER_ROLES, Volunteer } from "@/hooks/useVolunteers";
import { SmartScheduleRequest, SmartScheduleResponse, SmartScheduleConflict } from "@/hooks/useSmartSchedule";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SmartScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volunteers: Volunteer[];
  onSubmit: (data: SmartScheduleRequest) => Promise<SmartScheduleResponse>;
  isLoading?: boolean;
}

export function SmartScheduleModal({
  open,
  onOpenChange,
  volunteers,
  onSubmit,
  isLoading = false,
}: SmartScheduleModalProps) {
  const [serviceDate, setServiceDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [serviceName, setServiceName] = useState("Culto");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);
  const [useAllVolunteers, setUseAllVolunteers] = useState(true);
  
  // AI Options
  const [useAI, setUseAI] = useState(true);
  const [considerCalendar, setConsiderCalendar] = useState(true);
  const [avoidConsecutive, setAvoidConsecutive] = useState(true);
  const [balanceWorkload, setBalanceWorkload] = useState(true);
  const [respectPreferences, setRespectPreferences] = useState(true);

  // Result state
  const [result, setResult] = useState<SmartScheduleResponse | null>(null);
  const [showResult, setShowResult] = useState(false);

  const activeVolunteers = volunteers.filter(v => v.is_active);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  const handleVolunteerToggle = (id: string) => {
    setSelectedVolunteers((prev) =>
      prev.includes(id)
        ? prev.filter((v) => v !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceDate || selectedRoles.length === 0) return;

    const request: SmartScheduleRequest = {
      service_date: serviceDate,
      service_name: serviceName || "Culto",
      roles: selectedRoles,
      start_time: startTime || undefined,
      end_time: endTime || undefined,
      use_ai_optimization: useAI,
      consider_calendar_availability: considerCalendar,
      preferences: {
        avoid_consecutive_weeks: avoidConsecutive,
        balance_workload: balanceWorkload,
        respect_role_preferences: respectPreferences,
      },
    };

    if (!useAllVolunteers && selectedVolunteers.length > 0) {
      request.volunteer_ids = selectedVolunteers;
    }

    const response = await onSubmit(request);
    setResult(response);
    setShowResult(true);
  };

  const handleClose = () => {
    setResult(null);
    setShowResult(false);
    setSelectedRoles([]);
    setSelectedVolunteers([]);
    setUseAllVolunteers(true);
    onOpenChange(false);
  };

  const getRoleLabel = (value: string) => {
    return VOLUNTEER_ROLES.find(r => r.value === value)?.label || value;
  };

  const getConflictIcon = (type: SmartScheduleConflict['conflict_type']) => {
    switch (type) {
      case 'calendar':
        return <Calendar className="w-4 h-4 text-destructive" />;
      case 'consecutive':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'overloaded':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <X className="w-4 h-4 text-destructive" />;
    }
  };

  // Result View
  if (showResult && result) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {result.success ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              {result.success ? "Escala Gerada com Sucesso" : "Escala Gerada com Avisos"}
            </DialogTitle>
            <DialogDescription>
              {result.schedules_created} escala(s) criada(s) para {serviceName}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {/* AI Summary */}
              {result.ai_summary && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Resumo da IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{result.ai_summary}</p>
                  </CardContent>
                </Card>
              )}

              {/* Assignments */}
              {result.assignments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Escalas Criadas</h4>
                  {result.assignments.map((assignment, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="font-medium text-sm">{assignment.volunteer_name}</p>
                          <p className="text-xs text-muted-foreground">{getRoleLabel(assignment.role)}</p>
                        </div>
                      </div>
                      {assignment.reason && (
                        <Badge variant="outline" className="text-xs max-w-[200px] truncate">
                          {assignment.reason}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Conflicts */}
              {result.conflicts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-yellow-600">Conflitos Identificados</h4>
                  {result.conflicts.map((conflict, i) => (
                    <Alert key={i} variant="destructive" className="py-2">
                      <div className="flex items-center gap-2">
                        {getConflictIcon(conflict.conflict_type)}
                        <AlertDescription className="text-sm">
                          <span className="font-medium">{conflict.volunteer_name}:</span>{" "}
                          {conflict.reason}
                        </AlertDescription>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {result.warnings && result.warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-orange-600">Avisos</h4>
                  {result.warnings.map((warning, i) => (
                    <Alert key={i} className="py-2 border-orange-200 bg-orange-50">
                      <Info className="w-4 h-4 text-orange-500" />
                      <AlertDescription className="text-sm text-orange-700">
                        {warning}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {/* AI Reasoning */}
              {result.ai_reasoning && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Raciocínio da IA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {result.ai_reasoning}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button onClick={handleClose}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Form View
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Gerar Escala Inteligente
          </DialogTitle>
          <DialogDescription>
            Use inteligência artificial para gerar escalas otimizadas considerando disponibilidade e histórico.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Date and Service Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service_date">Data do Culto *</Label>
                  <Input
                    id="service_date"
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service_name">Nome do Evento</Label>
                  <Input
                    id="service_name"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="Ex: Culto Domingo Manhã"
                  />
                </div>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horário Início
                  </Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">Horário Fim</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              {/* AI Options */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Opções de IA
                  </CardTitle>
                  <CardDescription>
                    Configure como a IA deve otimizar a escala
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="use-ai" className="flex items-center gap-2 cursor-pointer">
                      <Sparkles className="w-4 h-4" />
                      Usar IA para otimizar
                    </Label>
                    <Switch
                      id="use-ai"
                      checked={useAI}
                      onCheckedChange={setUseAI}
                    />
                  </div>

                  {useAI && (
                    <div className="space-y-3 pl-6 border-l-2 border-primary/20">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="consider-calendar" className="text-sm cursor-pointer">
                          Considerar Google Calendar
                        </Label>
                        <Switch
                          id="consider-calendar"
                          checked={considerCalendar}
                          onCheckedChange={setConsiderCalendar}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="avoid-consecutive" className="text-sm cursor-pointer">
                          Evitar semanas consecutivas
                        </Label>
                        <Switch
                          id="avoid-consecutive"
                          checked={avoidConsecutive}
                          onCheckedChange={setAvoidConsecutive}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="balance-workload" className="text-sm cursor-pointer">
                          Balancear carga de trabalho
                        </Label>
                        <Switch
                          id="balance-workload"
                          checked={balanceWorkload}
                          onCheckedChange={setBalanceWorkload}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="respect-preferences" className="text-sm cursor-pointer">
                          Respeitar preferências de função
                        </Label>
                        <Switch
                          id="respect-preferences"
                          checked={respectPreferences}
                          onCheckedChange={setRespectPreferences}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Separator />

              {/* Roles Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Funções Necessárias *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {VOLUNTEER_ROLES.map((role) => (
                    <div
                      key={role.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`role-${role.value}`}
                        checked={selectedRoles.includes(role.value)}
                        onCheckedChange={() => handleRoleToggle(role.value)}
                      />
                      <label
                        htmlFor={`role-${role.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {role.label}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedRoles.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedRoles.length} função(ões) selecionada(s)
                  </p>
                )}
              </div>

              {/* Volunteers Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Voluntários Disponíveis
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="use-all"
                      checked={useAllVolunteers}
                      onCheckedChange={(checked) => {
                        setUseAllVolunteers(!!checked);
                        if (checked) setSelectedVolunteers([]);
                      }}
                    />
                    <label htmlFor="use-all" className="text-sm cursor-pointer">
                      Usar todos
                    </label>
                  </div>
                </div>

                {!useAllVolunteers && (
                  <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
                    {activeVolunteers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum voluntário ativo cadastrado.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeVolunteers.map((volunteer) => (
                          <div
                            key={volunteer.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`volunteer-${volunteer.id}`}
                              checked={selectedVolunteers.includes(volunteer.id)}
                              onCheckedChange={() => handleVolunteerToggle(volunteer.id)}
                            />
                            <label
                              htmlFor={`volunteer-${volunteer.id}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              <span className="font-medium">{volunteer.name}</span>
                              <span className="text-muted-foreground ml-1">
                                ({getRoleLabel(volunteer.role)})
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  {useAllVolunteers
                    ? `${activeVolunteers.length} voluntário(s) disponível(eis)`
                    : `${selectedVolunteers.length} voluntário(s) selecionado(s)`}
                </p>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || selectedRoles.length === 0 || !serviceDate}
              className="gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <Sparkles className="w-4 h-4" />
              Gerar com IA
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
