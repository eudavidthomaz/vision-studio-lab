import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ChurchSiteConfig,
  ChurchSiteRow,
  ChurchSiteMinistry,
  ChurchSiteEvent,
  transformRowToConfig,
  transformConfigToRow,
  DEFAULT_BRANDING,
  DEFAULT_CONTACT,
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_HERO,
  DEFAULT_ABOUT,
  DEFAULT_MEDIA,
  DEFAULT_GIVING,
  DEFAULT_SECTIONS_VISIBILITY,
  DEFAULT_THEME_CONFIG,
  DEFAULT_SEO,
  DEFAULT_SECTION_TITLES,
  generateSlugFromName,
} from '@/types/churchSite';
import type { Json } from '@/integrations/supabase/types';

// ---------------------
// Query Keys
// ---------------------

export const churchSiteKeys = {
  all: ['church-sites'] as const,
  byUser: (userId: string) => [...churchSiteKeys.all, 'user', userId] as const,
  bySlug: (slug: string) => [...churchSiteKeys.all, 'slug', slug] as const,
  byId: (id: string) => [...churchSiteKeys.all, 'id', id] as const,
};

// ---------------------
// Type Helpers for JSONB
// ---------------------

function toJson<T>(value: T): Json {
  return value as unknown as Json;
}

// ---------------------
// Fetch Functions
// ---------------------

async function fetchUserSite(userId: string): Promise<ChurchSiteConfig | null> {
  const { data: siteData, error: siteError } = await supabase
    .from('church_sites')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (siteError) throw siteError;
  if (!siteData) return null;

  const { data: ministriesData } = await supabase
    .from('church_site_ministries')
    .select('*')
    .eq('site_id', siteData.id)
    .order('sort_order');

  const { data: eventsData } = await supabase
    .from('church_site_events')
    .select('*')
    .eq('site_id', siteData.id)
    .order('event_date');

  const ministries: ChurchSiteMinistry[] = (ministriesData || []).map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description || [],
    icon: m.icon || 'Heart',
    sortOrder: m.sort_order || 0,
  }));

  const events: ChurchSiteEvent[] = (eventsData || []).map((e) => ({
    id: e.id,
    title: e.title,
    date: e.event_date,
    time: e.event_time,
    tag: e.tag,
    sortOrder: e.sort_order || 0,
  }));

  return transformRowToConfig(siteData as unknown as ChurchSiteRow, ministries, events);
}

async function fetchSiteBySlug(slug: string): Promise<ChurchSiteConfig | null> {
  const { data: siteData, error: siteError } = await supabase
    .from('church_sites')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (siteError) throw siteError;
  if (!siteData) return null;

  const { data: ministriesData } = await supabase
    .from('church_site_ministries')
    .select('*')
    .eq('site_id', siteData.id)
    .order('sort_order');

  const { data: eventsData } = await supabase
    .from('church_site_events')
    .select('*')
    .eq('site_id', siteData.id)
    .order('event_date');

  const ministries: ChurchSiteMinistry[] = (ministriesData || []).map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description || [],
    icon: m.icon || 'Heart',
    sortOrder: m.sort_order || 0,
  }));

  const events: ChurchSiteEvent[] = (eventsData || []).map((e) => ({
    id: e.id,
    title: e.title,
    date: e.event_date,
    time: e.event_time,
    tag: e.tag,
    sortOrder: e.sort_order || 0,
  }));

  return transformRowToConfig(siteData as unknown as ChurchSiteRow, ministries, events);
}

// ---------------------
// Main Hook
// ---------------------

