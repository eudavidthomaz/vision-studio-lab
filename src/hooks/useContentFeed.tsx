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

      // Buscar todos os conteúdos gerados
      const { data: contents, error } = await supabase
        .from("generated_contents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // SECURITY: Validate all data belongs to user
      if (contents?.some(item => item.user_id !== user.id)) {
        await supabase.from('security_audit_log').insert({
          user_id: user.id,
          event_type: 'data_integrity_violation',
          endpoint: 'generated_contents',
          success: false,
          error_message: 'Query returned data from other users'
        });
        throw new Error('Data integrity violation detected');
      }

      const normalized: NormalizedContent[] = [];

      // Normalizar conteúdos
      contents?.forEach((item) => {
        const isAudioPack = item.source_type === 'audio-pack';
        const content = item.content as any;
        
        let verse = "";
        let hashtags: string[] = [];
        let preview = "";
        
        if (isAudioPack) {
          verse = content.versiculo_principal || "";
          hashtags = content.hashtags_sugeridas || [];
          preview = content.resumo_pregacao || content.resumo || "";
        } else {
          const verses = content.fundamento_biblico?.versiculos || [];
          verse = verses[0] || "";
          hashtags = content.dica_producao?.hashtags || [];
          preview = content.conteudo?.legenda || content.conteudo?.texto || "";
        }
        
        normalized.push({
          id: item.id,
          source: isAudioPack ? "week-pack" : "ai-creator",
          format: (item.content_format || "post") as ContentFormat,
          pilar: (item.pilar || "ALCANÇAR") as ContentPilar,
          title: isAudioPack ? "Pack Semanal" : (item.prompt_original || "Conteúdo IA"),
          verse,
          preview,
          hashtags,
          createdAt: new Date(item.created_at || Date.now()),
          rawData: content,
        });
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
      
      // SECURITY: Verify ownership BEFORE deleting
      const { data: existing } = await supabase
        .from("generated_contents")
        .select("user_id")
        .eq("id", id)
        .single();

      if (!existing || existing.user_id !== user.id) {
        // Log unauthorized deletion attempt
        await supabase.from('security_audit_log').insert({
          user_id: user.id,
          event_type: 'unauthorized_delete_attempt',
          endpoint: 'generated_contents',
          success: false,
          metadata: { attempted_id: id }
        });
        
        throw new Error('Unauthorized: You do not own this content');
      }

      // Delete with double-check
      const { error } = await supabase
        .from("generated_contents")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      
      if (error) throw error;

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
