/**
 * GenericContentView - Componente de fallback para conteúdos não reconhecidos
 * 
 * Exibe conteúdo de forma estruturada mesmo quando o tipo não é reconhecido,
 * NUNCA mostrando JSON cru para o usuário.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw, Copy, BookOpen, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { safeString, safeStringArray } from "@/lib/normalizeContentData";

interface GenericContentViewProps {
  data?: any;
  contentType?: string;
  onRegenerate?: () => void;
}

export const GenericContentView = ({ data, contentType, onRegenerate }: GenericContentViewProps) => {
  // Extrair informações úteis do conteúdo, independente da estrutura
  const extractContent = (obj: any): { 
    titulo: string; 
    secoes: Array<{ nome: string; conteudo: string }>;
    versiculos: string[];
    observacoes: string | null;
  } => {
    const result = {
      titulo: '',
      secoes: [] as Array<{ nome: string; conteudo: string }>,
      versiculos: [] as string[],
      observacoes: null as string | null
    };

    if (!obj || typeof obj !== 'object') {
      return result;
    }

    // Tentar extrair título
    result.titulo = obj.titulo || obj.title || obj.nome || obj.tema || 'Conteúdo Gerado';

    // Procurar por versículos - garantir que sejam strings
    if (obj.fundamento_biblico?.versiculos) {
      result.versiculos = safeStringArray(obj.fundamento_biblico.versiculos);
    }

    // Procurar observações do sistema
    if (obj.observacoes_sistema || obj.nota_sistema) {
      result.observacoes = obj.observacoes_sistema || obj.nota_sistema;
    }

    // Extrair seções de conteúdo de forma recursiva
    const processObject = (o: any, prefix = '') => {
      for (const [key, value] of Object.entries(o)) {
        // Ignorar campos técnicos e já processados
        if (['titulo', 'title', 'fundamento_biblico', '_normalized', '_empty', '_type', 
             'observacoes_sistema', 'nota_sistema', 'content_type'].includes(key)) {
          continue;
        }

        const displayKey = key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());

        if (typeof value === 'string' && value.trim()) {
          result.secoes.push({
            nome: prefix ? `${prefix} > ${displayKey}` : displayKey,
            conteudo: value
          });
        } else if (Array.isArray(value)) {
          const textItems = value
            .filter(item => typeof item === 'string' || (typeof item === 'object' && item !== null))
            .map((item, i) => {
              if (typeof item === 'string') return `${i + 1}. ${item}`;
              // Para objetos, tentar extrair texto principal
              const text = item.texto || item.conteudo || item.descricao || item.titulo || JSON.stringify(item);
              return `${i + 1}. ${text}`;
            });
          
          if (textItems.length > 0) {
            result.secoes.push({
              nome: prefix ? `${prefix} > ${displayKey}` : displayKey,
              conteudo: textItems.join('\n')
            });
          }
        } else if (typeof value === 'object' && value !== null) {
          // Recursão para objetos aninhados
          processObject(value, displayKey);
        }
      }
    };

    processObject(obj);
    return result;
  };

  const content = extractContent(data);
  const hasContent = content.secoes.length > 0 || content.versiculos.length > 0;

  const copyAll = () => {
    const lines: string[] = [];
    lines.push(`📋 ${content.titulo}`);
    lines.push('');
    
    if (content.versiculos.length > 0) {
      lines.push('📖 Versículos:');
      content.versiculos.forEach(v => lines.push(`  • ${v}`));
      lines.push('');
    }

    content.secoes.forEach(secao => {
      lines.push(`--- ${secao.nome} ---`);
      lines.push(secao.conteudo);
      lines.push('');
    });

    navigator.clipboard.writeText(lines.join('\n'));
    toast.success('Conteúdo copiado!');
  };

  if (!hasContent) {
    return (
      <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="h-5 w-5" />
            Conteúdo não gerado corretamente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            O sistema não conseguiu interpretar o seu pedido ou gerar um conteúdo válido.
            Isso pode acontecer quando:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>O pedido é muito genérico ou ambíguo</li>
            <li>O tipo de conteúdo solicitado não foi reconhecido</li>
            <li>Houve um erro durante a geração</li>
          </ul>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Dica para melhores resultados:
            </p>
            <p className="text-sm text-muted-foreground">
              Seja específico no seu pedido. Por exemplo: "Crie um <strong>carrossel de 8 páginas</strong> 
              sobre o amor de Deus baseado em João 3:16" em vez de "Crie algo sobre amor".
            </p>
          </div>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho com aviso contextual */}
      {contentType === 'conteudo_generico_estruturado' && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Tipo de conteúdo não reconhecido
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Organizamos o conteúdo da melhor forma possível. Para resultados mais precisos, 
                  especifique o tipo desejado (carrossel, reel, devocional, etc.).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observações do sistema */}
      {content.observacoes && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="py-4">
            <p className="text-sm text-amber-700 dark:text-amber-400">{content.observacoes}</p>
          </CardContent>
        </Card>
      )}

      {/* Conteúdo principal */}
      <Card>
        <CardHeader className="pb-2 px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <CardTitle className="text-base sm:text-xl flex-1 min-w-0 line-clamp-2">{content.titulo}</CardTitle>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={copyAll} className="h-8 text-xs sm:text-sm">
                <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                Copiar
              </Button>
              {onRegenerate && (
                <Button variant="ghost" size="sm" onClick={onRegenerate} className="h-8 w-8 p-0">
                  <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>
          </div>
          {contentType && contentType !== 'conteudo_generico_estruturado' && (
            <Badge variant="secondary" className="w-fit">
              {contentType.replace(/_/g, ' ')}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Versículos */}
          {content.versiculos.length > 0 && (
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="flex items-center gap-2 text-sm font-semibold mb-2 text-primary">
                <BookOpen className="h-4 w-4" />
                Fundamento Bíblico
              </h4>
              <ul className="space-y-1">
                {content.versiculos.map((v, i) => (
                  <li key={i} className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/30">
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Seções de conteúdo */}
          <div className="space-y-4">
            {content.secoes.map((secao, i) => (
              <div key={i} className="border-b last:border-0 pb-4 last:pb-0">
                <h4 className="text-sm font-semibold mb-2 text-foreground/80">
                  {secao.nome}
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {secao.conteudo}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
