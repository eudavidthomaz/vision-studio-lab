import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Clock, Copy, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { normalizeChecklistCultoData } from "@/lib/normalizeContentData";

interface ChecklistCultoViewProps {
  data?: any;
  checklist?: any;
  onRegenerate?: () => void;
}

export const ChecklistCultoView = ({ data, checklist, onRegenerate }: ChecklistCultoViewProps) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  // Normalizar dados de múltiplas fontes
  const rawData = checklist || data?.checklist || data;
  const normalized = normalizeChecklistCultoData(rawData);
  
  // Fallback para estrutura antiga com fases
  const legacyFases = rawData?.fases;
  const hasLegacyStructure = legacyFases && legacyFases.length > 0;
  const hasNormalizedStructure = normalized.categorias && normalized.categorias.length > 0;
  const hasContent = hasNormalizedStructure || hasLegacyStructure;
  
  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const getPrioridadeColor = (prioridade: string) => {
    const colors: Record<string, string> = {
      'Alta': 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400',
      'Média': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400',
      'Baixa': 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400',
    };
    return colors[prioridade] || 'bg-gray-100 text-gray-700';
  };

  const copyAll = () => {
    let fullText = `📋 ${normalized.titulo}\n`;
    fullText += `📅 ${normalized.data_evento}\n`;
    fullText += `👤 Responsável: ${normalized.responsavel_geral}\n\n`;
    
    if (hasNormalizedStructure) {
      normalized.categorias.forEach((cat) => {
        fullText += `--- ${cat.nome} (${cat.responsavel}) ---\n`;
        cat.itens.forEach((item) => {
          fullText += `☐ ${item.item}`;
          if (item.prazo) fullText += ` [${item.prazo}]`;
          if (item.observacao) fullText += ` - ${item.observacao}`;
          fullText += '\n';
        });
        fullText += '\n';
      });
    } else if (hasLegacyStructure) {
      legacyFases.forEach((fase: any) => {
        fullText += `--- ${fase.nome} (${fase.momento}) ---\n`;
        fase.tarefas?.forEach((tarefa: any) => {
          fullText += `☐ ${tarefa.item} - ${tarefa.responsavel} [${tarefa.prioridade}]\n`;
        });
        fullText += '\n';
      });
    }
    
    navigator.clipboard.writeText(fullText);
    toast.success("Checklist copiado!");
  };

  if (!hasContent) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Checklist incompleto</p>
          <p className="text-sm text-muted-foreground mb-4">
            Nenhuma categoria ou tarefa foi definida. Tente regenerar.
          </p>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerar
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 max-w-4xl mx-auto">
      
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <ClipboardCheck className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl sm:text-2xl md:text-3xl break-words">
                  {normalized.titulo || rawData?.titulo}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {normalized.data_evento}
                  </Badge>
                  {rawData?.tipo_evento && (
                    <Badge variant="outline" className="text-xs">
                      {rawData.tipo_evento}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={copyAll}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      {/* Categorias/Fases */}
      {hasNormalizedStructure ? (
        normalized.categorias.map((categoria, catIndex) => (
          <Card key={catIndex}>
            <CardHeader className="bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">{categoria.nome}</CardTitle>
                <Badge variant="outline">
                  👤 {categoria.responsavel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {categoria.itens.map((item, itemIndex) => {
                  const itemId = `${catIndex}-${itemIndex}`;
                  return (
                    <div 
                      key={itemId}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={itemId}
                        checked={checkedItems[itemId] || false}
                        onCheckedChange={() => toggleItem(itemId)}
                        className="mt-0.5"
                      />
                      <label
                        htmlFor={itemId}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        <p className={`font-medium ${checkedItems[itemId] ? 'line-through text-muted-foreground' : ''}`}>
                          {item.item}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {item.prazo && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.prazo}
                            </span>
                          )}
                          {item.observacao && (
                            <span className="text-xs text-muted-foreground">
                              💡 {item.observacao}
                            </span>
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        // Estrutura legacy com fases
        legacyFases?.map((fase: any, faseIndex: number) => (
          <Card key={faseIndex}>
            <CardHeader className="bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">{fase.nome}</CardTitle>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {fase.momento}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {fase.tarefas?.map((tarefa: any, tarefaIndex: number) => {
                  const itemId = `${faseIndex}-${tarefaIndex}`;
                  return (
                    <div 
                      key={itemId}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={itemId}
                        checked={checkedItems[itemId] || false}
                        onCheckedChange={() => toggleItem(itemId)}
                        className="mt-0.5"
                      />
                      <label
                        htmlFor={itemId}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        <p className={`font-medium ${checkedItems[itemId] ? 'line-through text-muted-foreground' : ''}`}>
                          {tarefa.item}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            👤 {tarefa.responsavel}
                          </span>
                          <Badge className={getPrioridadeColor(tarefa.prioridade)}>
                            {tarefa.prioridade}
                          </Badge>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))
      )}
      
    </div>
  );
};