import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMemo, useEffect, useState } from 'react';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_content_id: string | null;
  related_content_type: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  volunteer_id: string | null;
  schedule_created_email: boolean;
  schedule_created_app: boolean;
  reminder_24h_email: boolean;
  reminder_24h_app: boolean;
  reminder_2h_email: boolean;
  reminder_2h_app: boolean;
  confirmation_request_email: boolean;
  confirmation_request_app: boolean;
  schedule_changed_email: boolean;
  schedule_changed_app: boolean;
}

export interface SendNotificationRequest {
  type: 'schedule_created' | 'reminder_24h' | 'reminder_2h' | 'confirmation_request' | 'schedule_changed' | 'confirmation_received';
  recipient_id: string;
  recipient_email?: string;
  channels: ('app' | 'email')[];
  data: {
    schedule_id?: string;
    service_date?: string;
    service_name?: string;
    role?: string;
    volunteer_name?: string;
    message?: string;
  };
}

export function useNotifications() {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // List notifications
  const list = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!userId,
  });

  // Unread count
  const unreadCount = useMemo(() => {
    return list.data?.filter(n => !n.is_read).length || 0;
  }, [list.data]);

  // Mark as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
    },
  });

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'Notificações lidas',
        description: 'Todas as notificações foram marcadas como lidas.',
      });
    },
    onError: (error) => {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar as notificações como lidas.',
        variant: 'destructive',
      });
    },
  });

  // Send notification (via edge function)
  const sendNotification = useMutation({
    mutationFn: async (request: SendNotificationRequest) => {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: request,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error sending notification:', error);
      toast({
        title: 'Erro ao enviar notificação',
        description: error instanceof Error ? error.message : 'Não foi possível enviar a notificação.',
        variant: 'destructive',
      });
    },
  });

  // Get notification preferences
  const preferences = useQuery({
    queryKey: ['notification-preferences', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as NotificationPreferences | null;
    },
    enabled: !!userId,
  });

  // Update notification preferences
  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      if (!userId) throw new Error('User not authenticated');

      // Upsert preferences
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data as NotificationPreferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({
        title: 'Preferências atualizadas',
        description: 'Suas preferências de notificação foram salvas.',
      });
    },
    onError: (error) => {
      console.error('Error updating notification preferences:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as preferências.',
        variant: 'destructive',
      });
    },
  });

  // Delete notification
  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a notificação.',
        variant: 'destructive',
      });
    },
  });

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Refetch notifications on new insert
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          
          // Show toast for new notification
          const notification = payload.new as Notification;
          toast({
            title: notification.title,
            description: notification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, toast]);

  return {
    list,
    unreadCount,
    markAsRead,
    markAllAsRead,
    sendNotification,
    preferences,
    updatePreferences,
    deleteNotification,
    userId,
  };
}
