import { ContentLibraryItem } from "@/hooks/useContentLibrary";
import { CarrosselView } from "./content-views/CarrosselView";
import { ConviteView } from "./content-views/ConviteView";
import { ReelView } from "./content-views/ReelView";
import { StoriesView } from "./content-views/StoriesView";
import { PostSimplesView } from "./content-views/PostSimplesView";
import { DevocionalView } from "./content-views/DevocionalView";
import { EstudoBiblicoView } from "./content-views/EstudoBiblicoView";
import { EsbocoView } from "./content-views/EsbocoView";
import { DesafioSemanalView } from "./content-views/DesafioSemanalView";
import { RoteiroVideoView } from "./content-views/RoteiroVideoView";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertCircle } from "lucide-react";

interface ContentViewerProps {
  content: ContentLibraryItem;
}

// Mapeamento de tipos de conteúdo para componentes de visualização
const CONTENT_VIEWS: Record<string, any> = {
  'carrossel': CarrosselView,
  'reel': ReelView,
  'stories': StoriesView,
  'post': PostSimplesView,
  'devocional': DevocionalView,
  'estudo': EstudoBiblicoView,
  'esboco': EsbocoView,
  'desafio_semanal': DesafioSemanalView,
  'roteiro_video': RoteiroVideoView,
  'convite': ConviteView,
};

// View padrão para tipos não mapeados
function DefaultView({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          Visualização Genérica
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[600px] text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}

export function ContentViewer({ content }: ContentViewerProps) {
  // Selecionar o componente de visualização apropriado
  const ViewComponent = CONTENT_VIEWS[content.content_type] || DefaultView;

  return (
    <div className="space-y-6">
      {/* Renderizar o componente específico do tipo de conteúdo */}
      <ViewComponent 
        {...content.content}
        data={content.content}
      />
    </div>
  );
}
