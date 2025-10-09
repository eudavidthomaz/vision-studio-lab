import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { secureLog } from '@/lib/logger';
import type { Database } from '@/integrations/supabase/types';

type Notification = Database['public']['Tables']['notifications']['Row'];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Busca notificações com double-check de user_id
   */
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        secureLog.warn('Attempted to fetch notifications without authentication');
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Double-check: filtrar novamente por user_id no cliente
      const validNotifications = (data || []).filter(n => n.user_id === user.id);
      
      if (validNotifications.length !== data?.length) {
        secureLog.security('Notification leak detected', { 
          userId: user.id,
          expected: data?.length,
          actual: validNotifications.length,
        });
      }

      setNotifications(validNotifications);
      setUnreadCount(validNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      secureLog.error('Failed to fetch notifications', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Marca notificação como lida
   */
  const markAsRead = async (notificationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Validar propriedade antes de atualizar
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification || notification.user_id !== user.id) {
        secureLog.security('Unauthorized notification update attempt', { 
          notificationId, 
          userId: user.id 
        });
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      secureLog.error('Failed to mark notification as read', error, { notificationId });
    }
  };

  /**
   * Marca todas como lidas
   */
  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);

      toast({
        title: 'Notificações marcadas como lidas',
      });
    } catch (error) {
      secureLog.error('Failed to mark all as read', error);
    }
  };

  /**
   * Configurar realtime subscription seguro
   */
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            // Double-check de user_id
            if (payload.new.user_id !== user.id) {
              secureLog.security('Realtime notification leak detected', {
                expectedUserId: user.id,
                receivedUserId: payload.new.user_id,
              });
              return;
            }

            const newNotification = payload.new as Notification;
            
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Toast para nova notificação
            toast({
              title: newNotification.title,
              description: newNotification.message,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
    fetchNotifications();
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};
