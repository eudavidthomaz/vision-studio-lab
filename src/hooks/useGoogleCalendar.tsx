import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

export interface GoogleCalendarToken {
  id: string;
  user_id: string;
  volunteer_id: string | null;
  access_token: string;
  refresh_token: string;
  token_expiry: string;
  calendar_id: string | null;
  scopes: string[] | null;
  email: string | null;
  is_active: boolean;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarAvailability {
  volunteer_id: string;
  volunteer_name?: string;
  is_connected: boolean;
  busy_slots: {
    start: string;
    end: string;
    summary?: string;
  }[];
  available: boolean;
  error?: string;
}

export interface AvailabilityRequest {
  volunteer_ids: string[];
  start_date: string;
  end_date: string;
  time_min?: string;
  time_max?: string;
}

export function useGoogleCalendar(volunteerId?: string) {
  const queryClient = useQueryClient();
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

  // Get connection status for a volunteer
  const connectionStatus = useQuery({
    queryKey: ['google-calendar-connection', volunteerId],
    queryFn: async () => {
      if (!userId || !volunteerId) return null;

      const { data, error } = await supabase
        .from('google_calendar_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('volunteer_id', volunteerId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data as GoogleCalendarToken | null;
    },
    enabled: !!userId && !!volunteerId,
  });

  // List all connected calendars for user
  const listConnections = useQuery({
    queryKey: ['google-calendar-connections', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('google_calendar_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;
      return data as GoogleCalendarToken[];
    },
    enabled: !!userId,
  });

  // Initiate OAuth flow
  const initiateAuth = useMutation({
    mutationFn: async (params: { volunteer_id: string }) => {
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: {
          action: 'authorize',
          volunteer_id: params.volunteer_id,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data as { auth_url: string };
    },
    onSuccess: (data) => {
      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;
      
      window.open(
        data.auth_url,
        'google-oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    },
    onError: (error) => {
      console.error('Error initiating Google Calendar auth:', error);
      toast({
        title: 'Erro ao conectar',
        description: error instanceof Error ? error.message : 'Não foi possível iniciar a conexão com o Google Calendar.',
        variant: 'destructive',
      });
    },
  });

  // Handle OAuth callback
  const handleCallback = useMutation({
    mutationFn: async (params: { code: string; volunteer_id: string }) => {
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: {
          action: 'callback',
          code: params.code,
          volunteer_id: params.volunteer_id,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-connection'] });
      queryClient.invalidateQueries({ queryKey: ['google-calendar-connections'] });
      toast({
        title: 'Google Calendar conectado',
        description: 'O calendário foi conectado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error handling OAuth callback:', error);
      toast({
        title: 'Erro na conexão',
        description: error instanceof Error ? error.message : 'Não foi possível concluir a conexão.',
        variant: 'destructive',
      });
    },
  });

  // Disconnect calendar
  const disconnect = useMutation({
    mutationFn: async (params: { volunteer_id: string }) => {
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: {
          action: 'disconnect',
          volunteer_id: params.volunteer_id,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-connection'] });
      queryClient.invalidateQueries({ queryKey: ['google-calendar-connections'] });
      toast({
        title: 'Calendário desconectado',
        description: 'O Google Calendar foi desconectado.',
      });
    },
    onError: (error) => {
      console.error('Error disconnecting calendar:', error);
      toast({
        title: 'Erro ao desconectar',
        description: error instanceof Error ? error.message : 'Não foi possível desconectar o calendário.',
        variant: 'destructive',
      });
    },
  });

  // Check availability for multiple volunteers
  const checkAvailability = useMutation({
    mutationFn: async (request: AvailabilityRequest) => {
      const { data, error } = await supabase.functions.invoke('google-calendar-availability', {
        body: request,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data as { availability: CalendarAvailability[] };
    },
    onError: (error) => {
      console.error('Error checking availability:', error);
      toast({
        title: 'Erro ao verificar disponibilidade',
        description: error instanceof Error ? error.message : 'Não foi possível verificar a disponibilidade.',
        variant: 'destructive',
      });
    },
  });

  // Refresh token manually
  const refreshToken = useMutation({
    mutationFn: async (params: { volunteer_id: string }) => {
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: {
          action: 'refresh',
          volunteer_id: params.volunteer_id,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-connection'] });
    },
    onError: (error) => {
      console.error('Error refreshing token:', error);
    },
  });

  return {
    connectionStatus,
    listConnections,
    initiateAuth,
    handleCallback,
    disconnect,
    checkAvailability,
    refreshToken,
    userId,
    isConnected: !!connectionStatus.data && connectionStatus.data.is_active,
  };
}
