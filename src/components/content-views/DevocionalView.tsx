import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Book, MessageSquare, Target, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { normalizeDevocionalData } from "@/lib/normalizeContentData";

interface DevocionalViewProps {
  titulo?: string;
  reflexao?: string;
  perguntas_pessoais?: string[];
  oracao?: string;
  desafio_do_dia?: string;
  data?: any;
  onRegenerate?: () => void;
}

export const DevocionalView = ({ 
  titulo,
  reflexao,
  perguntas_pessoais,
  oracao,
  desafio_do_dia,
  data,
  onRegenerate
}: DevocionalViewProps) => {
  // Normalizar dados de múltiplas fontes
  const rawData = data || { titulo, reflexao, perguntas_pessoais, oracao, desafio_do_dia };
  const normalized = normalizeDevocionalData(rawData);
  
  const hasContent = normalized.reflexao || normalized.oracao || normalized.desafio_do_dia;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const copyAll = () => {
    let fullText = `💜 ${normalized.titulo}\n\n`;
    if (normalized.versiculo_base) fullText += `📖 ${normalized.versiculo_base}\n\n`;
    if (normalized.reflexao) fullText += `📝 REFLEXÃO:\n${normalized.reflexao}\n\n`;
    if (normalized.perguntas_pessoais?.length > 0) {
      fullText += `❓ PERGUNTAS PARA REFLEXÃO:\n`;
      normalized.perguntas_pessoais.forEach((p, i) => {
        fullText += `${i + 1}. ${p}\n`;
      });
      fullText += '\n';
    }
    if (normalized.oracao) fullText += `🙏 ORAÇÃO:\n${normalized.oracao}\n\n`;
    if (normalized.desafio_do_dia) fullText += `🎯 DESAFIO DO DIA:\n${normalized.desafio_do_dia}`;
    
    copyToClipboard(fullText, "Devocional completo");
  };

  if (!hasContent) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-2">⚠️ Devocional incompleto</p>
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
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10">
        <CardHeader className="p-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Heart className="h-4 w-4 text-purple-500" />
              <span className="leading-tight">{normalized.titulo}</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={copyAll}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {normalized.versiculo_base && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3">
            <p className="text-sm italic text-muted-foreground">📖 {normalized.versiculo_base}</p>
          </CardContent>
        </Card>
      )}

      {normalized.reflexao && (
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Book className="h-4 w-4" />
              Reflexão
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="whitespace-pre-line text-sm text-muted-foreground">{normalized.reflexao}</p>
          </CardContent>
        </Card>
      )}

      {normalized.perguntas_pessoais && normalized.perguntas_pessoais.length > 0 && (
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <MessageSquare className="h-4 w-4" />
              Perguntas para Reflexão
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ol className="space-y-2 list-decimal list-inside text-sm text-muted-foreground">
              {normalized.perguntas_pessoais.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {normalized.oracao && (
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardHeader className="p-3">
            <CardTitle className="flex items-center gap-2 text-amber-600 text-sm font-semibold">
              <Heart className="h-4 w-4" />
              Oração
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="italic text-sm text-muted-foreground">{normalized.oracao}</p>
          </CardContent>
        </Card>
      )}

      {normalized.desafio_do_dia && (
        <Card className="bg-green-500/10 border-green-500/20">
          <CardHeader className="p-3">
            <CardTitle className="flex items-center gap-2 text-green-600 text-sm font-semibold">
              <Target className="h-4 w-4" />
              Desafio do Dia
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="font-medium text-sm text-muted-foreground">{normalized.desafio_do_dia}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};