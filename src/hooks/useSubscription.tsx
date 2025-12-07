import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface SubscriptionStatus {
  subscribed: boolean;
  role: string;
  product_id: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const queryClient = useQueryClient();

  const { data: subscription, isLoading, refetch } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async (): Promise<SubscriptionStatus> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { subscribed: false, role: 'free', product_id: null, subscription_end: null };
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        return { subscribed: false, role: 'free', product_id: null, subscription_end: null };
      }

      return data as SubscriptionStatus;
    },
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
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
      // SECURITY FIX: Clear all cached auth data on logout to prevent role leakage
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
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

  return {
    subscription,
    isLoading,
    isSubscribed: subscription?.subscribed ?? false,
    role: subscription?.role ?? 'free',
    subscriptionEnd: subscription?.subscription_end,
    refetch,
    openCustomerPortal,
    invalidateSubscription,
  };
};
