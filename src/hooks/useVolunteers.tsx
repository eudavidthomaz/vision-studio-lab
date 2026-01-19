import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Volunteer {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  ministry: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type VolunteerInsert = Omit<Volunteer, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type VolunteerUpdate = Partial<VolunteerInsert> & { id: string };

export const VOLUNTEER_ROLES = [
  { value: 'camera', label: 'Câmera' },
  { value: 'som', label: 'Som/Áudio' },
  { value: 'projecao', label: 'Projeção' },
  { value: 'fotografia', label: 'Fotografia' },
  { value: 'midia_social', label: 'Mídia Social' },
  { value: 'recepcao', label: 'Recepção' },
  { value: 'louvor', label: 'Louvor' },
  { value: 'geral', label: 'Geral' },
] as const;

export function useVolunteers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // List all volunteers
  const list = useQuery({
    queryKey: ['volunteers'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('volunteers')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Volunteer[];
    },
  });

  // List only active volunteers
  const listActive = useQuery({
    queryKey: ['volunteers', 'active'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('volunteers')
        .select('*')
        .eq('user_id', session.session.user.id)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Volunteer[];
    },
  });

  // Create volunteer
  const create = useMutation({
    mutationFn: async (volunteer: VolunteerInsert) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('volunteers')
        .insert({
          ...volunteer,
          user_id: session.session.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Volunteer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      toast({
        title: 'Voluntário cadastrado',
        description: 'O voluntário foi adicionado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error creating volunteer:', error);
      toast({
        title: 'Erro ao cadastrar',
        description: 'Não foi possível cadastrar o voluntário.',
        variant: 'destructive',
      });
    },
  });

  // Update volunteer
  const update = useMutation({
    mutationFn: async ({ id, ...updates }: VolunteerUpdate) => {
      const { data, error } = await supabase
        .from('volunteers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Volunteer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      toast({
        title: 'Voluntário atualizado',
        description: 'As informações foram atualizadas com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error updating volunteer:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o voluntário.',
        variant: 'destructive',
      });
    },
  });

  // Toggle active status
  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('volunteers')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Volunteer;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      toast({
        title: data.is_active ? 'Voluntário ativado' : 'Voluntário desativado',
        description: data.is_active 
          ? 'O voluntário agora pode ser escalado.'
          : 'O voluntário não será mais escalado.',
      });
    },
    onError: (error) => {
      console.error('Error toggling volunteer status:', error);
      toast({
        title: 'Erro ao alterar status',
        description: 'Não foi possível alterar o status do voluntário.',
        variant: 'destructive',
      });
    },
  });

  // Delete volunteer
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('volunteers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      toast({
        title: 'Voluntário removido',
        description: 'O voluntário foi removido com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting volunteer:', error);
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover o voluntário.',
        variant: 'destructive',
      });
    },
  });

  return {
    list,
    listActive,
    create,
    update,
    toggleActive,
    remove,
  };
}
