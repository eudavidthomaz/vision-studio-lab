import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionStatus {
  role: 'free' | 'pro' | 'team' | 'admin';
  isPro: boolean;
  weeklyPacksUsed: number;
  weeklyPacksLimit: number;
  canGenerate: boolean;
  loading: boolean;
}

export const useSubscription = (userId: string | undefined) => {
  const [status, setStatus] = useState<SubscriptionStatus>({
    role: 'free',
    isPro: false,
    weeklyPacksUsed: 0,
    weeklyPacksLimit: 1,
    canGenerate: false,
    loading: true,
  });

  useEffect(() => {
    if (!userId) {
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    const loadSubscriptionStatus = async () => {
      try {
        // Buscar role do usuário
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single();

        if (roleError) throw roleError;

        const userRole = roleData?.role || 'free';
        const isPro = userRole === 'pro' || userRole === 'team' || userRole === 'admin';

        // Buscar quotas
        const { data: quotaData, error: quotaError } = await supabase
          .from('usage_quotas')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (quotaError && quotaError.code !== 'PGRST116') throw quotaError;

        const weeklyPacksUsed = quotaData?.weekly_packs_used || 0;
        const resetDate = quotaData?.reset_date ? new Date(quotaData.reset_date) : new Date();
        const today = new Date();

        // Se passou da data de reset, considerar como 0 usado
        const actualUsed = resetDate < today ? 0 : weeklyPacksUsed;
        const limit = isPro ? 999999 : 1;
        const canGenerate = isPro || actualUsed < limit;

        setStatus({
          role: userRole,
          isPro,
          weeklyPacksUsed: actualUsed,
          weeklyPacksLimit: limit,
          canGenerate,
          loading: false,
        });
      } catch (error) {
        console.error('Error loading subscription status:', error);
        setStatus(prev => ({ ...prev, loading: false }));
      }
    };

    loadSubscriptionStatus();

    // Escutar mudanças em tempo real
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadSubscriptionStatus();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'usage_quotas',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadSubscriptionStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return status;
};
