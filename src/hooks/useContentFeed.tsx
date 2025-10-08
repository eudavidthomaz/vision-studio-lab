import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type ContentSource = "ai_prompt" | "transcript" | "all";
export type ContentFormat = "carrossel" | "reel" | "post" | "story" | "all";
export type ContentPilar = "ALCANÇAR" | "EDIFICAR" | "PERTENCER" | "SERVIR" | "all";

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar APENAS content_planners (unificado)
      const { data: contents, error } = await supabase
        .from("content_planners")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const normalized: NormalizedContent[] = [];

      // Normalizar todos os conteúdos
      contents?.forEach((item) => {
        const plannerDataArray = item.content as any[];
        const plannerData = plannerDataArray?.[0];
        
        if (!plannerData) return;

        const sourceType = plannerData.source_type || 
                          (plannerData.tipo === "ai-generated" || plannerData.prompt_original ? "ai_prompt" : "transcript");
        
        const verses = plannerData.fundamento_biblico?.versiculos || [];
        const firstVerse = Array.isArray(verses) && verses.length > 0 
          ? (typeof verses[0] === 'string' ? verses[0] : `${verses[0]?.versiculo} - ${verses[0]?.referencia}`)
          : "";

        // Determinar título
        let title = "Conteúdo";
        if (sourceType === "ai_prompt") {
          title = plannerData.prompt_original || "Conteúdo IA";
        } else if (sourceType === "transcript") {
          title = plannerData.conteudo?.resumo_pregacao?.substring(0, 50) + "..." || "Pregação";
        }

        // Determinar preview
        let preview = "";
        if (plannerData.conteudo?.legenda) {
          preview = plannerData.conteudo.legenda;
        } else if (plannerData.conteudo?.resumo_pregacao) {
          preview = plannerData.conteudo.resumo_pregacao.substring(0, 150);
        } else if (plannerData.conteudo?.frases_impactantes?.[0]) {
          preview = plannerData.conteudo.frases_impactantes[0];
        }
          
        normalized.push({
          id: `content-${item.id}`,
          source: sourceType as ContentSource,
          format: (plannerData.conteudo?.tipo || "post") as ContentFormat,
          pilar: (plannerData.conteudo?.pilar || "EDIFICAR") as ContentPilar,
          title,
          verse: firstVerse,
          preview,
          hashtags: plannerData.dica_producao?.hashtags || [],
          createdAt: new Date(item.created_at || Date.now()),
          rawData: plannerData,
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
      const [type, uuid] = id.split("-");
      
      if (type === "content") {
        const { error } = await supabase
          .from("content_planners")
          .delete()
          .eq("id", uuid);
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
