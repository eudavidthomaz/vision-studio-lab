import { ContentLibraryItem } from "@/hooks/useContentLibrary";
import { normalizeContentData, detectRealContentType } from "@/lib/normalizeContentData";

// IMPORTS ORGANIZADOS POR CATEGORIA

// 1. CONTEÚDO SOCIAL
import { CarrosselView } from "./content-views/CarrosselView";
import { StoriesView } from "./content-views/StoriesView";
import { PostSimplesView } from "./content-views/PostSimplesView";
import { FotoPostView } from "./content-views/FotoPostView";
import { ConviteView } from "./content-views/ConviteView";

// 2. CONTEÚDO BÍBLICO
import { EstudoBiblicoView } from "./content-views/EstudoBiblicoView";
import { DevocionalView } from "./content-views/DevocionalView";
import { DevocionalSemanalView } from "./content-views/DevocionalSemanalView";
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

// 6. VÍDEO
import { RoteiroVideoCompletoView } from "./content-views/RoteiroVideoCompletoView";
import { RoteiroVideoView } from "./content-views/RoteiroVideoView";
import { RoteiroReelsView } from "./content-views/RoteiroReelsView";
import { ChecklistCultoView } from "./content-views/ChecklistCultoView";

// 7. FALLBACK GENÉRICO
import { GenericContentView } from "./content-views/GenericContentView";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface ContentViewerProps {
  content: ContentLibraryItem;
  onRegenerate?: () => void;
}

// MAPEAMENTO COMPLETO: 34 TIPOS
const CONTENT_VIEWS: Record<string, any> = {
  // Social (5 tipos - reel foi unificado em vídeo)
  'carrossel': CarrosselView,
  'stories': StoriesView,
  'post': PostSimplesView,
  'foto_post': FotoPostView,
  'convite': ConviteView,
  
  // Bíblico (8 tipos)
  'estudo': EstudoBiblicoView,
  'devocional': DevocionalView,
  'devocional_semanal': DevocionalSemanalView,
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
  
  // Vídeo UNIFICADO (todos redirecionam para RoteiroVideoCompletoView)
  'roteiro_video_completo': RoteiroVideoCompletoView,
  'roteiro_video': RoteiroVideoCompletoView,
  'roteiro_reels': RoteiroVideoCompletoView,
  'reel': RoteiroVideoCompletoView,
  'checklist_culto': ChecklistCultoView,
  
  // Fallback genérico estruturado (NUNCA mostra JSON cru)
  'conteudo_generico_estruturado': GenericContentView,
};

// View de fallback melhorada
function DefaultView({ data, type, onRegenerate }: { data: any; type: string; onRegenerate?: () => void }) {
  return (
    <Card className="border-yellow-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-600">
          <AlertCircle className="h-5 w-5" />
          Conteúdo não formatado corretamente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Não foi possível exibir o conteúdo do tipo <strong>{type}</strong> no formato visual esperado.
          Isso pode acontecer quando a IA retorna uma estrutura diferente da esperada.
        </p>
        
        {onRegenerate && (
          <Button onClick={onRegenerate} variant="outline" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerar Conteúdo
          </Button>
        )}
        
        {import.meta.env.DEV && (
          <details className="bg-muted p-4 rounded-lg">
            <summary className="cursor-pointer font-medium text-sm mb-2">
              Ver dados brutos (debug)
            </summary>
            <pre className="overflow-auto max-h-[400px] text-xs mt-2 whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

export function ContentViewer({ content, onRegenerate }: ContentViewerProps) {
  // Detectar tipo real baseado na estrutura dos dados
  const detectedType = detectRealContentType(content.content, content.content_type);
  
  // Normalizar tipo de conteúdo (remover underscores, lowercase)
  const normalizedType = detectedType
    .toLowerCase()
    .replace(/_/g, '');
  
  // Tentar buscar view com tipo normalizado E original
  let ViewComponent = CONTENT_VIEWS[detectedType] || 
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
      'desafio': 'desafio_semanal',
      'campanha': 'campanha_tematica',
      'treino': 'treino_voluntario',
      'kit': 'kit_basico',
      'qa': 'qa_estruturado',
      'estrategia': 'estrategia_social',
      // Vídeo - todos redirecionam para roteiro_video_completo
      'roteiroReels': 'roteiro_video_completo',
      'roteiroreels': 'roteiro_video_completo',
      'roteiroVideo': 'roteiro_video_completo',
      'roteirovideo': 'roteiro_video_completo',
      'video': 'roteiro_video_completo',
      'reels': 'roteiro_video_completo',
      'short': 'roteiro_video_completo',
      'shorts': 'roteiro_video_completo',
    };
    
    const aliasKey = typeAliases[normalizedType] || typeAliases[detectedType];
    if (aliasKey) {
      ViewComponent = CONTENT_VIEWS[aliasKey];
    }
  }
  
  // Normalizar dados antes de passar para a view
  const normalizedData = normalizeContentData(content.content, detectedType);
  
  if (!ViewComponent) {
    console.warn(`❌ No view found for: "${content.content_type}"`, {
      original: content.content_type,
      detected: detectedType,
      normalized: normalizedType,
      availableViews: Object.keys(CONTENT_VIEWS)
    });
    return <DefaultView data={content.content} type={content.content_type} onRegenerate={onRegenerate} />;
  }
  
  // Verificar se dados estão vazios ou malformados
  const isEmpty = !normalizedData || 
    (normalizedData._empty) ||
    (Object.keys(normalizedData).filter(k => !k.startsWith('_')).length === 0);
  
  if (isEmpty) {
    return <DefaultView data={content.content} type={content.content_type} onRegenerate={onRegenerate} />;
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
        {...normalizedData}
        data={normalizedData.data || normalizedData}
        contentType={detectedType}
        onRegenerate={onRegenerate}
      />
    </div>
  );
}
