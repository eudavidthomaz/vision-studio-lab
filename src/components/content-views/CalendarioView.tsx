import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Target, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { normalizeCalendarioData } from "@/lib/normalizeContentData";

interface CalendarioViewProps {
  calendario?: any;
  data?: any;
  onRegenerate?: () => void;
}

const getPillarColor = (pilar: string) => {
  const pillarMap: Record<string, string> = {
    ALCANÇAR: "bg-red-500/10 text-red-700 border-red-200",
    EDIFICAR: "bg-blue-500/10 text-blue-700 border-blue-200",
    PERTENCER: "bg-green-500/10 text-green-700 border-green-200",
    SERVIR: "bg-purple-500/10 text-purple-700 border-purple-200",
  };
  return pillarMap[pilar?.toUpperCase()] || "bg-gray-500/10 text-gray-700 border-gray-200";
};

export const CalendarioView = ({ calendario, data, onRegenerate }: CalendarioViewProps) => {
  // Normalizar dados de múltiplas fontes possíveis
  const rawData = calendario || data?.calendario || data;
  const normalized = normalizeCalendarioData(rawData);
  
  const { periodo, objetivo, postagens, observacoes } = normalized;
  const hasContent = postagens && postagens.length > 0;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const copyAll = () => {
    let fullText = `📅 CALENDÁRIO EDITORIAL: ${periodo}\n\n`;
    if (objetivo) fullText += `🎯 Objetivo: ${objetivo}\n\n`;
    
    postagens.forEach((post, i) => {
      fullText += `--- ${post.dia} ---\n`;
      fullText += `⏰ ${post.horario_sugerido} | 📱 ${post.formato}\n`;
      fullText += `📌 ${post.tema}\n`;
      fullText += `🎯 ${post.objetivo_do_post}\n`;
      if (post.versiculo_base) fullText += `📖 ${post.versiculo_base}\n`;
      fullText += `🏷️ ${post.pilar}\n\n`;
    });
    
    if (observacoes) fullText += `💡 Observações: ${observacoes}`;
    
    copyToClipboard(fullText, "Calendário completo");
  };

  if (!hasContent) {
    return (
      <div className="space-y-6">
        <Card className="border-yellow-500/50">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-2">⚠️ Calendário vazio ou incompleto</p>
            <p className="text-sm text-muted-foreground mb-4">
              Nenhuma postagem foi planejada. Tente regenerar o conteúdo com mais detalhes.
            </p>
            {onRegenerate && (
              <Button onClick={onRegenerate} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerar
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Calendário Editorial</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={copyAll}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
          </div>
          {periodo && (
            <p className="text-sm text-muted-foreground mt-2">{periodo}</p>
          )}
        </CardHeader>
        <CardContent>
          {objetivo && (
            <div className="flex items-start gap-2 p-4 bg-primary/5 rounded-lg mb-6">
              <Target className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Objetivo do Período</p>
                <p className="text-sm text-muted-foreground mt-1">{objetivo}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {postagens.map((post, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{post.dia}</span>
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {post.horario_sugerido}
                        </Badge>
                        <Badge variant="secondary">{post.formato}</Badge>
                      </div>
                      <Badge className={getPillarColor(post.pilar)}>
                        {post.pilar}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-1">{post.tema}</h4>
                      <p className="text-sm text-muted-foreground">{post.objetivo_do_post}</p>
                    </div>

                    {post.versiculo_base && (
                      <p className="text-xs text-muted-foreground italic">
                        📖 {post.versiculo_base}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {observacoes && (
            <Card className="mt-6 bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm font-medium mb-2">💡 Observações Estratégicas</p>
                <p className="text-sm text-muted-foreground">{observacoes}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};