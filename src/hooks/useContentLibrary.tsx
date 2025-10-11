import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ContentLibraryItem {
  id: string;
  user_id: string;
  title: string;
  content_type: string;
  source_type: string;
  pilar: string;
  status: string;
  content: any;
  tags: string[];
  sermon_id?: string;
  prompt_original?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface ContentFilters {
  search: string;
  type: string;
  source: string;
  pilar: string;
  status: string;
}

export function useContentLibrary() {
  const [items, setItems] = useState<ContentLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ContentFilters>({
    search: '',
    type: 'all',
    source: 'all',
    pilar: 'all',
    status: 'all'
  });

  // Carregar itens da biblioteca
  const loadItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setItems(data || []);
    } catch (error) {
      console.error('Error loading content library:', error);
      toast.error('Erro ao carregar biblioteca');
    } finally {
      setLoading(false);
    }
  };

  // Criar novo conteúdo
  const createContent = async (prompt: string, options?: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('content-engine', {
        body: { prompt, ...options }
      });

      if (error) throw error;

      toast.success('✨ Conteúdo criado com sucesso!');
      await loadItems(); // Refresh
      return data.id;
    } catch (error: any) {
      console.error('Error creating content:', error);
      toast.error(error.message || 'Erro ao criar conteúdo');
      throw error;
    }
  };

  // Atualizar conteúdo
  const updateContent = async (id: string, updates: Partial<ContentLibraryItem>) => {
    try {
      const { error } = await supabase
        .from('content_library')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Conteúdo atualizado');
      await loadItems();
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Erro ao atualizar conteúdo');
      throw error;
    }
  };

  // Deletar conteúdo
  const deleteContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('content_library')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Conteúdo deletado');
      await loadItems();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Erro ao deletar conteúdo');
      throw error;
    }
  };

  // Aplicar filtros
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Filtro de busca
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(searchLower);
        const promptMatch = item.prompt_original?.toLowerCase().includes(searchLower);
        if (!titleMatch && !promptMatch) return false;
      }

      // Filtro de tipo
      if (filters.type !== 'all' && item.content_type !== filters.type) {
        return false;
      }

      // Filtro de fonte
      if (filters.source !== 'all' && item.source_type !== filters.source) {
        return false;
      }

      // Filtro de pilar
      if (filters.pilar !== 'all' && item.pilar !== filters.pilar) {
        return false;
      }

      // Filtro de status
      if (filters.status !== 'all' && item.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [items, filters]);

  // Carregar ao montar
  useEffect(() => {
    loadItems();
  }, []);

  return {
    items: filteredItems,
    allItems: items,
    loading,
    filters,
    setFilters,
    createContent,
    updateContent,
    deleteContent,
    refresh: loadItems
  };
}
