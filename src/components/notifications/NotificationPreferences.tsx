import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Bell, Mail, Smartphone, Calendar, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { useNotifications, NotificationPreferences as NotificationPrefs } from "@/hooks/useNotifications";

interface NotificationPreferencesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PreferenceGroup {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  emailKey: keyof NotificationPrefs;
  appKey: keyof NotificationPrefs;
}

const preferenceGroups: PreferenceGroup[] = [
  {
    key: 'schedule_created',
    title: 'Nova Escala',
    description: 'Quando você for escalado para um culto',
    icon: <Calendar className="w-4 h-4" />,
    emailKey: 'schedule_created_email',
    appKey: 'schedule_created_app',
  },
  {
    key: 'reminder_24h',
    title: 'Lembrete 24h',
    description: 'Um dia antes do culto',
    icon: <Clock className="w-4 h-4" />,
    emailKey: 'reminder_24h_email',
    appKey: 'reminder_24h_app',
  },
  {
    key: 'reminder_2h',
    title: 'Lembrete 2h',
    description: 'Duas horas antes do culto',
    icon: <AlertCircle className="w-4 h-4" />,
    emailKey: 'reminder_2h_email',
    appKey: 'reminder_2h_app',
  },
  {
    key: 'confirmation_request',
    title: 'Pedido de Confirmação',
    description: 'Quando precisar confirmar presença',
    icon: <CheckCircle className="w-4 h-4" />,
    emailKey: 'confirmation_request_email',
    appKey: 'confirmation_request_app',
  },
  {
    key: 'schedule_changed',
    title: 'Alteração na Escala',
    description: 'Quando houver mudança na sua escala',
    icon: <AlertCircle className="w-4 h-4" />,
    emailKey: 'schedule_changed_email',
    appKey: 'schedule_changed_app',
  },
];

export function NotificationPreferencesModal({ open, onOpenChange }: NotificationPreferencesProps) {
  const { preferences, updatePreferences } = useNotifications();
  const [localPrefs, setLocalPrefs] = useState<Partial<NotificationPrefs>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (preferences.data) {
      setLocalPrefs(preferences.data);
      setHasChanges(false);
    }
  }, [preferences.data]);

  const handleToggle = (key: keyof NotificationPrefs, value: boolean) => {
    setLocalPrefs(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await updatePreferences.mutateAsync(localPrefs);
    setHasChanges(false);
    onOpenChange(false);
  };

  const handleEnableAll = () => {
    const allEnabled: Record<string, boolean> = {};
    preferenceGroups.forEach(group => {
      allEnabled[group.emailKey as string] = true;
      allEnabled[group.appKey as string] = true;
    });
    setLocalPrefs(prev => ({ ...prev, ...allEnabled }));
    setHasChanges(true);
  };

  const handleDisableAll = () => {
    const allDisabled: Record<string, boolean> = {};
    preferenceGroups.forEach(group => {
      allDisabled[group.emailKey as string] = false;
      allDisabled[group.appKey as string] = false;
    });
    setLocalPrefs(prev => ({ ...prev, ...allDisabled }));
    setHasChanges(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Preferências de Notificação
          </DialogTitle>
          <DialogDescription>
            Configure como você deseja receber notificações sobre suas escalas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEnableAll}>
              Habilitar todas
            </Button>
            <Button variant="outline" size="sm" onClick={handleDisableAll}>
              Desabilitar todas
            </Button>
          </div>

          {/* Channel Legend */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>E-mail</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span>App</span>
            </div>
          </div>

          <Separator />

          {/* Preference Groups */}
          <div className="space-y-4">
            {preferenceGroups.map((group) => (
              <Card key={group.key}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    {group.icon}
                    <CardTitle className="text-base">{group.title}</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    {group.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      {/* Email Toggle */}
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`${group.key}-email`}
                          checked={!!localPrefs[group.emailKey]}
                          onCheckedChange={(checked) => handleToggle(group.emailKey, checked)}
                        />
                        <Label
                          htmlFor={`${group.key}-email`}
                          className="text-sm flex items-center gap-1 cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        </Label>
                      </div>

                      {/* App Toggle */}
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`${group.key}-app`}
                          checked={!!localPrefs[group.appKey]}
                          onCheckedChange={(checked) => handleToggle(group.appKey, checked)}
                        />
                        <Label
                          htmlFor={`${group.key}-app`}
                          className="text-sm flex items-center gap-1 cursor-pointer"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updatePreferences.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updatePreferences.isPending}
          >
            {updatePreferences.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Salvar Preferências
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
