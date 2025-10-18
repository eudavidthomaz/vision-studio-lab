import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type ContentSource = "ai-creator" | "week-pack";
export type ContentFormat = "carrossel" | "reel" | "post" | "story" | "all";
export type ContentPilar = "ALCANÇAR" | "EDIFICAR" | "ENVIAR" | "EXALTAR" | "all";

export interface NormalizedContent {
  id: string;
  source: ContentSource;
  format: ContentFormat;
  pilar: ContentPilar;
  title: string;
  verse: string;
  preview: string;
  hashtags: string[];
  createdAt: Date;
  rawData: any;
}

export function useContentFeed() {
  const [contents, setContents] = useState<NormalizedContent[]>([]);
  const [filteredContents, setFilteredContents] = useState<NormalizedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState<ContentSource | "all">("all");
  const [formatFilter, setFormatFilter] = useState<ContentFormat>("all");
  const [pilarFilter, setPilarFilter] = useState<ContentPilar>("all");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "title">("recent");

  const loadContents = async () => {
    setLoading(true);
    try {
      // SECURITY: Validate user before any query
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user?.id) {
        throw new Error('Unauthorized');
      }

      // Buscar content_planners (IA)
      const { data: aiContent, error: aiError } = await supabase
        .from("content_planners")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (aiError) throw aiError;

      // SECURITY: Validate all data belongs to user
      if (aiContent?.some(item => item.user_id !== user.id)) {
        await supabase.from('security_audit_log').insert({
          user_id: user.id,
          event_type: 'data_integrity_violation',
          endpoint: 'content_planners',
          success: false,
          error_message: 'Query returned data from other users'
        });
        throw new Error('Data integrity violation detected');
      }

      // Buscar weekly_packs
      const { data: weekPacks, error: packError } = await supabase
        .from("weekly_packs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (packError) throw packError;

      // SECURITY: Validate all data belongs to user
      if (weekPacks?.some(item => item.user_id !== user.id)) {
        await supabase.from('security_audit_log').insert({
          user_id: user.id,
          event_type: 'data_integrity_violation',
          endpoint: 'weekly_packs',
          success: false,
          error_message: 'Query returned data from other users'
        });
        throw new Error('Data integrity violation detected');
      }

      const normalized: NormalizedContent[] = [];

      // Normalizar content_planners (IA)
      aiContent?.forEach((item) => {
        const plannerDataArray = item.content as any[];
        const plannerData = plannerDataArray?.[0];
        
        // Detectar se é conteúdo de IA
        if (plannerData?.tipo === "ai-generated" || plannerData?.prompt_original) {
          const verses = plannerData.fundamento_biblico?.versiculos || [];
          const firstVerse = verses[0] ? `${verses[0].versiculo} - ${verses[0].referencia}` : "";
          
          normalized.push({
            id: `ai-${item.id}`,
            source: "ai-creator",
            format: (plannerData.conteudo?.tipo || "post") as ContentFormat,
            pilar: (plannerData.conteudo?.pilar || "ALCANÇAR") as ContentPilar,
            title: plannerData.prompt_original || "Conteúdo IA",
            verse: firstVerse,
            preview: plannerData.conteudo?.legenda || plannerData.conteudo?.roteiro || "",
            hashtags: plannerData.dica_producao?.hashtags || [],
            createdAt: new Date(item.created_at || Date.now()),
            rawData: plannerData,
          });
        }
      });

      // Normalizar weekly_packs
      weekPacks?.forEach((item) => {
        const packData = item.pack as any;
        
        if (packData) {
          const verse = packData.versiculo_principal || "";
          
          normalized.push({
            id: `pack-${item.id}`,
            source: "week-pack",
            format: "carrossel",
            pilar: "EXALTAR" as ContentPilar,
            title: packData.titulo_principal || "Pack Semanal",
            verse: verse,
            preview: packData.resumo_pregacao || "",
            hashtags: packData.hashtags_sugeridas || [],
            createdAt: new Date(item.created_at || Date.now()),
            rawData: packData,
          });
        }
      });

      setContents(normalized);
      setFilteredContents(normalized);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar conteúdos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSort = () => {
    let filtered = [...contents];

    // Filtro de busca
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(search) ||
          c.verse.toLowerCase().includes(search) ||
          c.preview.toLowerCase().includes(search) ||
          c.hashtags.some((h) => h.toLowerCase().includes(search))
      );
    }

    // Filtro de fonte
    if (sourceFilter !== "all") {
      filtered = filtered.filter((c) => c.source === sourceFilter);
    }

    // Filtro de formato
    if (formatFilter !== "all") {
      filtered = filtered.filter((c) => c.format === formatFilter);
    }

    // Filtro de pilar
    if (pilarFilter !== "all") {
      filtered = filtered.filter((c) => c.pilar === pilarFilter);
    }

    // Ordenação
    filtered.sort((a, b) => {
      if (sortBy === "recent") {
        return b.createdAt.getTime() - a.createdAt.getTime();
      } else if (sortBy === "oldest") {
        return a.createdAt.getTime() - b.createdAt.getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    setFilteredContents(filtered);
  };

  const deleteContent = async (id: string) => {
    try {
      // SECURITY: Validate authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user?.id) {
        throw new Error('Unauthorized');
      }

      const [type, uuid] = id.split("-");
      const table = type === "ai" ? "content_planners" : "weekly_packs";
      
      // SECURITY: Verify ownership BEFORE deleting
      const { data: existing } = await supabase
        .from(table)
        .select("user_id")
        .eq("id", uuid)
        .single();

      if (!existing || existing.user_id !== user.id) {
        // Log unauthorized deletion attempt
        await supabase.from('security_audit_log').insert({
          user_id: user.id,
          event_type: 'unauthorized_delete_attempt',
          endpoint: table,
          success: false,
          metadata: { attempted_id: uuid }
        });
        
        throw new Error('Unauthorized: You do not own this content');
      }

      // Delete with double-check
      if (type === "ai") {
        const { error } = await supabase
          .from("content_planners")
          .delete()
          .eq("id", uuid)
          .eq("user_id", user.id);
        if (error) throw error;
      } else if (type === "pack") {
        const { error } = await supabase
          .from("weekly_packs")
          .delete()
          .eq("id", uuid)
          .eq("user_id", user.id);
        if (error) throw error;
      }

      toast({
        title: "✅ Conteúdo excluído",
        description: "O conteúdo foi removido com sucesso",
      });

      loadContents();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadContents();
  }, []);

  useEffect(() => {
    filterAndSort();
  }, [contents, searchTerm, sourceFilter, formatFilter, pilarFilter, sortBy]);

  return {
    contents: filteredContents,
    loading,
    searchTerm,
    setSearchTerm,
    sourceFilter,
    setSourceFilter,
    formatFilter,
    setFormatFilter,
    pilarFilter,
    setPilarFilter,
    sortBy,
    setSortBy,
    deleteContent,
    refreshContents: loadContents,
  };
}
