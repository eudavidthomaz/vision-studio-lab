import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ContentLibraryItem } from "@/hooks/useContentLibrary";
import { UnifiedContentModal } from "@/components/UnifiedContentModal";
import { Loader2 } from "lucide-react";

export default function ContentLibraryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentLibraryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validar se o ID é um UUID válido ou pelo menos não é "undefined"
    if (!id || id === "undefined" || id === "null" || id.length < 10) {
      console.warn("ID inválido detectado:", id);
      navigate("/biblioteca", { replace: true });
      return;
    }

    loadContent();
  }, [id, navigate]);

  const loadContent = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from("content_library")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Error loading content:", error);
        navigate("/biblioteca", { replace: true });
        return;
      }

      setContent(data as ContentLibraryItem);
    } catch (error) {
      console.error("Error loading content:", error);
      navigate("/biblioteca", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/biblioteca", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <UnifiedContentModal
      content={content}
      open={true}
      onClose={handleClose}
    />
  );
}
