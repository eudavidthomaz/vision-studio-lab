import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ScheduleConfirmationToken {
  id: string;
  schedule_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  action_taken: string | null;
  notes: string | null;
  created_at: string;
}

export interface ConfirmScheduleRequest {
  token: string;
  action: 'confirm' | 'decline' | 'request_substitute';
  notes?: string;
}

export interface ConfirmScheduleResponse {
  success: boolean;
  message: string;
  schedule?: {
    id: string;
    service_date: string;
    service_name: string;
    role: string;
    volunteer_name: string;
    status: string;
  };
}

export interface PendingConfirmation {
  schedule_id: string;
  volunteer_id: string;
  volunteer_name: string;
  service_date: string;
  service_name: string;
  role: string;
  status: string;
  token_created_at: string;
  days_pending: number;
}

export function useScheduleConfirmation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Confirm schedule via edge function (public - no auth required)
  const confirmSchedule = useMutation({
    mutationFn: async (request: ConfirmScheduleRequest) => {
      const { data, error } = await supabase.functions.invoke('confirm-schedule', {
        body: request,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data as ConfirmScheduleResponse;
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? 'Confirmação registrada' : 'Erro na confirmação',
        description: data.message,
        variant: data.success ? 'default' : 'destructive',
      });
    },
    onError: (error) => {
      console.error('Error confirming schedule:', error);
      toast({
        title: 'Erro ao confirmar',
        description: error instanceof Error ? error.message : 'Não foi possível processar a confirmação.',
        variant: 'destructive',
      });
    },
  });

  // Get schedule details by token (public)
  const getScheduleByToken = useQuery({
    queryKey: ['schedule-by-token'],
    queryFn: async () => {
      // This will be called with a specific token via refetch
      return null;
    },
    enabled: false,
  });

  // Fetch schedule details using token
  const fetchScheduleByToken = async (token: string) => {
    const { data, error } = await supabase.functions.invoke('confirm-schedule', {
      body: {
        token,
        action: 'get_details',
      },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    
    return data;
  };

  // Get pending confirmations for leader
  const getPendingConfirmations = useQuery({
    queryKey: ['pending-confirmations'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) return [];

      // Get schedules with status 'scheduled' that have pending tokens
      const { data, error } = await supabase
        .from('volunteer_schedules')
        .select(`
          id,
          volunteer_id,
          service_date,
          service_name,
          role,
          status,
          volunteers (
            id,
            name
          ),
          schedule_confirmation_tokens (
            created_at,
            used_at
          )
        `)
        .eq('user_id', session.session.user.id)
        .eq('status', 'scheduled')
        .not('schedule_confirmation_tokens', 'is', null)
        .gte('service_date', new Date().toISOString().split('T')[0])
        .order('service_date', { ascending: true });

      if (error) throw error;

      // Transform and filter data
      const pending: PendingConfirmation[] = (data || [])
        .filter((schedule: any) => {
          const token = schedule.schedule_confirmation_tokens;
          return token && !token.used_at;
        })
        .map((schedule: any) => {
          const token = schedule.schedule_confirmation_tokens;
          const createdAt = new Date(token.created_at);
          const now = new Date();
          const daysPending = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

          return {
            schedule_id: schedule.id,
            volunteer_id: schedule.volunteer_id,
            volunteer_name: schedule.volunteers?.name || 'Voluntário',
            service_date: schedule.service_date,
            service_name: schedule.service_name || 'Culto',
            role: schedule.role,
            status: schedule.status,
            token_created_at: token.created_at,
            days_pending: daysPending,
          };
        });

      return pending;
    },
  });

  // Resend confirmation request
  const resendConfirmation = useMutation({
    mutationFn: async (scheduleId: string) => {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          type: 'confirmation_request',
          schedule_id: scheduleId,
          resend: true,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Confirmação reenviada',
        description: 'Um novo pedido de confirmação foi enviado.',
      });
    },
    onError: (error) => {
      console.error('Error resending confirmation:', error);
      toast({
        title: 'Erro ao reenviar',
        description: error instanceof Error ? error.message : 'Não foi possível reenviar a confirmação.',
        variant: 'destructive',
      });
    },
  });

  return {
    confirmSchedule,
    fetchScheduleByToken,
    getPendingConfirmations,
    resendConfirmation,
    isLoading: confirmSchedule.isPending,
  };
}
