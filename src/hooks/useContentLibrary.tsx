import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";

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
  is_favorite?: boolean;
  is_pinned?: boolean;
  pinned_at?: string;
}

export interface ContentFilters {
  search: string;
  type: string;
  source: string;
  pilar: string;
  status: string;
}

const ITEMS_PER_PAGE = 20;

export function useContentLibrary() {
  const [items, setItems] = useState<ContentLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<ContentFilters>({
    search: '',
    type: 'all',
    source: 'all',
    pilar: 'all',
    status: 'all'
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Carregar itens da biblioteca com paginação (pinned primeiro)
  const loadItems = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    try {
      if (!append) setLoading(true);
      
      const from = pageNum * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      const { data, error, count } = await supabase
        .from('content_library')
        .select('*', { count: 'exact' })
        .order('is_pinned', { ascending: false })
        .order('pinned_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const newItems = data || [];
      setItems(prev => append ? [...prev, ...newItems] : newItems);
      setHasMore(newItems.length === ITEMS_PER_PAGE);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading content library:', error);
      toast.error('Erro ao carregar biblioteca');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar próxima página
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadItems(page + 1, true);
    }
  }, [loading, hasMore, page, loadItems]);

  // Criar novo conteúdo
  const createContent = async (prompt: string, options?: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-content', {
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

  // Selection functions
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((ids?: string[]) => {
    const idsToSelect = ids ?? filteredItems.map(item => item.id);
    setSelectedIds(new Set(idsToSelect));
  }, [filteredItems]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Bulk operations
  const bulkDelete = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('content_library')
        .delete()
        .in('id', ids);

      if (error) throw error;

      toast.success(`${ids.length} conteúdos deletados`);
      await loadItems(0, false);
      clearSelection();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast.error('Erro ao deletar conteúdos');
    }
  };

  const bulkUpdateTags = async (ids: string[], tags: string[]) => {
    try {
      for (const id of ids) {
        await supabase
          .from('content_library')
          .update({ tags })
          .eq('id', id);
      }

      toast.success(`Tags atualizadas em ${ids.length} conteúdos`);
      await loadItems(0, false);
    } catch (error) {
      console.error('Error bulk updating tags:', error);
      toast.error('Erro ao atualizar tags');
    }
  };

  const bulkToggleFavorite = async (ids: string[]) => {
    try {
      const itemsToUpdate = items.filter(item => ids.includes(item.id));
      const allFavorited = itemsToUpdate.every(item => item.is_favorite);
      
      for (const id of ids) {
        await supabase
          .from('content_library')
          .update({ is_favorite: !allFavorited })
          .eq('id', id);
      }

      toast.success(`${ids.length} conteúdos ${allFavorited ? 'desfavoritados' : 'favoritados'}`);
      await loadItems(0, false);
    } catch (error) {
      console.error('Error bulk toggling favorite:', error);
      toast.error('Erro ao atualizar favoritos');
    }
  };

  // Duplicate content
  const duplicateContent = async (id: string) => {
    try {
      const original = items.find(item => item.id === id);
      if (!original) throw new Error('Content not found');

      const { id: _, created_at, updated_at, ...contentData } = original;

      const { error } = await supabase
        .from('content_library')
        .insert({
          ...contentData,
          title: `[CÓPIA] ${original.title}`,
          tags: [...(original.tags || []), 'duplicado'],
          is_favorite: false,
          is_pinned: false,
        });

      if (error) throw error;

      toast.success('Conteúdo duplicado!');
      await loadItems(0, false);
    } catch (error) {
      console.error('Error duplicating content:', error);
      toast.error('Erro ao duplicar conteúdo');
    }
  };

  // Export functions
  const exportToPDF = async (ids: string[]) => {
    try {
      const contents = items.filter(item => ids.includes(item.id));
      const doc = new jsPDF();

      contents.forEach((item, index) => {
        if (index > 0) doc.addPage();

        doc.setFontSize(16);
        doc.text(item.title, 20, 20);

        doc.setFontSize(10);
        doc.text(`Tipo: ${item.content_type}`, 20, 30);
        doc.text(`Pilar: ${item.pilar}`, 20, 36);

        doc.setFontSize(12);
        const contentText = JSON.stringify(item.content, null, 2);
        const lines = doc.splitTextToSize(contentText, 170);
        doc.text(lines, 20, 46);
      });

      doc.save(`conteudos-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(`${contents.length} conteúdos exportados para PDF`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  const exportToTXT = (ids: string[]) => {
    try {
      const contents = items.filter(item => ids.includes(item.id));

      contents.forEach(item => {
        const text = `
TÍTULO: ${item.title}
TIPO: ${item.content_type}
PILAR: ${item.pilar}
STATUS: ${item.status}
DATA: ${new Date(item.created_at).toLocaleDateString()}
TAGS: ${item.tags?.join(', ') || 'Nenhuma'}

CONTEÚDO:
${JSON.stringify(item.content, null, 2)}

---
`;

        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      });

      toast.success(`${contents.length} arquivo${contents.length > 1 ? 's' : ''} TXT baixado${contents.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Error exporting to TXT:', error);
      toast.error('Erro ao exportar TXT');
    }
  };

  const exportToJSON = (ids: string[]) => {
    try {
      const contents = items.filter(item => ids.includes(item.id));

      const json = JSON.stringify(contents, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `biblioteca-ideon-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`${contents.length} conteúdos exportados para JSON`);
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      toast.error('Erro ao exportar JSON');
    }
  };

  // Tag management
  const getAllTags = useMemo(() => {
    const tagMap = new Map<string, number>();

    items.forEach(item => {
      item.tags?.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  const renameTag = async (oldTag: string, newTag: string) => {
    try {
      const affectedItems = items.filter(item => item.tags?.includes(oldTag));

      for (const item of affectedItems) {
        const newTags = item.tags?.map(t => t === oldTag ? newTag : t) || [];
        await supabase
          .from('content_library')
          .update({ tags: newTags })
          .eq('id', item.id);
      }

      toast.success(`Tag "${oldTag}" renomeada para "${newTag}" em ${affectedItems.length} conteúdos`);
      await loadItems(0, false);
    } catch (error) {
      console.error('Error renaming tag:', error);
      toast.error('Erro ao renomear tag');
    }
  };

  const deleteTag = async (tag: string) => {
    try {
      const affectedItems = items.filter(item => item.tags?.includes(tag));

      for (const item of affectedItems) {
        const newTags = item.tags?.filter(t => t !== tag) || [];
        await supabase
          .from('content_library')
          .update({ tags: newTags })
          .eq('id', item.id);
      }

      toast.success(`Tag "${tag}" removida de ${affectedItems.length} conteúdos`);
      await loadItems(0, false);
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('Erro ao deletar tag');
    }
  };

  // Toggle pin (max 3)
  const togglePin = async (id: string) => {
    try {
      const item = items.find(i => i.id === id);
      if (!item) return;

      if (!item.is_pinned) {
        const pinnedCount = items.filter(i => i.is_pinned).length;
        if (pinnedCount >= 3) {
          toast.error('Máximo de 3 conteúdos fixados atingido');
          return;
        }
      }

      await supabase
        .from('content_library')
        .update({
          is_pinned: !item.is_pinned,
          pinned_at: !item.is_pinned ? new Date().toISOString() : null,
        })
        .eq('id', id);

      toast.success(item.is_pinned ? 'Conteúdo desafixado' : 'Conteúdo fixado');
      await loadItems(0, false);
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error('Erro ao fixar/desafixar conteúdo');
    }
  };

  // Carregar ao montar e resetar quando filtros mudarem
  useEffect(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    loadItems(0, false);
  }, [filters, loadItems]);

  return {
    items: filteredItems,
    allItems: items,
    loading,
    hasMore,
    filters,
    setFilters,
    createContent,
    updateContent,
    deleteContent,
    loadMore,
    refresh: () => loadItems(0, false),
    // Selection
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    selectedCount: selectedIds.size,
    // Bulk operations
    bulkDelete,
    bulkUpdateTags,
    bulkToggleFavorite,
    duplicateContent,
    // Export
    exportToPDF,
    exportToTXT,
    exportToJSON,
    // Tag management
    getAllTags,
    renameTag,
    deleteTag,
    // Pin
    togglePin,
  };
}
