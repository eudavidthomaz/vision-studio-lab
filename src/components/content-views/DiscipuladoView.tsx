import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Target, BookOpen, Calendar, CheckCircle2, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { safeString, safeStringArray } from "@/lib/normalizeContentData";

interface DiscipuladoViewProps {
  plano?: any;
  data?: any;
  onRegenerate?: () => void;
}

export const DiscipuladoView = ({ plano, data, onRegenerate }: DiscipuladoViewProps) => {
  // Normalizar dados de múltiplas estruturas possíveis
  const rawData = plano || data?.plano_discipulado || data?.plano || data || {};
  
  const normalized = {
    titulo: rawData.titulo || 'Plano de Discipulado',
    objetivo: rawData.objetivo || '',
    duracao: rawData.duracao || '',
    encontros: Array.isArray(rawData.encontros) ? rawData.encontros : 
               Array.isArray(rawData.sessoes) ? rawData.sessoes : [],
    recursos: Array.isArray(rawData.recursos) ? rawData.recursos : [],
  };
  
  const hasContent = normalized.titulo && (normalized.encontros.length > 0 || normalized.objetivo);

  const copyAll = () => {
    let fullText = `👥 ${normalized.titulo}\n`;
    if (normalized.duracao) fullText += `⏱️ Duração: ${normalized.duracao}\n`;
    if (normalized.objetivo) fullText += `🎯 Objetivo: ${normalized.objetivo}\n\n`;
    
    normalized.encontros.forEach((encontro) => {
      fullText += `--- Encontro ${encontro.numero || ''}: ${encontro.tema || ''} ---\n`;
      const objetivos = Array.isArray(encontro.objetivos) ? encontro.objetivos : [];
      if (objetivos.length > 0) {
        fullText += `Objetivos:\n`;
        objetivos.forEach(o => fullText += `• ${o}\n`);
      }
      if (encontro.versiculo_base) fullText += `📖 ${encontro.versiculo_base}\n`;
      const atividades = Array.isArray(encontro.atividades) ? encontro.atividades : [];
      if (atividades.length > 0) {
        fullText += `Atividades:\n`;
        atividades.forEach(a => fullText += `• ${a}\n`);
      }
      if (encontro.tarefa_casa) fullText += `📝 Tarefa: ${encontro.tarefa_casa}\n`;
      fullText += '\n';
    });
    
    if (normalized.recursos.length > 0) {
      fullText += `📚 RECURSOS:\n`;
      normalized.recursos.forEach(r => fullText += `• ${r}\n`);
    }
    
    navigator.clipboard.writeText(fullText);
    toast.success("Plano copiado!");
  };

  if (!hasContent) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Plano de discipulado incompleto</p>
          <p className="text-sm text-muted-foreground mb-4">
            O conteúdo não foi gerado corretamente. Tente regenerar.
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
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>{normalized.titulo}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={copyAll}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {normalized.duracao && (
            <Badge variant="outline" className="w-fit gap-2 mt-2">
              <Calendar className="h-3 w-3" />
              {normalized.duracao}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {normalized.objetivo && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Objetivo do Plano</p>
                    <p className="text-sm text-muted-foreground mt-1">{normalized.objetivo}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {normalized.encontros.length > 0 && (
            <div className="space-y-4">
              {normalized.encontros.map((encontro, index) => {
                const objetivos = Array.isArray(encontro.objetivos) ? encontro.objetivos : [];
                const atividades = Array.isArray(encontro.atividades) ? encontro.atividades : [];
                
                return (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="h-8 w-8 rounded-full flex items-center justify-center">
                            {encontro.numero || index + 1}
                          </Badge>
                          <h4 className="font-semibold">{encontro.tema || `Encontro ${index + 1}`}</h4>
                        </div>

                        <div className="ml-11 space-y-3">
                          {objetivos.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">🎯 Objetivos:</p>
                              <ul className="space-y-1">
                                {safeStringArray(objetivos).map((objetivo, idx) => (
                                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                    {safeString(objetivo)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {encontro.versiculo_base && (
                            <div className="p-3 bg-muted/50 rounded-lg flex items-start gap-2">
                              <BookOpen className="h-4 w-4 text-primary mt-0.5" />
                              <p className="text-sm text-muted-foreground italic flex-1">
                                {encontro.versiculo_base}
                              </p>
                            </div>
                          )}

                          {atividades.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">📋 Atividades:</p>
                              <ul className="space-y-1">
                                {safeStringArray(atividades).map((atividade, idx) => (
                                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    {safeString(atividade)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {encontro.tarefa_casa && (
                            <div className="p-3 bg-primary/5 rounded-lg">
                              <p className="text-sm font-medium mb-1">📝 Tarefa de Casa:</p>
                              <p className="text-sm text-muted-foreground">{encontro.tarefa_casa}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {normalized.recursos.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="font-medium text-sm mb-2">📚 Recursos Recomendados:</p>
                <ul className="space-y-1">
                  {safeStringArray(normalized.recursos).map((recurso, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      {safeString(recurso)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
