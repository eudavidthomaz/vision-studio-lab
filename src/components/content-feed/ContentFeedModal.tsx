import { Dialog, DialogContent } from "@/components/ui/dialog";
import { NormalizedContent } from "@/hooks/useContentFeed";
import { ContentResultDisplay } from "@/components/ContentResultDisplay";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { X } from "lucide-react";

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
      navigate(`/biblioteca?content_id=${uuid}`);
    }
  };

  // Renderizar conteúdo de IA - normalizar estrutura
  const rawData = content.rawData;
  let formattedContent: any;
  
  if (rawData.content_type === 'estudo') {
    formattedContent = { estudo_biblico: rawData.estudo_biblico, content_type: 'estudo' };
  } else if (rawData.content_type === 'resumo') {
    formattedContent = { resumo_pregacao: rawData.resumo_pregacao, content_type: 'resumo' };
  } else if (rawData.content_type === 'desafio_semanal') {
    formattedContent = { desafio_semanal: rawData.desafio_semanal, content_type: 'desafio_semanal' };
  } else if (rawData.content_type === 'ideia_estrategica') {
    formattedContent = { ideia_estrategica: rawData.ideia_estrategica, content_type: 'ideia_estrategica' };
  } else if (rawData.content_type === 'calendario') {
    formattedContent = { calendario: rawData.calendario, content_type: 'calendario' };
  } else if (rawData.content_type === 'convite') {
    formattedContent = { convite: rawData.convite, content_type: 'convite' };
  } else if (rawData.content_type === 'aviso') {
    formattedContent = { aviso: rawData.aviso, content_type: 'aviso' };
  } else if (rawData.content_type === 'guia') {
    formattedContent = { guia: rawData.guia, content_type: 'guia' };
  } else if (rawData.content_type === 'convite_grupos') {
    formattedContent = { convite_grupos: rawData.convite_grupos, content_type: 'convite_grupos' };
  } else if (rawData.content_type === 'versiculos_citados') {
    formattedContent = { versiculos_citados: rawData.versiculos_citados, content_type: 'versiculos_citados' };
  } else if (rawData.content_type === 'esboco') {
    formattedContent = { esboco: rawData.esboco, content_type: 'esboco' };
  } else if (rawData.content_type === 'trilha_oracao') {
    formattedContent = { trilha_oracao: rawData.trilha_oracao, content_type: 'trilha_oracao' };
  } else if (rawData.content_type === 'qa_estruturado') {
    formattedContent = { qa_estruturado: rawData.qa_estruturado, content_type: 'qa_estruturado' };
  } else if (rawData.content_type === 'discipulado') {
    formattedContent = { discipulado: rawData.discipulado, content_type: 'discipulado' };
  } else {
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
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-4xl lg:max-w-5xl max-h-[90dvh] overflow-hidden overflow-x-hidden p-0" data-prevent-zoom>
        {/* Botão fechar explícito */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 z-20 flex items-center justify-center h-8 w-8 rounded-full bg-muted/80 hover:bg-muted transition-colors"
          aria-label="Fechar"
        >
          <X className="h-4 w-4 text-foreground" />
        </button>

        <div className="overflow-y-auto overflow-x-hidden max-h-[90dvh]">
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
