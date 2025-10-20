import { ContentLibraryItem } from "@/hooks/useContentLibrary";

// IMPORTS ORGANIZADOS POR CATEGORIA

// 1. CONTEÚDO SOCIAL
import { CarrosselView } from "./content-views/CarrosselView";
import { ReelView } from "./content-views/ReelView";
import { StoriesView } from "./content-views/StoriesView";
import { PostSimplesView } from "./content-views/PostSimplesView";
import { FotoPostView } from "./content-views/FotoPostView";
import { ConviteView } from "./content-views/ConviteView";

// 2. CONTEÚDO BÍBLICO
import { EstudoBiblicoView } from "./content-views/EstudoBiblicoView";
import { DevocionalView } from "./content-views/DevocionalView";
import { EsbocoView } from "./content-views/EsbocoView";
import { ResumoPregacaoView } from "./content-views/ResumoPregacaoView";
import { ResumoBrevView } from "./content-views/ResumoBrevView";
import { TrilhaOracaoView } from "./content-views/TrilhaOracaoView";
import { VersiculosCitadosView } from "./content-views/VersiculosCitadosView";

// 3. CONTEÚDO EDUCATIVO/ESTRATÉGICO
import { GuiaView } from "./content-views/GuiaView";
import { IdeiaEstrategicaView } from "./content-views/IdeiaEstrategicaView";
import { CalendarioView } from "./content-views/CalendarioView";
import { TreinoVoluntarioView } from "./content-views/TreinoVoluntarioView";
import { CampanhaTematicaView } from "./content-views/CampanhaTematicaView";
import { ManualEticaView } from "./content-views/ManualEticaView";
import { EstrategiaSocialView } from "./content-views/EstrategiaSocialView";
import { KitBasicoView } from "./content-views/KitBasicoView";

// 4. CONTEÚDO OPERACIONAL
import { AvisoView } from "./content-views/AvisoView";
import { ConviteGruposView } from "./content-views/ConviteGruposView";

// 5. CONTEÚDO INTERATIVO
import { DesafioSemanalView } from "./content-views/DesafioSemanalView";
import { QAEstruturadoView } from "./content-views/QAEstruturadoView";
import { PerguntasView } from "./content-views/PerguntasView";
import { DiscipuladoView } from "./content-views/DiscipuladoView";

// 6. OUTROS
import { RoteiroVideoView } from "./content-views/RoteiroVideoView";
import { RoteiroReelsView } from "./content-views/RoteiroReelsView";
import { ChecklistCultoView } from "./content-views/ChecklistCultoView";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertCircle } from "lucide-react";

interface ContentViewerProps {
  content: ContentLibraryItem;
}

// MAPEAMENTO COMPLETO: 34 TIPOS
const CONTENT_VIEWS: Record<string, any> = {
  // Social (6 tipos)
  'carrossel': CarrosselView,
  'reel': ReelView,
  'stories': StoriesView,
  'post': PostSimplesView,
  'foto_post': FotoPostView,
  'convite': ConviteView,
  
  // Bíblico (7 tipos)
  'estudo': EstudoBiblicoView,
  'devocional': DevocionalView,
  'esboco': EsbocoView,
  'resumo': ResumoPregacaoView,
  'resumo_breve': ResumoBrevView,
  'trilha_oracao': TrilhaOracaoView,
  'versiculos_citados': VersiculosCitadosView,
  
  // Educativo/Estratégico (7 tipos)
  'guia': GuiaView,
  'ideia_estrategica': IdeiaEstrategicaView,
  'calendario': CalendarioView,
  'treino_voluntario': TreinoVoluntarioView,
  'campanha_tematica': CampanhaTematicaView,
  'manual_etica': ManualEticaView,
  'estrategia_social': EstrategiaSocialView,
  'kit_basico': KitBasicoView,
  
  // Operacional (2 tipos)
  'aviso': AvisoView,
  'convite_grupos': ConviteGruposView,
  
  // Interativo (4 tipos)
  'desafio_semanal': DesafioSemanalView,
  'qa_estruturado': QAEstruturadoView,
  'perguntas': PerguntasView,
  'discipulado': DiscipuladoView,
  
  // Outros (3 tipos)
  'roteiro_video': RoteiroVideoView,
  'roteiro_reels': RoteiroReelsView,
  'checklist_culto': ChecklistCultoView,
};

// View de fallback melhorada
function DefaultView({ data, type }: { data: any; type: string }) {
  return (
    <Card className="border-yellow-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-600">
          <AlertCircle className="h-5 w-5" />
          View em Desenvolvimento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          A visualização específica para <strong>{type}</strong> ainda está sendo criada. 
          Por enquanto, aqui está o conteúdo:
        </p>
        <details className="bg-muted p-4 rounded-lg">
          <summary className="cursor-pointer font-medium text-sm mb-2">
            Ver conteúdo JSON
          </summary>
          <pre className="overflow-auto max-h-[600px] text-xs mt-2">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}

export function ContentViewer({ content }: ContentViewerProps) {
  // Normalizar tipo de conteúdo (remover underscores, lowercase)
  const normalizedType = content.content_type
    .toLowerCase()
    .replace(/_/g, ''); // "post_simples" → "postsimples"
  
  // Tentar buscar view com tipo normalizado E original
  let ViewComponent = CONTENT_VIEWS[content.content_type] || 
                      CONTENT_VIEWS[normalizedType] ||
                      null;
  
  // Se ainda não achou, tentar mapeamento manual de aliases
  if (!ViewComponent) {
    const typeAliases: Record<string, string> = {
      'postsimples': 'post',
      'post_simples': 'post',
      'postsimple': 'post',
      'resumopregacao': 'resumo',
      'resumo_pregacao': 'resumo',
      'estudobiblico': 'estudo',
      'estudo_biblico': 'estudo',
      'roteiroReels': 'roteiro_reels',
      'roteiroreels': 'roteiro_reels',
    };
    
    const aliasKey = typeAliases[normalizedType];
    if (aliasKey) {
      ViewComponent = CONTENT_VIEWS[aliasKey];
    }
  }
  
  // Log para debug (TEMPORÁRIO - remover depois)
  if (!ViewComponent) {
    console.warn(`❌ No view found for: "${content.content_type}"`, {
      original: content.content_type,
      normalized: normalizedType,
      availableViews: Object.keys(CONTENT_VIEWS)
    });
  }
  
  if (!ViewComponent) {
    return <DefaultView data={content.content} type={content.content_type} />;
  }
  
  return (
    <div className="
      w-full min-w-0 max-w-full overflow-x-hidden
      [&_*]:max-w-full
      [&_button]:max-w-full
      [&_img]:w-full [&_img]:h-auto
      [&_video]:w-full [&_video]:h-auto
      [&_iframe]:w-full [&_iframe]:aspect-video
      [&_table]:w-full [&_table]:block [&_table]:overflow-x-auto
    ">
      <ViewComponent 
        {...content.content}
        data={content.content}
        contentType={content.content_type}
      />
    </div>
  );
}
