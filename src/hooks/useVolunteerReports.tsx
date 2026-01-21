import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

export interface VolunteerStats {
  volunteer_id: string;
  name: string;
  primary_role: string;
  user_id: string;
  email: string | null;
  phone: string | null;
  ministry: string | null;
  is_active: boolean;
  total_schedules: number;
  confirmed_count: number;
  absent_count: number;
  pending_count: number;
  substituted_count: number;
  attendance_rate: number;
  first_schedule: string | null;
  last_schedule: string | null;
  roles_worked: string[];
  roles_count: number;
}

export interface RoleDistribution {
  role: string;
  role_label: string;
  count: number;
  percentage: number;
}

export interface AttendanceTrend {
  month: string;
  month_label: string;
  total_schedules: number;
  confirmed: number;
  absent: number;
  attendance_rate: number;
}

export interface MonthlyOverview {
  total_services: number;
  total_schedules: number;
  unique_volunteers: number;
  overall_attendance_rate: number;
  top_volunteers: {
    id: string;
    name: string;
    count: number;
  }[];
  role_summary: {
    role: string;
    label: string;
    count: number;
  }[];
}

export interface ReportRequest {
  report_type: 'volunteer_summary' | 'role_distribution' | 'attendance_trend' | 'monthly_overview';
  start_date: string;
  end_date: string;
  volunteer_ids?: string[];
  roles?: string[];
}

export interface VolunteerSummaryReport {
  period: { start: string; end: string };
  total_services: number;
  total_volunteers: number;
  overall_attendance_rate: number;
  volunteers: VolunteerStats[];
}

export interface RoleDistributionReport {
  period: { start: string; end: string };
  total_schedules: number;
  distribution: RoleDistribution[];
}

export interface AttendanceTrendReport {
  period: { start: string; end: string };
  trends: AttendanceTrend[];
}

export interface MonthlyOverviewReport {
  period: { start: string; end: string };
  overview: MonthlyOverview;
}

export type ReportResponse = 
  | { type: 'volunteer_summary'; data: VolunteerSummaryReport }
  | { type: 'role_distribution'; data: RoleDistributionReport }
  | { type: 'attendance_trend'; data: AttendanceTrendReport }
  | { type: 'monthly_overview'; data: MonthlyOverviewReport };

export function useVolunteerReports() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getUser();
  }, []);

  // Get volunteer stats view
  const volunteerStats = useQuery({
    queryKey: ['volunteer-stats', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('volunteer_stats')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data as VolunteerStats[];
    },
    enabled: !!userId,
  });

  // Fetch report from edge function
  const fetchReport = useMutation({
    mutationFn: async (request: ReportRequest) => {
      const { data, error } = await supabase.functions.invoke('volunteer-reports', {
        body: request,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data as ReportResponse;
    },
    onError: (error) => {
      console.error('Error fetching report:', error);
      toast({
        title: 'Erro ao gerar relatório',
        description: error instanceof Error ? error.message : 'Não foi possível gerar o relatório.',
        variant: 'destructive',
      });
    },
  });

  // Helper to get volunteer summary
  const getVolunteerSummary = async (startDate: string, endDate: string, volunteerIds?: string[]) => {
    return fetchReport.mutateAsync({
      report_type: 'volunteer_summary',
      start_date: startDate,
      end_date: endDate,
      volunteer_ids: volunteerIds,
    });
  };

  // Helper to get role distribution
  const getRoleDistribution = async (startDate: string, endDate: string) => {
    return fetchReport.mutateAsync({
      report_type: 'role_distribution',
      start_date: startDate,
      end_date: endDate,
    });
  };

  // Helper to get attendance trend
  const getAttendanceTrend = async (startDate: string, endDate: string) => {
    return fetchReport.mutateAsync({
      report_type: 'attendance_trend',
      start_date: startDate,
      end_date: endDate,
    });
  };

  // Helper to get monthly overview
  const getMonthlyOverview = async (startDate: string, endDate: string) => {
    return fetchReport.mutateAsync({
      report_type: 'monthly_overview',
      start_date: startDate,
      end_date: endDate,
    });
  };

  return {
    volunteerStats,
    fetchReport,
    getVolunteerSummary,
    getRoleDistribution,
    getAttendanceTrend,
    getMonthlyOverview,
    isLoading: fetchReport.isPending,
  };
}
