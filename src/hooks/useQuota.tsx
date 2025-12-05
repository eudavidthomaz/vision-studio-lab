import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

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

// Valores default seguros
const DEFAULT_QUOTA: UsageQuota = {
  id: '',
  user_id: '',
  images_generated: 0,
  transcriptions_used: 0,
  live_captures_used: 0,
  reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEFAULT_LIMITS = ROLE_LIMITS.free;

// Preços dos planos (em centavos BRL)
export const PLAN_PRICES = {
  pro: {
    price_id: 'price_1SarH3LOuknfB6DJBJ7TevZA',
    product_id: 'prod_TXxBwPsl1XySa6',
    amount: 2900,
    name: 'Pro',
  },
  team: {
    price_id: 'price_1SarHILOuknfB6DJfV2aTQ93',
    product_id: 'prod_TXxBXiibNmpi9j',
    amount: 7900,
    name: 'Team',
  },
};

export const useQuota = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Buscar role do usuário
  const { data: userRole, isLoading: isLoadingRole } = useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      try {
        setError(null);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 'free';

        const { data, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (roleError) {
          console.error('Error fetching user role:', roleError);
          return 'free';
        }
        return data?.role || 'free';
      } catch (err) {
        console.error('Role fetch failed:', err);
        return 'free';
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  // Buscar quotas do usuário
  const { data: quota, isLoading: isLoadingQuota } = useQuery({
    queryKey: ['usage-quota'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return DEFAULT_QUOTA;

        const { data, error: quotaError } = await supabase
          .from('usage_quotas')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (quotaError) {
          console.error('Error fetching quota:', quotaError);
          return DEFAULT_QUOTA;
        }
        
        // Se não existe, criar quota inicial
        if (!data) {
          const newQuotaData = {
            user_id: user.id,
            images_generated: 0,
            transcriptions_used: 0,
            live_captures_used: 0,
            reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          };
          
          const { data: newQuota, error: insertError } = await supabase
            .from('usage_quotas')
            .insert(newQuotaData)
            .select()
            .maybeSingle();
          
          if (insertError) {
            console.error('Error creating quota:', insertError);
            return { ...DEFAULT_QUOTA, user_id: user.id };
          }
          return (newQuota as UsageQuota) || { ...DEFAULT_QUOTA, user_id: user.id };
        }
        
        return data as UsageQuota;
      } catch (err) {
        console.error('Quota fetch failed:', err);
        return DEFAULT_QUOTA;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  const isLoading = isLoadingRole || isLoadingQuota;
  const safeQuota = quota ?? DEFAULT_QUOTA;
  const limits = ROLE_LIMITS[userRole || 'free'] ?? DEFAULT_LIMITS;

  // Verificar se pode usar uma feature
  const canUse = (feature: QuotaFeature): boolean => {
    const usage: Record<QuotaFeature, number> = {
      images: safeQuota.images_generated,
      transcriptions: safeQuota.transcriptions_used,
      live_captures: safeQuota.live_captures_used,
    };

    return usage[feature] < limits[feature];
  };

  // Verificar se feature está disponível no plano
  const isFeatureAvailable = (feature: QuotaFeature): boolean => {
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
        ? safeQuota.images_generated
        : feature === 'transcriptions'
        ? safeQuota.transcriptions_used
        : safeQuota.live_captures_used;

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
    if (limits[feature] === 0) return 0;

    const usage: Record<QuotaFeature, number> = {
      images: safeQuota.images_generated,
      transcriptions: safeQuota.transcriptions_used,
      live_captures: safeQuota.live_captures_used,
    };

    return (usage[feature] / limits[feature]) * 100;
  };

  // Verificar se está próximo do limite (>80%)
  const isNearLimit = (feature: QuotaFeature): boolean => {
    return getUsagePercentage(feature) > 80;
  };

  // Obter uso atual de uma feature
  const getUsage = (feature: QuotaFeature): number => {
    const usage: Record<QuotaFeature, number> = {
      images: safeQuota.images_generated,
      transcriptions: safeQuota.transcriptions_used,
      live_captures: safeQuota.live_captures_used,
    };
    return usage[feature];
  };

  // Obter limite de uma feature
  const getLimit = (feature: QuotaFeature): number => {
    return limits[feature];
  };

  // Dias até reset
  const daysUntilReset = safeQuota.reset_date
    ? Math.max(0, Math.ceil((new Date(safeQuota.reset_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 30;

  return {
    quota: safeQuota,
    limits,
    userRole: userRole ?? 'free',
    isLoading,
    error,
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
