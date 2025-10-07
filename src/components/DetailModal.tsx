import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download } from "lucide-react";
import WeeklyPackDisplay from "./WeeklyPackDisplay";
import IdeonChallengeCard from "./IdeonChallengeCard";

interface DetailModalProps {
  item: any;
  type: "pack" | "challenge";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DetailModal({ item, type, open, onOpenChange }: DetailModalProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleImportToPlanner = async () => {
    if (type !== "pack") return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const weekStart = getWeekStartDate();
      
      // Check if planner exists for this week
      const { data: existingPlanner } = await supabase
        .from('content_planners')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStart)
        .maybeSingle();

      const pack = item.pack;
      const importedContent: any = {};

      // Map content to days based on strategic pillar
      const dayMapping: Record<string, string> = {
        "Edificar": "Segunda",
        "Alcançar": "Terça",
        "Pertencer": "Quarta",
        "Servir": "Quinta",
        "Convite": "Sexta",
        "Comunidade": "Sábado",
        "Cobertura": "Domingo"
      };

      // Import legendas
      if (pack.legendas) {
        pack.legendas.forEach((legenda: any) => {
          const day = dayMapping[legenda.pilar_estrategico] || "Segunda";
          if (!importedContent[day]) importedContent[day] = [];
          importedContent[day].push({
            id: crypto.randomUUID(),
            titulo: legenda.texto?.substring(0, 30) || "Legenda",
            tipo: "Legenda",
            pilar: legenda.pilar_estrategico || "Edificar",
            dia_sugerido: day,
            copy: legenda.texto || "",
            hashtags: legenda.hashtags || [],
            cta: legenda.cta || ""
          });
        });
      }

      // Import carrosseis
      if (pack.carrosseis) {
        pack.carrosseis.forEach((carrossel: any) => {
          const day = dayMapping[carrossel.pilar_estrategico] || "Terça";
          if (!importedContent[day]) importedContent[day] = [];
          importedContent[day].push({
            id: crypto.randomUUID(),
            titulo: carrossel.titulo || "Carrossel",
            tipo: "Carrossel",
            pilar: carrossel.pilar_estrategico || "Alcançar",
            dia_sugerido: day,
            copy: carrossel.slides?.map((s: any) => s.texto).join('\n\n') || "",
            slides: carrossel.slides || []
          });
        });
      }

      // Import reels
      if (pack.reels) {
        pack.reels.forEach((reel: any) => {
          const day = dayMapping[reel.pilar_estrategico] || "Terça";
          if (!importedContent[day]) importedContent[day] = [];
          importedContent[day].push({
            id: crypto.randomUUID(),
            titulo: reel.titulo || "Reel",
            tipo: "Reel",
            pilar: reel.pilar_estrategico || "Alcançar",
            dia_sugerido: day,
            copy: reel.roteiro || "",
            hook: reel.hook,
            duracao_estimada: reel.duracao_estimada
          });
        });
      }

      if (existingPlanner) {
        // Merge with existing content
        const existingContent = (existingPlanner.content as Record<string, any[]>) || {};
        const mergedContent: Record<string, any[]> = { ...existingContent };

        Object.keys(importedContent).forEach(day => {
          mergedContent[day] = [
            ...(mergedContent[day] || []),
            ...importedContent[day]
          ];
        });

        await supabase
          .from('content_planners')
          .update({ content: mergedContent })
          .eq('id', existingPlanner.id);
      } else {
        // Create new planner
        await supabase
          .from('content_planners')
          .insert({
            user_id: user.id,
            week_start_date: weekStart,
            content: importedContent
          });
      }

      toast({
        title: "Sucesso!",
        description: "Conteúdo importado para o planner."
      });

      navigate("/planner");
    } catch (error) {
      console.error('Error importing to planner:', error);
      toast({
        title: "Erro",
        description: "Não foi possível importar o conteúdo.",
        variant: "destructive"
      });
    }
  };

  const getWeekStartDate = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalhes do Conteúdo</span>
            {type === "pack" && (
              <Button
                onClick={handleImportToPlanner}
                size="sm"
                className="ml-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Importar para Planner
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {type === "pack" && <WeeklyPackDisplay pack={item.pack} />}
          {type === "challenge" && <IdeonChallengeCard challenge={item.challenge} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}