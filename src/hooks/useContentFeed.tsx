import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type ContentSource = "ai-creator" | "week-pack";
export type ContentFormat = 
  | "carrossel" 
  | "reel" 
  | "post" 
  | "story" 
  | "devocional"
  | "estudo"
  | "resumo"
  | "desafio_semanal"
  | "calendario"
  | "convite"
  | "aviso"
  | "guia"
  | "convite_grupos"
  | "versiculos_citados"
  | "esboco"
  | "trilha_oracao"
  | "qa_estruturado"
  | "discipulado"
  | "ideia_estrategica"
  | "foto_post"
  | "roteiro_video"
  | "all";
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

      // Buscar generated_contents (conteúdo gerado por IA)
      const { data: generatedContent, error: generatedError } = await supabase
        .from("generated_contents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      console.log('🔍 Generated Content Query Result:', {
        count: generatedContent?.length || 0,
        error: generatedError,
        sample: generatedContent?.[0] ? {
          id: generatedContent[0].id,
          source_type: generatedContent[0].source_type,
          content_format: generatedContent[0].content_format,
        } : null
      });

      if (generatedError) {
        console.error('❌ Error fetching generated_contents:', generatedError);
        throw generatedError;
      }

      // Buscar content_planners (conteúdo legado que ainda pode existir)
      const { data: aiContent, error: aiError } = await supabase
        .from("content_planners")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (aiError) throw aiError;

      const normalized: NormalizedContent[] = [];

      // Helper function to get friendly title based on content format
      const getFriendlyTitle = (data: any, contentFormat: string): string => {
        switch(contentFormat) {
          case 'devocional':
            return data.devocional?.titulo || "Devocional Diário";
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
            return data.qa?.tema || "Perguntas e Respostas";
          case 'discipulado':
            return "Plano de Discipulado";
          case 'foto_post':
            return "Ideia de Foto/Post";
          case 'roteiro_video':
            return "Roteiro de Vídeo";
          default:
            // For posts/reels/carousels, use first words of content
            const preview = data.conteudo?.legenda || data.conteudo?.roteiro || "";
            const firstLine = preview.split('\n')[0] || "";
            return firstLine.substring(0, 50) + (firstLine.length > 50 ? '...' : '') || "Conteúdo IA";
        }
      };

      // Normalizar generated_contents (NOVO - tabela correta)
      generatedContent?.forEach((item) => {
        let contentData = item.content as any;
        const contentFormat = item.content_format || "post";
        
        console.log('📦 Normalizando item:', {
          id: item.id,
          content_format: item.content_format,
          source_type: item.source_type,
          hasContent: !!contentData
        });
        
        // CORREÇÃO: Se for array (formato legado de posts), extrair primeiro item
        if (Array.isArray(contentData)) {
          contentData = contentData[0] || {};
        }
        
        // Se content está vazio, pular
        if (!contentData || Object.keys(contentData).length === 0) {
          console.warn('⚠️ Conteúdo vazio para item:', item.id);
          return;
        }
        
        // Buscar fundamento bíblico
        const verses = contentData.fundamento_biblico?.versiculos || [];
        const firstVerse = verses[0] || "";
        
        // Buscar preview específico do formato
        let preview = "";
        let hashtags: string[] = [];
        
        switch(contentFormat) {
          case 'devocional':
            preview = contentData.devocional?.reflexao?.substring(0, 150) || "";
            break;
          case 'estudo':
            preview = contentData.estudo_biblico?.introducao?.substring(0, 150) || "";
            break;
          case 'resumo':
            preview = contentData.resumo?.texto?.substring(0, 150) || "";
            break;
          case 'desafio_semanal':
            preview = contentData.desafio_semanal?.descricao?.substring(0, 150) || "";
            break;
          case 'esboco':
            preview = contentData.esboco?.introducao?.substring(0, 150) || "";
            break;
          case 'foto_post':
            preview = contentData.conteudo_criativo?.descricao_visual?.substring(0, 150) || "";
            hashtags = contentData.dica_producao?.hashtags || [];
            break;
          case 'roteiro_video':
            preview = contentData.conteudo_criativo?.roteiro?.substring(0, 150) || "";
            hashtags = contentData.dica_producao?.hashtags || [];
            break;
          default:
            preview = contentData.conteudo?.legenda || contentData.conteudo?.roteiro || "";
            hashtags = contentData.dica_producao?.hashtags || [];
        }
        
        normalized.push({
          id: item.id,
          source: "ai-creator",
          format: contentFormat as ContentFormat,
          pilar: (item.pilar || "EDIFICAR") as ContentPilar,
          title: getFriendlyTitle(contentData, contentFormat),
          verse: firstVerse,
          preview: preview || JSON.stringify(contentData).substring(0, 100) + "..." || "Sem preview disponível",
          hashtags: hashtags,
          createdAt: new Date(item.created_at || Date.now()),
          rawData: contentData,
        });
      });

      // Normalizar content_planners (LEGADO - para compatibilidade com dados antigos)
      aiContent?.forEach((item) => {
        const plannerDataArray = item.content as any[];
        const plannerData = plannerDataArray?.[0];
        
        // Detectar se é conteúdo de IA
        if (plannerData?.tipo === "ai-generated" || plannerData?.content_type || plannerData?.prompt_original) {
          const verses = plannerData.fundamento_biblico?.versiculos || [];
          const firstVerse = verses[0] || "";
          const contentFormat = plannerData.conteudo?.tipo || plannerData.content_type || "post";
          
          normalized.push({
            id: `legacy-${item.id}`,
            source: "ai-creator",
            format: contentFormat as ContentFormat,
            pilar: (plannerData.conteudo?.pilar || "ALCANÇAR") as ContentPilar,
            title: getFriendlyTitle(plannerData, contentFormat),
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
      // Se começa com "legacy-", é conteúdo antigo de content_planners
      if (id.startsWith("legacy-")) {
        const uuid = id.replace("legacy-", "");
        const { error } = await supabase
          .from("content_planners")
          .delete()
          .eq("id", uuid);
        if (error) throw error;
      } else {
        // Senão, é de generated_contents
        const { error } = await supabase
          .from("generated_contents")
          .delete()
          .eq("id", id);
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
