import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
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
  const [currentPlanner, setCurrentPlanner] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (open && type === "pack") {
      loadCurrentPlanner();
    }
  }, [open, type]);

  const loadCurrentPlanner = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const weekStart = getWeekStartDate();
      const { data: existingPlanner } = await supabase
        .from('content_planners')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStart)
        .maybeSingle();

      if (existingPlanner) {
        setCurrentPlanner((existingPlanner.content as Record<string, any[]>) || {});
      }
    } catch (error) {
      console.error('Error loading planner:', error);
    }
  };

  const handleImportToPlanner = async (selectedItems: any[], conflictResolution: 'replace' | 'add' | 'skip') => {
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

      // Organize selected items by day
      const importedContent: Record<string, any[]> = {};
      selectedItems.forEach(item => {
        const day = item.dia_sugerido;
        if (!importedContent[day]) importedContent[day] = [];
        importedContent[day].push({
          id: crypto.randomUUID(),
          titulo: item.titulo,
          tipo: item.tipo,
          pilar: item.pilar,
          dia_sugerido: day,
          copy: item.copy,
          hashtags: item.hashtags || [],
          cta: item.cta || "",
          slides: item.slides,
          hook: item.hook,
          roteiro: item.roteiro,
          duracao_estimada: item.duracao
        });
      });

      if (existingPlanner) {
        const existingContent = (existingPlanner.content as Record<string, any[]>) || {};
        let mergedContent: Record<string, any[]> = { ...existingContent };

        Object.keys(importedContent).forEach(day => {
          if (conflictResolution === 'replace') {
            // Replace all content for this day
            mergedContent[day] = importedContent[day];
          } else if (conflictResolution === 'add') {
            // Add to existing content
            mergedContent[day] = [
              ...(mergedContent[day] || []),
              ...importedContent[day]
            ];
          } else if (conflictResolution === 'skip') {
            // Only add if day is empty
            if (!mergedContent[day] || mergedContent[day].length === 0) {
              mergedContent[day] = importedContent[day];
            }
          }
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
          <DialogTitle>Detalhes do Conteúdo</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {type === "pack" && (
            <WeeklyPackDisplay 
              pack={item.pack}
              currentPlanner={currentPlanner}
              onImportToPlanner={handleImportToPlanner}
            />
          )}
          {type === "challenge" && <IdeonChallengeCard challenge={item.challenge} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}