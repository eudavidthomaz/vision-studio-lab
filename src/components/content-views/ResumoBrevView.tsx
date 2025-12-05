import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { FundamentoBiblicoCard } from "./shared/FundamentoBiblicoCard";

interface ResumoBrevViewProps {
  data?: any;
  onRegenerate?: () => void;
}

export const ResumoBrevView = ({ data, onRegenerate }: ResumoBrevViewProps) => {
  // Normalizar dados de múltiplas estruturas possíveis
  const rawData = data?.resumo_breve || data?.resumo || data || {};
  
  const normalized = {
    titulo: rawData.titulo || data?.titulo || 'Resumo Breve',
    fundamento_biblico: rawData.fundamento_biblico || data?.fundamento_biblico,
    tema_central: rawData.tema_central || rawData.tema || '',
    mensagem_principal: rawData.mensagem_principal || rawData.mensagem || rawData.conteudo || '',
    aplicacao_pratica: rawData.aplicacao_pratica || rawData.aplicacao || '',
  };
  
  const hasContent = normalized.titulo && (normalized.tema_central || normalized.mensagem_principal);

  const copyAll = () => {
    let text = `📋 ${normalized.titulo}\n\n`;
    if (normalized.tema_central) text += `TEMA CENTRAL:\n${normalized.tema_central}\n\n`;
    if (normalized.mensagem_principal) text += `MENSAGEM PRINCIPAL:\n${normalized.mensagem_principal}\n\n`;
    if (normalized.aplicacao_pratica) text += `APLICAÇÃO PRÁTICA:\n${normalized.aplicacao_pratica}`;
    
    navigator.clipboard.writeText(text.trim());
    toast.success("Resumo copiado!");
  };

  if (!hasContent) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Resumo incompleto</p>
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
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 max-w-4xl mx-auto">
      
      {/* Header */}
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl sm:text-2xl md:text-3xl break-words">
                  {normalized.titulo}
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  Resumo conciso e impactante da mensagem
                </p>
              </div>
            </div>
            <Button onClick={copyAll} size="sm" className="shrink-0">
              <Copy className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Copiar</span>
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      {/* Fundamento Bíblico */}
      {normalized.fundamento_biblico && (
        <FundamentoBiblicoCard fundamento={normalized.fundamento_biblico} />
      )}
      
      {/* Tema Central */}
      {normalized.tema_central && (
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Tema Central</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base sm:text-lg font-medium text-foreground">
              {normalized.tema_central}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Mensagem Principal */}
      {normalized.mensagem_principal && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Mensagem Principal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base whitespace-pre-line text-muted-foreground leading-relaxed">
              {normalized.mensagem_principal}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Aplicação Prática */}
      {normalized.aplicacao_pratica && (
        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg text-green-700 dark:text-green-400">
              Aplicação Prática
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base whitespace-pre-line text-muted-foreground leading-relaxed">
              {normalized.aplicacao_pratica}
            </p>
          </CardContent>
        </Card>
      )}
      
    </div>
  );
};
