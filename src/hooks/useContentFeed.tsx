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

      // Buscar apenas de content_library (tabela unificada)
      const { data: libraryContent, error: libraryError } = await supabase
        .from("content_library")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      console.log('🔍 Content Library Query Result:', {
        count: libraryContent?.length || 0,
        error: libraryError,
        sample: libraryContent?.[0] ? {
          id: libraryContent[0].id,
          source_type: libraryContent[0].source_type,
          content_type: libraryContent[0].content_type,
        } : null
      });

      if (libraryError) {
        console.error('❌ Error fetching content_library:', libraryError);
        throw libraryError;
      }

      const normalized: NormalizedContent[] = [];

      // Helper function to get friendly title based on content format
      const getFriendlyTitle = (data: any, contentType: string): string => {
        switch(contentType) {
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

      // Normalizar conteúdos da biblioteca unificada
      libraryContent?.forEach((item) => {
        let contentData = item.content as any;
        const contentType = item.content_type || "post";
        
        console.log('📦 Normalizando item:', {
          id: item.id,
          content_type: item.content_type,
          source_type: item.source_type,
          hasContent: !!contentData
        });
        
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
        
        switch(contentType) {
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
        
        // Determinar source baseado no source_type
        const source: ContentSource = item.source_type === 'audio-pack' ? 'week-pack' : 'ai-creator';
        
        normalized.push({
          id: item.id,
          source: source,
          format: contentType as ContentFormat,
          pilar: (item.pilar || "EDIFICAR") as ContentPilar,
          title: getFriendlyTitle(contentData, contentType),
          verse: firstVerse,
          preview: preview || JSON.stringify(contentData).substring(0, 100) + "..." || "Sem preview disponível",
          hashtags: hashtags,
          createdAt: new Date(item.created_at || Date.now()),
          rawData: contentData,
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
      // Deletar de content_library (tabela unificada)
      const { error } = await supabase
        .from("content_library")
        .delete()
        .eq("id", id);
      
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
