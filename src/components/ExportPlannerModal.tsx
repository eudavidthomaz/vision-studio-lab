import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import jsPDF from "jspdf";

interface ContentItem {
  id: string;
  titulo: string;
  tipo: string;
  pilar: string;
  dia_sugerido: string;
  copy: string;
  hashtags: string[];
  cta: string;
  imagem_url?: string;
}

interface ExportPlannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentByDay: Record<string, ContentItem[]>;
  weekStartDate: string;
}

const daysOfWeek = [
  { day: "Segunda", pilar: "Edificar" },
  { day: "Terça", pilar: "Alcançar" },
  { day: "Quarta", pilar: "Pertencer" },
  { day: "Quinta", pilar: "Servir" },
  { day: "Sexta", pilar: "Convite" },
  { day: "Sábado", pilar: "Comunidade" },
  { day: "Domingo", pilar: "Cobertura" }
];

const ExportPlannerModal = ({ 
  open, 
  onOpenChange, 
  contentByDay,
  weekStartDate
}: ExportPlannerModalProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const { toast } = useToast();

  const generatePDF = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      setExportProgress(10);

      // Header
      pdf.setFontSize(24);
      pdf.setTextColor(59, 130, 246); // primary color
      pdf.text('Planner Semanal - Ide-On', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Semana de ${new Date(weekStartDate).toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;

      setExportProgress(20);

      // Summary
      const totalPosts = Object.values(contentByDay).flat().length;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Total de posts planejados: ${totalPosts}`, 20, yPosition);
      
      yPosition += 10;
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;

      setExportProgress(30);

      // Content by day
      const totalDays = daysOfWeek.length;
      for (let i = 0; i < totalDays; i++) {
        const { day, pilar } = daysOfWeek[i];
        const contents = contentByDay[day] || [];

        // Update progress
        setExportProgress(30 + ((i / totalDays) * 60));

        // Check if we need a new page
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = 20;
        }

        // Day header
        pdf.setFontSize(14);
        pdf.setTextColor(59, 130, 246);
        pdf.text(`${day} - ${pilar}`, 20, yPosition);
        yPosition += 8;

        if (contents.length === 0) {
          pdf.setFontSize(10);
          pdf.setTextColor(150, 150, 150);
          pdf.text('Nenhum conteúdo planejado', 25, yPosition);
          yPosition += 10;
        } else {
          for (const content of contents) {
            // Check page break
            if (yPosition > pageHeight - 60) {
              pdf.addPage();
              yPosition = 20;
            }

            // Content box
            pdf.setFillColor(250, 250, 250);
            pdf.rect(20, yPosition - 5, pageWidth - 40, 2, 'F');

            // Title
            pdf.setFontSize(11);
            pdf.setTextColor(0, 0, 0);
            pdf.text(content.titulo, 25, yPosition);
            yPosition += 6;

            // Type and Pilar badges
            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`${content.tipo} | ${content.pilar}`, 25, yPosition);
            yPosition += 6;

            // Copy (truncated)
            pdf.setFontSize(9);
            pdf.setTextColor(60, 60, 60);
            const copyLines = pdf.splitTextToSize(content.copy.substring(0, 150) + '...', pageWidth - 50);
            pdf.text(copyLines.slice(0, 3), 25, yPosition);
            yPosition += copyLines.slice(0, 3).length * 5;

            // Hashtags
            if (content.hashtags.length > 0) {
              pdf.setFontSize(8);
              pdf.setTextColor(59, 130, 246);
              const hashtagText = content.hashtags.slice(0, 5).join(' ');
              pdf.text(hashtagText, 25, yPosition);
              yPosition += 5;
            }

            // Image indicator
            if (content.imagem_url) {
              pdf.setFontSize(8);
              pdf.setTextColor(34, 197, 94); // green
              pdf.text('✓ Imagem disponível', 25, yPosition);
              yPosition += 5;
            }

            yPosition += 8;
          }
        }

        yPosition += 5;
      }

      setExportProgress(90);

      // Footer on last page
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Gerado em ${new Date().toLocaleString('pt-BR')} - Ide-On Planner`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      // Save
      pdf.save(`planner-semanal-${weekStartDate}.pdf`);

      setExportProgress(100);

      toast({
        title: "PDF gerado!",
        description: "O planner foi exportado com sucesso.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const generateCSV = () => {
    try {
      let csv = "Dia,Pilar,Título,Tipo,Copy,CTA,Hashtags,Imagem\n";

      for (const { day, pilar } of daysOfWeek) {
        const contents = contentByDay[day] || [];
        for (const content of contents) {
          const row = [
            day,
            pilar,
            `"${content.titulo.replace(/"/g, '""')}"`,
            content.tipo,
            `"${content.copy.replace(/"/g, '""')}"`,
            `"${content.cta.replace(/"/g, '""')}"`,
            `"${content.hashtags.join(' ')}"`,
            content.imagem_url ? 'Sim' : 'Não'
          ];
          csv += row.join(',') + '\n';
        }
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `planner-semanal-${weekStartDate}.csv`;
      link.click();

      toast({
        title: "CSV gerado!",
        description: "O planner foi exportado com sucesso.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error generating CSV:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o CSV. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Planner</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Escolha o formato para exportar seu planner semanal:
          </p>

          <div className="space-y-3">
            <Button
              onClick={generatePDF}
              disabled={isExporting}
              className="w-full justify-start"
              variant="outline"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando PDF... {exportProgress}%
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar como PDF
                </>
              )}
            </Button>

            {isExporting && exportProgress > 0 && (
              <Progress value={exportProgress} className="h-2" />
            )}

            <Button
              onClick={generateCSV}
              disabled={isExporting}
              className="w-full justify-start"
              variant="outline"
            >
              <FileText className="mr-2 h-4 w-4" />
              Exportar como CSV/Excel
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              O PDF inclui todos os posts planejados com formatação visual. 
              O CSV é ideal para importar em outras ferramentas.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportPlannerModal;
