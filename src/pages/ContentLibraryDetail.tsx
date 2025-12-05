import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ContentLibraryItem } from "@/hooks/useContentLibrary";
import { UnifiedContentModal } from "@/components/UnifiedContentModal";
import { Loader2 } from "lucide-react";

// Validar se é um UUID válido
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export default function ContentLibraryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentLibraryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validar ID: deve existir e ser um UUID válido
    if (!id || id === 'undefined' || id === 'null' || !isValidUUID(id)) {
      console.warn('Invalid content ID, redirecting to biblioteca:', id);
      navigate("/biblioteca", { replace: true });
      return;
    }

    loadContent();
  }, [id, navigate]);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from("content_library")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Error loading content:", error);
        navigate("/biblioteca");
        return;
      }

      setContent(data as ContentLibraryItem);
    } catch (error) {
      console.error("Error loading content:", error);
      navigate("/biblioteca");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/biblioteca");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <UnifiedContentModal
      content={content}
      open={!!content}
      onClose={handleClose}
    />
  );
}
