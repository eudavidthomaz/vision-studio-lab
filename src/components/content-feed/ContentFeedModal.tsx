import { Dialog, DialogContent } from "@/components/ui/dialog";
import { NormalizedContent } from "@/hooks/useContentFeed";
import { ContentResultDisplay } from "@/components/ContentResultDisplay";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface ContentFeedModalProps {
  content: NormalizedContent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContentFeedModal({ content, open, onOpenChange }: ContentFeedModalProps) {
  const navigate = useNavigate();

  if (!content) return null;

  const handleSave = () => {
    toast({
      title: "✅ Já salvo!",
      description: "Este conteúdo já está salvo na sua biblioteca",
    });
  };

  const handleEdit = () => {
    const [type, uuid] = content.id.split("-");
    onOpenChange(false);
    if (type === "ai") {
      navigate(`/conteudo/${uuid}`);
    }
  };

  // Renderizar conteúdo de IA - normalizar estrutura
  const rawData = content.rawData;
  let formattedContent: any;

  if (rawData.content_type === "estudo") {
    formattedContent = { estudo_biblico: rawData.estudo_biblico, content_type: "estudo" };
  } else if (rawData.content_type === "resumo") {
    formattedContent = { resumo_pregacao: rawData.resumo_pregacao, content_type: "resumo" };
  } else if (rawData.content_type === "desafio_semanal") {
    formattedContent = { desafio_semanal: rawData.desafio_semanal, content_type: "desafio_semanal" };
  } else if (rawData.content_type === "ideia_estrategica") {
    formattedContent = { ideia_estrategica: rawData.ideia_estrategica, content_type: "ideia_estrategica" };
  } else if (rawData.content_type === "calendario") {
    formattedContent = { calendario: rawData.calendario, content_type: "calendario" };
  } else if (rawData.content_type === "convite") {
    formattedContent = { convite: rawData.convite, content_type: "convite" };
  } else if (rawData.content_type === "aviso") {
    formattedContent = { aviso: rawData.aviso, content_type: "aviso" };
  } else if (rawData.content_type === "guia") {
    formattedContent = { guia: rawData.guia, content_type: "guia" };
  } else if (rawData.content_type === "convite_grupos") {
    formattedContent = { convite_grupos: rawData.convite_grupos, content_type: "convite_grupos" };
  } else if (rawData.content_type === "versiculos_citados") {
    formattedContent = { versiculos_citados: rawData.versiculos_citados, content_type: "versiculos_citados" };
  } else if (rawData.content_type === "esboco") {
    formattedContent = { esboco: rawData.esboco, content_type: "esboco" };
  } else if (rawData.content_type === "trilha_oracao") {
    formattedContent = { trilha_oracao: rawData.trilha_oracao, content_type: "trilha_oracao" };
  } else if (rawData.content_type === "qa_estruturado") {
    formattedContent = { qa_estruturado: rawData.qa_estruturado, content_type: "qa_estruturado" };
  } else if (rawData.content_type === "discipulado") {
    formattedContent = { discipulado: rawData.discipulado, content_type: "discipulado" };
  } else {
    // Default format for creative content (posts, reels, carousels)
    formattedContent = {
      fundamento_biblico: rawData.fundamento_biblico,
      conteudo: rawData.conteudo,
      estrutura_visual: rawData.estrutura_visual,
      dica_producao: rawData.dica_producao,
      content_type: rawData.content_type,
    };
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Largura segura e altura limitada à viewport */}
      <DialogContent className="w-[min(92vw,42rem)] max-w-none max-h-[90dvh] overflow-hidden p-0">
        {/* Conteúdo rolável e fluido */}
        <div
          className="
            max-h-[90dvh] overflow-y-auto overflow-x-hidden pb-[env(safe-area-inset-bottom)]
            min-w-0 break-words
            [&_img]:max-w-full [&_img]:h-auto
            [&_video]:max-w-full [&_video]:h-auto
            [&_iframe]:w-full [&_iframe]:aspect-video
            [&_table]:w-full [&_table]:block [&_table]:overflow-x-auto
          "
        >
          <ContentResultDisplay
            content={formattedContent}
            onSave={handleSave}
            onRegenerate={handleEdit}
            isSaving={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