export function useChurchSite() {
  const queryClient = useQueryClient();

  const {
    data: site,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: churchSiteKeys.all,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      return fetchUserSite(user.id);
    },
  });

  // Create site
  const createSite = useMutation({
    mutationFn: async (churchName: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const slug = generateSlugFromName(churchName);

      const { data, error } = await supabase
        .from('church_sites')
        .insert({
          user_id: user.id,
          slug,
          branding: toJson({ ...DEFAULT_BRANDING, name: churchName }),
          contact: toJson(DEFAULT_CONTACT),
          social_links: toJson(DEFAULT_SOCIAL_LINKS),
          hero: toJson({ ...DEFAULT_HERO, title: `Bem-vindo à ${churchName}` }),
          about: toJson(DEFAULT_ABOUT),
          schedule: toJson([]),
          faq: toJson([]),
          media: toJson(DEFAULT_MEDIA),
          giving: toJson(DEFAULT_GIVING),
          sections_visibility: toJson(DEFAULT_SECTIONS_VISIBILITY),
          theme_config: toJson(DEFAULT_THEME_CONFIG),
          seo: toJson({ ...DEFAULT_SEO, title: churchName }),
          section_titles: toJson(DEFAULT_SECTION_TITLES),
        })
        .select()
        .single();

      if (error) {
        if (error.message.includes('duplicate key') || error.message.includes('unique')) {
          throw new Error('Já existe um site com esse nome. Tente outro.');
        }
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: churchSiteKeys.all });
      toast.success('Site criado com sucesso!');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao criar site');
    },
  });

  // Update site — no invalidateQueries (editor manages local state)
  const updateSite = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ChurchSiteConfig> }) => {
      const rowUpdates = transformConfigToRow(updates);
      
      const supabaseUpdates: Record<string, Json | boolean | string> = {};
      for (const [key, value] of Object.entries(rowUpdates)) {
        if (typeof value === 'boolean' || typeof value === 'string') {
          supabaseUpdates[key] = value;
        } else {
          supabaseUpdates[key] = toJson(value);
        }
      }

      const { error } = await supabase
        .from('church_sites')
        .update(supabaseUpdates)
        .eq('id', id);

      if (error) throw error;
    },
    onError: (error) => {
      toast.error('Erro ao salvar alterações');
      console.error('Update error:', error);
    },
  });

  // Publish/Unpublish site
  const togglePublish = useMutation({
    mutationFn: async ({ id, publish }: { id: string; publish: boolean }) => {
      const { error } = await supabase
        .from('church_sites')
        .update({ is_published: publish })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { publish }) => {
      queryClient.invalidateQueries({ queryKey: churchSiteKeys.all });
      toast.success(publish ? 'Site publicado!' : 'Site despublicado');
    },
    onError: () => {
      toast.error('Erro ao alterar status de publicação');
    },
  });

  // Update slug
  const updateSlug = useMutation({
    mutationFn: async ({ id, slug }: { id: string; slug: string }) => {
      const { error } = await supabase
        .from('church_sites')
        .update({ slug })
        .eq('id', id);

      if (error) {
        if (error.message.includes('reserved')) {
          throw new Error('Este slug é reservado e não pode ser usado');
        }
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          throw new Error('Este slug já está em uso');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: churchSiteKeys.all });
      toast.success('URL atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar URL');
    },
  });

  // Delete site
  const deleteSite = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('church_site_ministries').delete().eq('site_id', id);
      await supabase.from('church_site_events').delete().eq('site_id', id);
      const { error } = await supabase.from('church_sites').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: churchSiteKeys.all });
      toast.success('Site excluído');
    },
    onError: () => {
      toast.error('Erro ao excluir site');
    },
  });

  // ---------------------
  // Ministries CRUD — return data, no invalidateQueries
  // ---------------------

  const addMinistry = useMutation({
    mutationFn: async ({ siteId, ministry }: { siteId: string; ministry: Omit<ChurchSiteMinistry, 'id'> }) => {
      const { data, error } = await supabase
        .from('church_site_ministries')
        .insert({
          site_id: siteId,
          title: ministry.title,
          description: ministry.description,
          icon: ministry.icon,
          sort_order: ministry.sortOrder || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });

  const updateMinistry = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ChurchSiteMinistry> }) => {
      const payload: Record<string, unknown> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.icon !== undefined) payload.icon = updates.icon;
      if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;

      const { data, error } = await supabase
        .from('church_site_ministries')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });

  const deleteMinistry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('church_site_ministries').delete().eq('id', id);
      if (error) throw error;
    },
  });

  // ---------------------
  // Events CRUD — return data, no invalidateQueries
  // ---------------------

  const addEvent = useMutation({
    mutationFn: async ({ siteId, event }: { siteId: string; event: Omit<ChurchSiteEvent, 'id'> }) => {
      const { data, error } = await supabase
        .from('church_site_events')
        .insert({
          site_id: siteId,
          title: event.title,
          event_date: event.date,
          event_time: event.time,
          tag: event.tag,
          sort_order: event.sortOrder || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ChurchSiteEvent> }) => {
      const payload: Record<string, unknown> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.date !== undefined) payload.event_date = updates.date;
      if (updates.time !== undefined) payload.event_time = updates.time;
      if (updates.tag !== undefined) payload.tag = updates.tag;
      if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;

      const { data, error } = await supabase
        .from('church_site_events')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('church_site_events').delete().eq('id', id);
      if (error) throw error;
    },
  });

  return {
    site,
    isLoading,
    error,
    refetch,
    createSite,
    updateSite,
    togglePublish,
    updateSlug,
    deleteSite,
    addMinistry,
    updateMinistry,
    deleteMinistry,
    addEvent,
    updateEvent,
    deleteEvent,
  };
}

// ---------------------
// Public Site Hook (for /igreja/:slug)
// ---------------------

export function usePublicChurchSite(slug: string) {
  return useQuery({
    queryKey: churchSiteKeys.bySlug(slug),
    queryFn: () => fetchSiteBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
