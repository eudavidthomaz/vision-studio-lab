import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { secureLog } from '@/lib/logger';
import type { Database } from '@/integrations/supabase/types';

type SharedContent = Database['public']['Tables']['shared_content']['Row'];

export const useSharedContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Cria compartilhamento público simples
   */
  const createPublicShare = async (
    contentId: string,
    contentType: 'pack' | 'challenge' | 'planner' | 'generated'
  ): Promise<SharedContent | null> => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('shared_content')
        .insert({
          content_id: contentId,
          content_type: contentType,
          user_id: user.id,
          is_public: true,
          requires_approval: false,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Link criado!',
        description: 'Seu conteúdo está pronto para ser compartilhado.',
      });

      return data;
    } catch (error) {
      secureLog.error('Failed to create public share', error, { contentId, contentType });
      toast({
        title: 'Erro ao criar link',
        description: 'Não foi possível criar o link de compartilhamento.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cria compartilhamento com aprovação
   */
  const createApprovalShare = async (
    contentId: string,
    contentType: 'pack' | 'challenge' | 'planner' | 'generated'
  ): Promise<SharedContent | null> => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('shared_content')
        .insert({
          content_id: contentId,
          content_type: contentType,
          user_id: user.id,
          is_public: true,
          requires_approval: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Links criados!',
        description: 'Link público e link de aprovação foram gerados.',
      });

      return data;
    } catch (error) {
      secureLog.error('Failed to create approval share', error, { contentId, contentType });
      toast({
        title: 'Erro ao criar links',
        description: 'Não foi possível criar os links.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Busca conteúdo por token público
   */
  const getSharedContent = async (shareToken: string): Promise<SharedContent | null> => {
    try {
      const { data, error } = await supabase
        .from('shared_content')
        .select('*')
        .eq('share_token', shareToken)
        .eq('is_public', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) throw error;

      // Incrementar contador de visualizações
      await supabase
        .from('shared_content')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', data.id);

      return data;
    } catch (error) {
      secureLog.error('Failed to get shared content', error, { shareToken });
      return null;
    }
  };

  /**
   * Busca conteúdo por token de revisão
   */
  const getReviewContent = async (reviewToken: string): Promise<SharedContent | null> => {
    try {
      const { data, error } = await supabase
        .from('shared_content')
        .select('*')
        .eq('review_token', reviewToken)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      secureLog.error('Failed to get review content', error, { reviewToken });
      return null;
    }
  };

  /**
   * Atualiza status de aprovação (anônimo via review_token)
   */
  const updateApprovalStatus = async (
    reviewToken: string,
    status: 'approved' | 'rejected',
    comment?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('shared_content')
        .update({
          approval_status: status,
          reviewer_comment: comment || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('review_token', reviewToken)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;

      toast({
        title: status === 'approved' ? '✅ Aprovado!' : '❌ Reprovado',
        description: status === 'approved' 
          ? 'Conteúdo aprovado com sucesso. O criador será notificado.'
          : 'Conteúdo reprovado. O criador receberá uma notificação.',
      });

      return true;
    } catch (error) {
      secureLog.error('Failed to update approval status', error, { reviewToken, status });
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Adiciona observação sem mudar status
   */
  const addReviewerComment = async (
    reviewToken: string,
    comment: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('shared_content')
        .update({
          reviewer_comment: comment,
        })
        .eq('review_token', reviewToken)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;

      toast({
        title: '💬 Observação adicionada',
        description: 'O criador receberá uma notificação.',
      });

      return true;
    } catch (error) {
      secureLog.error('Failed to add reviewer comment', error, { reviewToken });
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a observação.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Lista compartilhamentos do usuário
   */
  const listMyShares = async (): Promise<SharedContent[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('shared_content')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      secureLog.error('Failed to list shares', error);
      return [];
    }
  };

  /**
   * Deleta compartilhamento (valida propriedade)
   */
  const deleteShare = async (shareId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validar propriedade antes de deletar
      const { data: share } = await supabase
        .from('shared_content')
        .select('user_id')
        .eq('id', shareId)
        .single();

      if (share?.user_id !== user.id) {
        secureLog.security('Unauthorized delete attempt', { shareId, userId: user.id });
        throw new Error('Unauthorized');
      }

      const { error } = await supabase
        .from('shared_content')
        .delete()
        .eq('id', shareId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Removido',
        description: 'Compartilhamento removido com sucesso.',
      });

      return true;
    } catch (error) {
      secureLog.error('Failed to delete share', error, { shareId });
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o compartilhamento.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createPublicShare,
    createApprovalShare,
    getSharedContent,
    getReviewContent,
    updateApprovalStatus,
    addReviewerComment,
    listMyShares,
    deleteShare,
  };
};
