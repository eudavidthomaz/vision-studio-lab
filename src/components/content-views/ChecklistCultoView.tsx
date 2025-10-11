import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardCheck, Clock } from "lucide-react";
import { useState } from "react";

interface ChecklistCultoViewProps {
  data: {
    titulo: string;
    tipo_evento: string;
    fases: Array<{
      nome: string;
      momento: string;
      tarefas: Array<{
        item: string;
        responsavel: string;
        prioridade: string;
      }>;
    }>;
  };
}

export const ChecklistCultoView = ({ data }: ChecklistCultoViewProps) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
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
  
  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 max-w-4xl mx-auto">
      
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-start gap-3">
            <ClipboardCheck className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl break-words">
                {data.titulo}
              </CardTitle>
              <Badge variant="secondary" className="mt-2 text-xs">
                {data.tipo_evento}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Fases */}
      {data.fases?.map((fase, faseIndex) => (
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
              {fase.tarefas?.map((tarefa, tarefaIndex) => {
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
      ))}
      
    </div>
  );
};
