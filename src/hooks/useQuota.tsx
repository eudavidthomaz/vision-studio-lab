import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UsageQuota {
  id: string;
  user_id: string;
  sermon_packs_generated: number;
  challenges_used: number;
  images_generated: number;
  reset_date: string;
  created_at: string;
  updated_at: string;
}

export interface QuotaLimits {
  sermon_packs: number;
  challenges: number;
  images: number;
}

// Limites padrão por role
const ROLE_LIMITS: Record<string, QuotaLimits> = {
  free: {
    sermon_packs: 2,
    challenges: 5,
    images: 10,
  },
  pro: {
    sermon_packs: 10,
    challenges: 30,
    images: 50,
  },
  team: {
    sermon_packs: 50,
    challenges: 100,
    images: 200,
  },
  admin: {
    sermon_packs: 999,
    challenges: 999,
    images: 999,
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

      if (error) throw error;
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

      if (error) throw error;
      return data as UsageQuota;
    },
  });

  const limits = ROLE_LIMITS[userRole || 'free'];

  // Verificar se pode usar uma feature
  const canUse = (feature: 'sermon_packs' | 'challenges' | 'images'): boolean => {
    if (!quota || !limits) return false;

    const usage = {
      sermon_packs: quota.sermon_packs_generated,
      challenges: quota.challenges_used,
      images: quota.images_generated,
    };

    return usage[feature] < limits[feature];
  };

  // Incrementar uso
  const incrementUsage = useMutation({
    mutationFn: async (feature: 'sermon_packs' | 'challenges' | 'images') => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const field = {
        sermon_packs: 'sermon_packs_generated',
        challenges: 'challenges_used',
        images: 'images_generated',
      }[feature];

      const currentValue = feature === 'sermon_packs' 
        ? quota?.sermon_packs_generated || 0
        : feature === 'challenges'
        ? quota?.challenges_used || 0
        : quota?.images_generated || 0;

      const { error } = await supabase
        .from('usage_quotas')
        .update({ [field]: currentValue + 1 })
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
  const getUsagePercentage = (feature: 'sermon_packs' | 'challenges' | 'images'): number => {
    if (!quota || !limits) return 0;

    const usage = {
      sermon_packs: quota.sermon_packs_generated,
      challenges: quota.challenges_used,
      images: quota.images_generated,
    }[feature];

    return (usage / limits[feature]) * 100;
  };

  // Verificar se está próximo do limite (>80%)
  const isNearLimit = (feature: 'sermon_packs' | 'challenges' | 'images'): boolean => {
    return getUsagePercentage(feature) > 80;
  };

  // Dias até reset
  const daysUntilReset = quota
    ? Math.ceil((new Date(quota.reset_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    quota,
    limits,
    userRole,
    isLoading,
    canUse,
    incrementUsage: incrementUsage.mutate,
    getUsagePercentage,
    isNearLimit,
    daysUntilReset,
  };
};
