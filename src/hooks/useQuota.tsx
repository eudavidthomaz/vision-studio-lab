import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UsageQuota {
  id: string;
  user_id: string;
  images_generated: number;
  transcriptions_used: number;
  live_captures_used: number;
  reset_date: string;
  created_at: string;
  updated_at: string;
}

export interface QuotaLimits {
  images: number;
  transcriptions: number;
  live_captures: number;
}

export type QuotaFeature = 'images' | 'transcriptions' | 'live_captures';

// Limites por role
const ROLE_LIMITS: Record<string, QuotaLimits> = {
  free: {
    images: 10,
    transcriptions: 2,
    live_captures: 0,
  },
  pro: {
    images: 50,
    transcriptions: 5,
    live_captures: 5,
  },
  team: {
    images: 200,
    transcriptions: 20,
    live_captures: 20,
  },
  admin: {
    images: 9999,
    transcriptions: 9999,
    live_captures: 9999,
  },
};

// Preços dos planos (em centavos BRL)
export const PLAN_PRICES = {
  pro: {
    price_id: 'price_1SbVxCL14iBizYHbs3ZKZQzZ',
    product_id: 'prod_TYdDZJuSPTQgsn',
    amount: 2900,
    name: 'Pro',
  },
  team: {
    price_id: 'price_1SbVxOL14iBizYHbf0O5sEdg',
    product_id: 'prod_TYdDnWDdVthKIs',
    amount: 7900,
    name: 'Team',
  },
};

export const useQuota = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar role do usuário
  const { data: userRole } = useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.role || 'free';
    },
  });

  // Buscar quotas do usuário
  const { data: quota, isLoading } = useQuery({
    queryKey: ['usage-quota'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('usage_quotas')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Se não existe, criar quota inicial
      if (!data) {
        const { data: newQuota, error: insertError } = await supabase
          .from('usage_quotas')
          .insert({
            user_id: user.id,
            images_generated: 0,
            transcriptions_used: 0,
            live_captures_used: 0,
            reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newQuota as UsageQuota;
      }
      
      return data as UsageQuota;
    },
  });

  const limits = ROLE_LIMITS[userRole || 'free'];

  // Verificar se pode usar uma feature
  const canUse = (feature: QuotaFeature): boolean => {
    if (!quota || !limits) return false;

    const usage: Record<QuotaFeature, number> = {
      images: quota.images_generated,
      transcriptions: quota.transcriptions_used,
      live_captures: quota.live_captures_used,
    };

    return usage[feature] < limits[feature];
  };

  // Verificar se feature está disponível no plano
  const isFeatureAvailable = (feature: QuotaFeature): boolean => {
    if (!limits) return false;
    return limits[feature] > 0;
  };

  // Incrementar uso
  const incrementUsage = useMutation({
    mutationFn: async (feature: QuotaFeature) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const field: Record<QuotaFeature, string> = {
        images: 'images_generated',
        transcriptions: 'transcriptions_used',
        live_captures: 'live_captures_used',
      };

      const currentValue = feature === 'images' 
        ? quota?.images_generated || 0
        : feature === 'transcriptions'
        ? quota?.transcriptions_used || 0
        : quota?.live_captures_used || 0;

      const { error } = await supabase
        .from('usage_quotas')
        .update({ [field[feature]]: currentValue + 1 })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usage-quota'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar quota',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Calcular percentual de uso
  const getUsagePercentage = (feature: QuotaFeature): number => {
    if (!quota || !limits || limits[feature] === 0) return 0;

    const usage: Record<QuotaFeature, number> = {
      images: quota.images_generated,
      transcriptions: quota.transcriptions_used,
      live_captures: quota.live_captures_used,
    };

    return (usage[feature] / limits[feature]) * 100;
  };

  // Verificar se está próximo do limite (>80%)
  const isNearLimit = (feature: QuotaFeature): boolean => {
    return getUsagePercentage(feature) > 80;
  };

  // Obter uso atual de uma feature
  const getUsage = (feature: QuotaFeature): number => {
    if (!quota) return 0;
    const usage: Record<QuotaFeature, number> = {
      images: quota.images_generated,
      transcriptions: quota.transcriptions_used,
      live_captures: quota.live_captures_used,
    };
    return usage[feature];
  };

  // Obter limite de uma feature
  const getLimit = (feature: QuotaFeature): number => {
    if (!limits) return 0;
    return limits[feature];
  };

  // Dias até reset
  const daysUntilReset = quota
    ? Math.max(0, Math.ceil((new Date(quota.reset_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    quota,
    limits,
    userRole,
    isLoading,
    canUse,
    isFeatureAvailable,
    incrementUsage: incrementUsage.mutate,
    getUsagePercentage,
    isNearLimit,
    getUsage,
    getLimit,
    daysUntilReset,
  };
};
