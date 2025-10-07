import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ContentIdeaModal from "@/components/ContentIdeaModal";
import ContentCard from "@/components/ContentCard";
import PillarLegend from "@/components/PillarLegend";

const daysOfWeek = [
  { day: "Segunda", pilar: "Edificar" },
  { day: "Terça", pilar: "Alcançar" },
  { day: "Quarta", pilar: "Pertencer" },
  { day: "Quinta", pilar: "Servir" },
  { day: "Sexta", pilar: "Convite" },
  { day: "Sábado", pilar: "Comunidade" },
  { day: "Domingo", pilar: "Cobertura" }
];

interface ContentItem {
  id: string;
  titulo: string;
  tipo: string;
  pilar: string;
  dia_sugerido: string;
  copy: string;
  hashtags: string[];
  cta: string;
  [key: string]: any;
}

export default function Planner() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contentByDay, setContentByDay] = useState<Record<string, ContentItem[]>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("Segunda");
  const [plannerId, setPlannerId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        loadPlanner(session.user.id);
      }
    });
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  const getWeekStartDate = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  const loadPlanner = async (userId: string) => {
    try {
      const weekStart = getWeekStartDate();
      
      const { data, error } = await supabase
        .from('content_planners')
        .select('*')
        .eq('user_id', userId)
        .eq('week_start_date', weekStart)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPlannerId(data.id);
        setContentByDay((data.content as Record<string, ContentItem[]>) || {});
      } else {
        // Create new planner for this week
        const { data: newPlanner, error: createError } = await supabase
          .from('content_planners')
          .insert({
            user_id: userId,
            week_start_date: weekStart,
            content: {}
          })
          .select()
          .single();

        if (createError) throw createError;
        setPlannerId(newPlanner.id);
        setContentByDay({});
      }
    } catch (error) {
      console.error('Error loading planner:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o planner.",
        variant: "destructive"
      });
    }
  };

  const savePlanner = async (newContent: Record<string, ContentItem[]>) => {
    if (!plannerId) return;

    try {
      const { error } = await supabase
        .from('content_planners')
        .update({ content: newContent })
        .eq('id', plannerId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving planner:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive"
      });
    }
  };

  const handleIdeaGenerated = (idea: any) => {
    const day = idea.dia_sugerido || selectedDay;
    const newContent = {
      ...idea,
      id: crypto.randomUUID()
    };

    const updatedContent = {
      ...contentByDay,
      [day]: [...(contentByDay[day] || []), newContent]
    };

    setContentByDay(updatedContent);
    savePlanner(updatedContent);
  };

  const handleDelete = (day: string, contentId: string) => {
    const updatedContent = {
      ...contentByDay,
      [day]: (contentByDay[day] || []).filter(c => c.id !== contentId)
    };
    setContentByDay(updatedContent);
    savePlanner(updatedContent);
  };

  const handleUpdate = (day: string, contentId: string, updates: any) => {
    const updatedContent = {
      ...contentByDay,
      [day]: (contentByDay[day] || []).map(c => 
        c.id === contentId ? { ...c, ...updates } : c
      )
    };
    setContentByDay(updatedContent);
    savePlanner(updatedContent);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold text-white">Planner Visual</h1>
              </div>
              <Button variant="outline" onClick={() => navigate("/historico")}>
                Histórico
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <PillarLegend />
        </div>

        {/* Desktop: 7-column grid */}
        <div className="hidden lg:grid lg:grid-cols-7 gap-4">
          {daysOfWeek.map(({ day, pilar }) => (
            <div key={day} className="space-y-3">
              <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg p-3">
                <h3 className="font-semibold text-foreground text-sm">{day}</h3>
                <p className="text-xs text-muted-foreground">{pilar}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => {
                    setSelectedDay(day);
                    setModalOpen(true);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Nova Ideia
                </Button>
              </div>
              
              <div className="space-y-3">
                {(contentByDay[day] || []).map((content) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    onDelete={(id) => handleDelete(day, id)}
                    onUpdate={(id, updates) => handleUpdate(day, id, updates)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Single column with tabs/sections */}
        <div className="lg:hidden space-y-6">
          {daysOfWeek.map(({ day, pilar }) => (
            <div key={day} className="space-y-3">
              <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{day}</h3>
                    <p className="text-sm text-muted-foreground">{pilar}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedDay(day);
                      setModalOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nova
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {(contentByDay[day] || []).map((content) => (
                    <ContentCard
                      key={content.id}
                      content={content}
                      onDelete={(id) => handleDelete(day, id)}
                      onUpdate={(id, updates) => handleUpdate(day, id, updates)}
                    />
                  ))}
                  
                  {(!contentByDay[day] || contentByDay[day].length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum conteúdo planejado
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ContentIdeaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultPilar={daysOfWeek.find(d => d.day === selectedDay)?.pilar}
        onIdeaGenerated={handleIdeaGenerated}
      />
    </div>
  );
}
