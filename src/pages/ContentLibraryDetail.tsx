import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ContentLibraryItem } from "@/hooks/useContentLibrary";
import { UnifiedContentModal } from "@/components/UnifiedContentModal";
import { Loader2 } from "lucide-react";

/**
 * Valida se uma string é um UUID v4 válido
 */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export default function ContentLibraryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentLibraryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validar ID antes de fazer qualquer requisição
    if (!id || id === "undefined" || id === "null" || !isValidUUID(id)) {
      console.warn("[ContentLibraryDetail] ID inválido:", id);
      navigate("/biblioteca", { replace: true });
      return;
    }

    loadContent(id);
  }, [id, navigate]);

  async function loadContent(contentId: string) {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("content_library")
        .select("*")
        .eq("id", contentId)
        .maybeSingle();

      if (fetchError) {
        console.error("[ContentLibraryDetail] Erro ao buscar:", fetchError);
        setError("Erro ao carregar conteúdo");
        return;
      }

      if (!data) {
        console.warn("[ContentLibraryDetail] Conteúdo não encontrado:", contentId);
        setError("Conteúdo não encontrado");
        return;
      }

      setContent(data as ContentLibraryItem);
    } catch (err) {
      console.error("[ContentLibraryDetail] Exceção:", err);
      setError("Erro inesperado ao carregar conteúdo");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    navigate("/biblioteca");
  }

  // Estado de carregamento
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => navigate("/biblioteca")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Voltar para Biblioteca
          </button>
        </div>
      </div>
    );
  }

  // Sem conteúdo (não deveria chegar aqui, mas por segurança)
  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Conteúdo não disponível</p>
          <button
            onClick={() => navigate("/biblioteca")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Voltar para Biblioteca
          </button>
        </div>
      </div>
    );
  }

  // Renderizar modal com conteúdo
  return (
    <UnifiedContentModal
      content={content}
      open={true}
      onClose={handleClose}
    />
  );
}
