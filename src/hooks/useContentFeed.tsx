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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar content_planners (IA)
      const { data: aiContent, error: aiError } = await supabase
        .from("content_planners")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (aiError) throw aiError;


      const normalized: NormalizedContent[] = [];

      // Helper function to get friendly title based on content type
      const getFriendlyTitle = (data: any): string => {
        const contentType = data.content_type;
        
        switch(contentType) {
          case 'estudo':
            return data.estudo_biblico?.tema || "Estudo Bíblico";
          case 'resumo':
            return "Resumo de Pregação";
          case 'desafio_semanal':
            return data.desafio_semanal?.titulo || "Desafio Semanal";
          case 'ideia_estrategica':
            return data.ideia_estrategica?.titulo || "Ideia Estratégica";
          case 'calendario':
            return "Calendário de Conteúdo";
          case 'convite':
            return data.convite?.titulo_evento || "Convite para Evento";
          case 'aviso':
            return data.aviso?.titulo || "Aviso Importante";
          case 'guia':
            return "Guia de Comunhão";
          case 'convite_grupos':
            return "Convite para Grupos";
          case 'versiculos_citados':
            return "Versículos Citados";
          case 'esboco':
            return data.esboco?.titulo || "Esboço de Pregação";
          case 'trilha_oracao':
            return "Trilha de Oração";
          case 'qa_estruturado':
            return "Perguntas e Respostas";
          case 'discipulado':
            return "Plano de Discipulado";
          default:
            // For posts/reels/carousels, use first words of content
            const preview = data.conteudo?.legenda || data.conteudo?.roteiro || "";
            const firstLine = preview.split('\n')[0] || "";
            return firstLine.substring(0, 50) + (firstLine.length > 50 ? '...' : '') || "Conteúdo IA";
        }
      };

      // Normalizar content_planners (IA)
      aiContent?.forEach((item) => {
        const plannerDataArray = item.content as any[];
        const plannerData = plannerDataArray?.[0];
        
        // Detectar se é conteúdo de IA
        if (plannerData?.tipo === "ai-generated" || plannerData?.content_type || plannerData?.prompt_original) {
          const verses = plannerData.fundamento_biblico?.versiculos || [];
          const firstVerse = verses[0] || "";  // versiculos é array de strings
          
          normalized.push({
            id: `ai-${item.id}`,
            source: "ai-creator",
            format: (plannerData.conteudo?.tipo || plannerData.content_type || "post") as ContentFormat,
            pilar: (plannerData.conteudo?.pilar || "ALCANÇAR") as ContentPilar,
            title: getFriendlyTitle(plannerData),
            verse: firstVerse,
            preview: plannerData.conteudo?.legenda || plannerData.conteudo?.roteiro || plannerData.estudo_biblico?.introducao || "",
            hashtags: plannerData.dica_producao?.hashtags || [],
            createdAt: new Date(item.created_at || Date.now()),
            rawData: plannerData,
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
      const [type, uuid] = id.split("-");
      
      if (type === "ai") {
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
