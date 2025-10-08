import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  id: string;
  full_name: string | null;
  phone: string | null;
  church: string | null;
  city: string | null;
  instagram: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileUpdate {
  full_name?: string;
  phone?: string;
  church?: string;
  city?: string;
  instagram?: string;
}

export const useProfile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar perfil do usuário logado
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      // RLS garante que só retorna dados do próprio usuário
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data as ProfileData;
    },
  });

  // Atualizar perfil
  const updateProfile = useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      // Validar Instagram (deve começar com @)
      if (updates.instagram && !updates.instagram.startsWith('@')) {
        updates.instagram = `@${updates.instagram}`;
      }
      
      // RLS impede atualização de outros perfis
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({ 
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Gerar iniciais para avatar
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return { 
    profile, 
    isLoading, 
    error,
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.isPending,
    getInitials 
  };
};
