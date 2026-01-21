import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VolunteerSchedule } from '@/hooks/useVolunteerSchedules';

export interface SmartScheduleRequest {
  service_date: string;
  service_name?: string;
  roles: string[];
  volunteer_ids?: string[];
  start_time?: string;
  end_time?: string;
  use_ai_optimization: boolean;
  consider_calendar_availability: boolean;
  preferences?: {
    avoid_consecutive_weeks: boolean;
    balance_workload: boolean;
    respect_role_preferences: boolean;
  };
}

export interface SmartScheduleAssignment {
  role: string;
  volunteer_id: string;
  volunteer_name: string;
  reason: string;
}

export interface SmartScheduleConflict {
  volunteer_id: string;
  volunteer_name: string;
  reason: string;
  conflict_type: 'calendar' | 'consecutive' | 'overloaded' | 'unavailable';
}

export interface SmartScheduleResponse {
  success: boolean;
  schedules_created: number;
  assignments: SmartScheduleAssignment[];
  conflicts: SmartScheduleConflict[];
  ai_summary?: string;
  ai_reasoning?: string;
  warnings?: string[];
  message?: string;
}

export function useSmartSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Generate smart schedule using AI
  const generateSmartSchedule = useMutation({
    mutationFn: async (request: SmartScheduleRequest) => {
      const { data, error } = await supabase.functions.invoke('generate-smart-schedule', {
        body: request,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data as SmartScheduleResponse;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['volunteer-schedules'] });
      
      const title = data.success 
        ? 'Escala gerada com IA' 
        : 'Escala parcialmente gerada';
      
      const description = data.ai_summary || data.message || 
        `${data.schedules_created} escala(s) criada(s)${data.conflicts.length > 0 ? ` com ${data.conflicts.length} conflito(s)` : ''}.`;
      
      toast({
        title,
        description,
        variant: data.conflicts.length > 0 ? 'default' : 'default',
      });
    },
    onError: (error) => {
      console.error('Error generating smart schedule:', error);
      toast({
        title: 'Erro ao gerar escala',
        description: error instanceof Error ? error.message : 'Não foi possível gerar a escala inteligente.',
        variant: 'destructive',
      });
    },
  });

  // Generate regular schedule (existing function)
  const generateRegularSchedule = useMutation({
    mutationFn: async (request: Omit<SmartScheduleRequest, 'use_ai_optimization' | 'consider_calendar_availability' | 'preferences'>) => {
      const { data, error } = await supabase.functions.invoke('generate-volunteer-schedule', {
        body: request,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['volunteer-schedules'] });
      toast({
        title: 'Escala gerada',
        description: data.message || 'A escala foi criada com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error generating schedule:', error);
      toast({
        title: 'Erro ao gerar escala',
        description: error instanceof Error ? error.message : 'Não foi possível gerar a escala.',
        variant: 'destructive',
      });
    },
  });

  return {
    generateSmartSchedule,
    generateRegularSchedule,
    isLoading: generateSmartSchedule.isPending || generateRegularSchedule.isPending,
  };
}
