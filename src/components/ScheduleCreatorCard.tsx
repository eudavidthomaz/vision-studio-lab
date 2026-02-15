import { useState, useEffect } from "react";
import { CalendarCheck, Users, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useInView } from "react-intersection-observer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ScheduleStats {
  totalVolunteers: number;
  nextScheduleDate: string | null;
  pendingConfirmations: number;
}

interface ScheduleCreatorCardProps {
  onClick: () => void;
}

export const ScheduleCreatorCard = ({ onClick }: ScheduleCreatorCardProps) => {
  const [stats, setStats] = useState<ScheduleStats | null>(null);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [volunteersRes, nextScheduleRes, pendingRes] = await Promise.all([
        supabase
          .from("volunteers")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_active", true),
        supabase
          .from("volunteer_schedules")
          .select("service_date")
          .eq("user_id", user.id)
          .gte("service_date", new Date().toISOString().split("T")[0])
          .order("service_date", { ascending: true })
          .limit(1),
        supabase
          .from("volunteer_schedules")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "pending")
          .gte("service_date", new Date().toISOString().split("T")[0]),
      ]);

      const nextDate = nextScheduleRes.data?.[0]?.service_date ?? null;

      setStats({
        totalVolunteers: volunteersRes.count ?? 0,
        nextScheduleDate: nextDate,
        pendingConfirmations: pendingRes.count ?? 0,
      });
    };

    fetchStats();
  }, []);

  const hasStats = stats && (stats.totalVolunteers > 0 || stats.nextScheduleDate || stats.pendingConfirmations > 0);

  const formattedNextDate = stats?.nextScheduleDate
    ? format(new Date(stats.nextScheduleDate + "T12:00:00"), "EEE dd/MM", { locale: ptBR })
    : null;

  return (
    <button
      ref={ref}
      onClick={onClick}
      className="group relative w-full text-left rounded-xl border border-border bg-card p-4 sm:p-5 md:p-6 transition-all duration-300 hover:shadow-[0_8px_30px_hsl(230_80%_60%/0.15)] hover:border-[hsl(230_70%_55%/0.5)] hover:bg-[hsl(230_80%_60%/0.04)] focus:outline-none focus:ring-2 focus:ring-[hsl(230_70%_55%/0.5)]"
    >
      <div className="flex items-start gap-4">
        {/* Icon with shimmer */}
        <div className="shrink-0 relative flex items-center justify-center w-12 h-12 rounded-lg overflow-hidden transition-colors duration-300 bg-[hsl(230_80%_60%/0.12)] group-hover:bg-[hsl(230_80%_60%/0.22)]">
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: "linear-gradient(110deg, transparent 30%, hsl(230 80% 70% / 0.18) 50%, transparent 70%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2.5s ease-in-out infinite",
            }}
          />
          <CalendarCheck className="relative z-10 w-6 h-6 text-[hsl(230_80%_65%)]" />
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base sm:text-lg text-foreground">
            Escalas de Voluntários
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            Organize e gerencie as escalas da sua equipe ministerial. Gere escalas inteligentes com IA.
          </p>
        </div>
      </div>

      {/* Mini stats */}
      {hasStats && inView && (
        <div className="mt-4 flex flex-wrap gap-3 sm:gap-4">
          {stats.totalVolunteers > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "0ms", animationFillMode: "both" }}>
              <Users className="w-3.5 h-3.5 text-[hsl(230_80%_65%)]" />
              <span>{stats.totalVolunteers} voluntário{stats.totalVolunteers !== 1 ? "s" : ""}</span>
            </div>
          )}
          {formattedNextDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
              <Clock className="w-3.5 h-3.5 text-[hsl(230_80%_65%)]" />
              <span>Próx: {formattedNextDate}</span>
            </div>
          )}
          {stats.pendingConfirmations > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-amber-400 animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{stats.pendingConfirmations} pendente{stats.pendingConfirmations !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      )}
    </button>
  );
};
