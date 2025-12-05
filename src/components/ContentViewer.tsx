import { ContentLibraryItem } from "@/hooks/useContentLibrary";
import { normalizeContentData, detectRealContentType } from "@/lib/normalizeContentData";

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
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface ContentViewerProps {
  content: ContentLibraryItem;
  onRegenerate?: () => void;
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

// View de fallback amigável (sem JSON bruto visível)
function DefaultView({ data, type, onRegenerate }: { data: any; type: string; onRegenerate?: () => void }) {
  // Tentar extrair texto legível do conteúdo
  const extractReadableContent = (obj: any): string | null => {
    if (!obj) return null;
    
    // Campos comuns que contêm texto principal
    const textFields = ['texto', 'conteudo', 'descricao', 'reflexao', 'mensagem', 'resumo', 'introducao', 'titulo'];
    
    for (const field of textFields) {
      if (obj[field] && typeof obj[field] === 'string') {
        return obj[field];
      }
    }
    
    // Tentar em objetos aninhados
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const found = extractReadableContent(obj[key]);
        if (found) return found;
      }
    }
    
    return null;
  };

  const readableContent = extractReadableContent(data);
  const hasTitle = data?.titulo || data?.title;
  const [showDebug, setShowDebug] = useState(false);

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-base">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {hasTitle ? (
            <span className="truncate">{hasTitle}</span>
          ) : (
            <span>Conteúdo gerado</span>
          )}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Tipo: <span className="font-medium">{type}</span> • Formato visual não disponível
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* Mostrar conteúdo legível se disponível */}
        {readableContent && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {readableContent.substring(0, 800)}
              {readableContent.length > 800 && '...'}
            </p>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="default" size="sm" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerar com outro formato
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs text-muted-foreground"
          >
            {showDebug ? 'Ocultar detalhes' : 'Ver detalhes técnicos'}
          </Button>
        </div>

        {/* Debug colapsado */}
        {showDebug && (
          <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
            <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wide">
              Dados brutos (para suporte técnico)
            </p>
            <pre className="overflow-auto max-h-[200px] text-[10px] whitespace-pre-wrap font-mono text-muted-foreground">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
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
      'roteiroReels': 'roteiro_reels',
      'roteiroreels': 'roteiro_reels',
      'desafio': 'desafio_semanal',
      'campanha': 'campanha_tematica',
      'treino': 'treino_voluntario',
      'kit': 'kit_basico',
      'qa': 'qa_estruturado',
      'estrategia': 'estrategia_social',
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
