import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VolunteerSchedule {
  id: string;
  user_id: string;
  volunteer_id: string;
  service_date: string;
  service_name: string;
  start_time: string | null;
  end_time: string | null;
  role: string;
  status: 'scheduled' | 'confirmed' | 'absent' | 'substituted';
  notes: string | null;
  confirmed_at: string | null;
  confirmed_by: string | null;
  created_at: string;
  updated_at: string;
  volunteers?: {
    id: string;
    name: string;
    role: string;
    phone: string | null;
  };
}

export interface GenerateScheduleRequest {
  service_date: string;
  service_name?: string;
  roles: string[];
  volunteer_ids?: string[];
  start_time?: string;
  end_time?: string;
}

export const SCHEDULE_STATUSES = [
  { value: 'scheduled', label: 'Agendado', color: 'bg-blue-500' },
  { value: 'confirmed', label: 'Confirmado', color: 'bg-green-500' },
  { value: 'absent', label: 'Ausente', color: 'bg-red-500' },
  { value: 'substituted', label: 'Substituído', color: 'bg-yellow-500' },
] as const;

export function useVolunteerSchedules(serviceDate?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // List schedules (optionally filtered by date)
  const list = useQuery({
    queryKey: ['volunteer-schedules', serviceDate],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('volunteer_schedules')
        .select(`
          *,
          volunteers (
            id,
            name,
            role,
            phone
          )
        `)
        .eq('user_id', session.session.user.id)
        .order('service_date', { ascending: true })
        .order('role', { ascending: true });

      if (serviceDate) {
        query = query.eq('service_date', serviceDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as VolunteerSchedule[];
    },
  });

  // List schedules by date range
  const useListByDateRange = (startDate: string, endDate: string) => {
    return useQuery({
      queryKey: ['volunteer-schedules', 'range', startDate, endDate],
      queryFn: async () => {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user?.id) {
          throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
          .from('volunteer_schedules')
          .select(`
            *,
            volunteers (
              id,
              name,
              role,
              phone
            )
          `)
          .eq('user_id', session.session.user.id)
          .gte('service_date', startDate)
          .lte('service_date', endDate)
          .order('service_date', { ascending: true })
          .order('role', { ascending: true });

        if (error) throw error;
        return data as VolunteerSchedule[];
      },
      enabled: !!startDate && !!endDate,
    });
  };

  // Generate schedules using edge function
  const createBulk = useMutation({
    mutationFn: async (request: GenerateScheduleRequest) => {
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

  // Update schedule status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const updates: Record<string, unknown> = { 
        status, 
        updated_at: new Date().toISOString() 
      };
      
      if (notes !== undefined) {
        updates.notes = notes;
      }

      const { data, error } = await supabase
        .from('volunteer_schedules')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          volunteers (
            id,
            name,
            role,
            phone
          )
        `)
        .single();

      if (error) throw error;
      return data as VolunteerSchedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteer-schedules'] });
      toast({
        title: 'Status atualizado',
        description: 'O status da escala foi atualizado.',
      });
    },
    onError: (error) => {
      console.error('Error updating schedule status:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    },
  });

  // Delete schedule
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('volunteer_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteer-schedules'] });
      toast({
        title: 'Escala removida',
        description: 'A escala foi removida com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting schedule:', error);
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover a escala.',
        variant: 'destructive',
      });
    },
  });

  // Delete all schedules for a specific date
  const removeByDate = useMutation({
    mutationFn: async (date: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('volunteer_schedules')
        .delete()
        .eq('user_id', session.session.user.id)
        .eq('service_date', date);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteer-schedules'] });
      toast({
        title: 'Escalas removidas',
        description: 'Todas as escalas do dia foram removidas.',
      });
    },
    onError: (error) => {
      console.error('Error deleting schedules by date:', error);
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover as escalas.',
        variant: 'destructive',
      });
    },
  });

  return {
    list,
    useListByDateRange,
    createBulk,
    updateStatus,
    remove,
    removeByDate,
  };
}
