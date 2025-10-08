import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Plus } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface DayContent {
  day: string;
  date: Date;
  itemCount: number;
  preview?: string;
}

export function WeekPreviewSection() {
  const [weekContent, setWeekContent] = useState<DayContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasContent, setHasContent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadWeekPreview();
  }, []);

  const loadWeekPreview = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');

      const { data: planner } = await supabase
        .from('content_planners')
        .select('content')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartStr)
        .single();

      if (planner && planner.content) {
        const content = planner.content as Record<string, any[]>;
        const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        
        const preview: DayContent[] = days.map((day, index) => {
          const dayDate = addDays(weekStart, index);
          const dayItems = content[day] || [];
          const firstItem = dayItems[0];
          
          return {
            day,
            date: dayDate,
            itemCount: dayItems.length,
            preview: firstItem?.titulo || firstItem?.copy?.substring(0, 40)
          };
        });

        const hasAnyContent = preview.some(d => d.itemCount > 0);
        setHasContent(hasAnyContent);
        setWeekContent(preview);
      } else {
        setHasContent(false);
        const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        setWeekContent(days.map((day, index) => ({
          day,
          date: addDays(weekStart, index),
          itemCount: 0
        })));
      }
    } catch (error) {
      console.error('Error loading week preview:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Esta Semana no Planner
          </h2>
        </div>
        <Card className="p-6 animate-pulse">
          <div className="grid grid-cols-7 gap-2">
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Esta Semana no Planner
        </h2>
        <Button 
          variant="outline" 
          onClick={() => navigate('/planner')}
          className="gap-2"
        >
          Ver Completo
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {!hasContent ? (
        <Card className="p-8 text-center">
          <Plus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Sua semana está vazia</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Crie conteúdo usando os cards acima ou vá para o Planner organizar sua semana.
          </p>
          <Button onClick={() => navigate('/planner')}>
            Abrir Planner
          </Button>
        </Card>
      ) : (
        <Card className="p-4 md:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2 md:gap-3">
            {weekContent.map(day => (
              <div
                key={day.day}
                className={`p-2 md:p-3 rounded-lg border transition-colors ${
                  day.itemCount > 0 
                    ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' 
                    : 'bg-muted/50 border-muted'
                }`}
              >
                <div className="text-[10px] md:text-xs font-medium text-muted-foreground mb-1">
                  {day.day.substring(0, 3)}
                </div>
                <div className="text-sm md:text-base font-bold mb-1">
                  {format(day.date, 'd')}
                </div>
                {day.itemCount > 0 ? (
                  <Badge variant="secondary" className="text-[10px] md:text-xs px-1 py-0">
                    {day.itemCount}
                  </Badge>
                ) : (
                  <div className="text-xs text-muted-foreground">-</div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </section>
  );
}
