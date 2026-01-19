import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Calendar, Clock, Users } from "lucide-react";
import { VOLUNTEER_ROLES, Volunteer } from "@/hooks/useVolunteers";
import { GenerateScheduleRequest } from "@/hooks/useVolunteerSchedules";
import { format } from "date-fns";

interface ScheduleGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volunteers: Volunteer[];
  onSubmit: (data: GenerateScheduleRequest) => Promise<void>;
  isLoading?: boolean;
}

export function ScheduleGeneratorModal({
  open,
  onOpenChange,
  volunteers,
  onSubmit,
  isLoading = false,
}: ScheduleGeneratorModalProps) {
  const [serviceDate, setServiceDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [serviceName, setServiceName] = useState("Culto");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);
  const [useAllVolunteers, setUseAllVolunteers] = useState(true);

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

    const request: GenerateScheduleRequest = {
      service_date: serviceDate,
      service_name: serviceName || "Culto",
      roles: selectedRoles,
      start_time: startTime || undefined,
      end_time: endTime || undefined,
    };

    if (!useAllVolunteers && selectedVolunteers.length > 0) {
      request.volunteer_ids = selectedVolunteers;
    }

    await onSubmit(request);
    
    // Reset form
    setSelectedRoles([]);
    setSelectedVolunteers([]);
    setUseAllVolunteers(true);
    onOpenChange(false);
  };

  const getRoleLabel = (value: string) => {
    return VOLUNTEER_ROLES.find(r => r.value === value)?.label || value;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Gerar Nova Escala
          </DialogTitle>
          <DialogDescription>
            Selecione a data, funções necessárias e os voluntários disponíveis para gerar a escala automaticamente.
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
                    {selectedRoles.length} função(ões) selecionada(s): {selectedRoles.map(getRoleLabel).join(", ")}
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
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || selectedRoles.length === 0 || !serviceDate}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Gerar Escala
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
