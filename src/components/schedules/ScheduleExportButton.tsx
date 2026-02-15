import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { VOLUNTEER_ROLES } from "@/hooks/useVolunteers";
import { SCHEDULE_STATUSES, type VolunteerSchedule } from "@/hooks/useVolunteerSchedules";
import { useToast } from "@/hooks/use-toast";

interface ScheduleExportButtonProps {
  schedules: VolunteerSchedule[];
  periodLabel: string;
}

export function ScheduleExportButton({ schedules, periodLabel }: ScheduleExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const getRoleLabel = (value: string) =>
    VOLUNTEER_ROLES.find((r) => r.value === value)?.label || value;

  const getStatusLabel = (value: string) =>
    SCHEDULE_STATUSES.find((s) => s.value === value)?.label || value;

  const handleExport = async () => {
    if (schedules.length === 0) {
      toast({ title: "Nenhuma escala", description: "Não há escalas para exportar.", variant: "destructive" });
      return;
    }

    setIsExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      doc.setFontSize(16);
      doc.text("Escalas de Voluntários", 14, 20);
      doc.setFontSize(10);
      doc.text(periodLabel, 14, 28);

      let y = 38;
      const grouped: Record<string, VolunteerSchedule[]> = {};
      schedules.forEach((s) => {
        if (!grouped[s.service_date]) grouped[s.service_date] = [];
        grouped[s.service_date].push(s);
      });

      Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([date, items]) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }

          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text(format(parseISO(date), "EEEE, dd/MM/yyyy", { locale: ptBR }), 14, y);
          y += 6;

          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          items.forEach((s) => {
            if (y > 280) {
              doc.addPage();
              y = 20;
            }
            const line = `• ${s.volunteers?.name || "Voluntário"} — ${getRoleLabel(s.role)} — ${getStatusLabel(s.status)}`;
            doc.text(line, 18, y);
            y += 5;
          });
          y += 4;
        });

      doc.save(`escalas-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast({ title: "PDF exportado", description: "O arquivo foi baixado com sucesso." });
    } catch (error) {
      console.error("Export error:", error);
      toast({ title: "Erro ao exportar", description: "Não foi possível gerar o PDF.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting} className="gap-2">
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">{isExporting ? "Exportando..." : "Exportar"}</span>
    </Button>
  );
}
