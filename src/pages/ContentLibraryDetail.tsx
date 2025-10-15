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
    if (!id) {
      navigate("/biblioteca");
      return;
    }

    const loadContent = async () => {
      try {
        const { data, error } = await supabase.from("content_library").select("*").eq("id", id).single();

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

    loadContent();
  }, [id, navigate]);

  const handleClose = () => {
    navigate("/biblioteca");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center min-w-0 overflow-x-clip">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Carregando" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background min-w-0 overflow-x-clip">
      <UnifiedContentModal content={content} open={true} onClose={handleClose} />
    </div>
  );
}
