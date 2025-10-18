import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Copy } from "lucide-react";
import { toast } from "sonner";
import { FundamentoBiblicoCard } from "./shared/FundamentoBiblicoCard";

interface ResumoBrevViewProps {
  data: {
    titulo: string;
    fundamento_biblico?: {
      versiculos: string[];
      contexto: string;
      principio_atemporal: string;
    };
    tema_central: string;
    mensagem_principal: string;
    aplicacao_pratica: string;
  };
}

export const ResumoBrevView = ({ data }: ResumoBrevViewProps) => {
  const copyAll = () => {
    const text = `
${data.titulo}

TEMA CENTRAL:
${data.tema_central}

MENSAGEM PRINCIPAL:
${data.mensagem_principal}

APLICAÇÃO PRÁTICA:
${data.aplicacao_pratica}
    `.trim();
    
    navigator.clipboard.writeText(text);
    toast.success("Resumo copiado!");
  };
  
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
                  {data.titulo}
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
      {data.fundamento_biblico && (
        <FundamentoBiblicoCard fundamento={data.fundamento_biblico} />
      )}
      
      {/* Tema Central */}
      <Card className="border-l-4 border-l-indigo-500">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Tema Central</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base sm:text-lg font-medium text-foreground">
            {data.tema_central}
          </p>
        </CardContent>
      </Card>
      
      {/* Mensagem Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Mensagem Principal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm sm:text-base whitespace-pre-line text-muted-foreground leading-relaxed">
            {data.mensagem_principal}
          </p>
        </CardContent>
      </Card>
      
      {/* Aplicação Prática */}
      <Card className="bg-green-500/5 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg text-green-700 dark:text-green-400">
            Aplicação Prática
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm sm:text-base whitespace-pre-line text-muted-foreground leading-relaxed">
            {data.aplicacao_pratica}
          </p>
        </CardContent>
      </Card>
      
    </div>
  );
};
