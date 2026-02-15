import { Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import type { VolunteerSchedule } from "@/hooks/useVolunteerSchedules";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ScheduleShareLinkProps {
  schedule: VolunteerSchedule;
}

export function ScheduleShareLink({ schedule }: ScheduleShareLinkProps) {
  const { toast } = useToast();

  const token = schedule.schedule_confirmation_tokens;
  if (!token || token.used_at) return null;

  // Check if token is expired
  if (new Date(token.expires_at) < new Date()) return null;

  const confirmUrl = `${window.location.origin}/confirmar/${token.token}`;
  const volunteerName = schedule.volunteers?.name || "Voluntário";
  const dateFormatted = format(parseISO(schedule.service_date), "dd/MM/yyyy (EEEE)", { locale: ptBR });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(confirmUrl);
      toast({ title: "Link copiado!", description: "Cole e envie para o voluntário." });
    } catch {
      toast({ title: "Erro ao copiar", description: "Tente novamente.", variant: "destructive" });
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá, ${volunteerName}! 🙏\n\nVocê foi escalado(a) para:\n📅 ${dateFormatted}\n⚙️ Função: ${schedule.role}\n🏛️ ${schedule.service_name || "Culto"}\n\nConfirme sua presença pelo link:\n${confirmUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <div className="flex items-center gap-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
            <Copy className="w-3 h-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copiar link de confirmação</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-emerald-600 dark:text-emerald-400" onClick={handleWhatsApp}>
            <Share2 className="w-3 h-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Enviar via WhatsApp</TooltipContent>
      </Tooltip>
    </div>
  );
}
