import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ContentLibraryItem } from "@/hooks/useContentLibrary";
import { UnifiedContentModal } from "@/components/UnifiedContentModal";
import { Loader2 } from "lucide-react";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function ContentLibraryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentLibraryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || id === "undefined" || id === "null" || !UUID_REGEX.test(id)) {
      navigate("/biblioteca", { replace: true });
      return;
    }

    setLoading(true);
    setError(null);

    supabase
      .from("content_library")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError("Erro ao carregar conteúdo");
          setLoading(false);
          return;
        }

        if (!data) {
          setError("Conteúdo não encontrado");
          setLoading(false);
          return;
        }

        setContent(data as ContentLibraryItem);
        setLoading(false);
      });
  }, [id, navigate]);

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

  return (
    <UnifiedContentModal
      content={content}
      open={true}
      onClose={() => navigate("/biblioteca")}
    />
  );
}
