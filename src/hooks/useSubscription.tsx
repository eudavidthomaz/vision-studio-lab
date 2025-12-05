import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface SubscriptionStatus {
  subscribed: boolean;
  role: string;
  product_id: string | null;
  subscription_end: string | null;
}

const DEFAULT_SUBSCRIPTION: SubscriptionStatus = {
  subscribed: false,
  role: 'free',
  product_id: null,
  subscription_end: null,
};

export const useSubscription = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: subscription, isLoading, refetch } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async (): Promise<SubscriptionStatus> => {
      try {
        setError(null);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          return DEFAULT_SUBSCRIPTION;
        }

        const { data, error: fnError } = await supabase.functions.invoke('check-subscription');
        
        if (fnError) {
          console.error('Error checking subscription:', fnError);
          // Não propagar erro, retornar default
          setError('Não foi possível verificar assinatura');
          return DEFAULT_SUBSCRIPTION;
        }

        if (!data) {
          return DEFAULT_SUBSCRIPTION;
        }

        return data as SubscriptionStatus;
      } catch (err) {
        console.error('Subscription check failed:', err);
        setError('Erro ao verificar assinatura');
        return DEFAULT_SUBSCRIPTION;
      }
    },
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
    retry: 1, // Retry once on failure
    retryDelay: 1000,
  });

  // Refresh subscription status periodically and on auth changes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 60 * 1000); // Every minute

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setTimeout(() => refetch(), 500);
      }
      if (event === 'SIGNED_OUT') {
        queryClient.setQueryData(['subscription-status'], DEFAULT_SUBSCRIPTION);
      }
    });

    return () => {
      clearInterval(interval);
      authSub.unsubscribe();
    };
  }, [refetch, queryClient]);

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  };

  const invalidateSubscription = () => {
    queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
    queryClient.invalidateQueries({ queryKey: ['user-role'] });
    queryClient.invalidateQueries({ queryKey: ['usage-quota'] });
  };

  // Sempre retornar valores seguros
  const safeSubscription = subscription ?? DEFAULT_SUBSCRIPTION;

  return {
    subscription: safeSubscription,
    isLoading,
    error,
    isSubscribed: safeSubscription.subscribed,
    role: safeSubscription.role,
    subscriptionEnd: safeSubscription.subscription_end,
    refetch,
    openCustomerPortal,
    invalidateSubscription,
  };
};
