import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Copy, 
  Heart, 
  MessageCircle, 
  RefreshCw, 
  Target 
} from "lucide-react";
import { toast } from "sonner";

interface DiaDevocional {
  dia: number;
  titulo: string;
  versiculo_base: string;
  reflexao: string;
  perguntas_pessoais: string[];
  oracao: string;
  desafio_do_dia: string;
}

interface DevocionalSemanalProps {
  devocional_semanal?: {
    titulo: string;
    objetivo_semanal: string;
    dias: DiaDevocional[];
    conclusao_semanal?: string;
  };
  fundamento_biblico?: {
    versiculos: string[];
    contexto: string;
    principio: string;
  };
  data?: any;
  onRegenerate?: () => void;
}

export function DevocionalSemanalView({ 
  devocional_semanal, 
  fundamento_biblico,
  data,
  onRegenerate 
}: DevocionalSemanalProps) {
  // Normalizar dados - aceitar múltiplas estruturas
  const ds = devocional_semanal || data?.devocional_semanal || data;
  const dias: DiaDevocional[] = ds?.dias || [];
  const titulo = ds?.titulo || 'Devocional Semanal';
  const objetivo = ds?.objetivo_semanal || ds?.objetivo || '';
  const conclusao = ds?.conclusao_semanal || ds?.conclusao || '';
  const fundamento = fundamento_biblico || data?.fundamento_biblico;

  // Se não há dias, mostrar estado vazio
  if (!dias || dias.length === 0) {
    return (
      <Card className="border-yellow-500/50">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Não foi possível renderizar o devocional semanal. Estrutura de dias não encontrada.
          </p>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerar Conteúdo
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const handleCopyDay = (dia: DiaDevocional) => {
    const text = `📖 DIA ${dia.dia} - ${dia.titulo}

✝️ ${dia.versiculo_base}

${dia.reflexao}

📝 Perguntas para reflexão:
${dia.perguntas_pessoais.map((p, i) => `${i + 1}. ${p}`).join('\n')}

🙏 Oração:
${dia.oracao}

💪 Desafio do dia:
${dia.desafio_do_dia}`;
    
    navigator.clipboard.writeText(text);
    toast.success(`Dia ${dia.dia} copiado!`);
  };

  const handleCopyAll = () => {
    let text = `📚 ${titulo}\n\n`;
    
    if (objetivo) {
      text += `🎯 Objetivo: ${objetivo}\n\n`;
    }
    
    text += '━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    dias.forEach((dia) => {
      text += `📖 DIA ${dia.dia} - ${dia.titulo}\n\n`;
      text += `✝️ ${dia.versiculo_base}\n\n`;
      text += `${dia.reflexao}\n\n`;
      text += `📝 Perguntas:\n${dia.perguntas_pessoais.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n`;
      text += `🙏 Oração: ${dia.oracao}\n\n`;
      text += `💪 Desafio: ${dia.desafio_do_dia}\n\n`;
      text += '━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    });
    
    if (conclusao) {
      text += `✨ Conclusão:\n${conclusao}`;
    }
    
    navigator.clipboard.writeText(text);
    toast.success('Devocional completo copiado!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {titulo}
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                {dias.length} dias
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopyAll}>
              <Copy className="w-4 h-4 mr-2" />
              Copiar Tudo
            </Button>
          </div>
          {objetivo && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              {objetivo}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Fundamento Bíblico */}
      {fundamento && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Fundamento Bíblico
            </h4>
            {fundamento.versiculos?.length > 0 && (
              <div className="space-y-1 mb-2">
                {fundamento.versiculos.map((v: string, i: number) => (
                  <p key={i} className="text-sm italic text-muted-foreground">"{v}"</p>
                ))}
              </div>
            )}
            {fundamento.contexto && (
              <p className="text-sm text-muted-foreground">{fundamento.contexto}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs com os dias */}
      <Tabs defaultValue="1" className="w-full">
        <TabsList className="w-full flex overflow-x-auto justify-start gap-1 h-auto flex-wrap">
          {dias.map((dia) => (
            <TabsTrigger 
              key={dia.dia} 
              value={String(dia.dia)}
              className="flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Dia {dia.dia}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {dias.map((dia) => (
          <TabsContent key={dia.dia} value={String(dia.dia)} className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="mb-2">Dia {dia.dia}</Badge>
                    <CardTitle className="text-lg">{dia.titulo}</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleCopyDay(dia)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Versículo */}
                <div className="bg-primary/5 p-3 rounded-lg border-l-4 border-primary">
                  <p className="text-sm font-medium italic">{dia.versiculo_base}</p>
                </div>

                {/* Reflexão */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    Reflexão
                  </h4>
                  <ScrollArea className="max-h-[200px]">
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {dia.reflexao}
                    </p>
                  </ScrollArea>
                </div>

                {/* Perguntas */}
                {dia.perguntas_pessoais?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      Perguntas para Reflexão
                    </h4>
                    <ul className="space-y-2">
                      {dia.perguntas_pessoais.map((pergunta, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="font-semibold text-primary">{i + 1}.</span>
                          {pergunta}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Oração */}
                {dia.oracao && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      🙏 Oração Sugerida
                    </h4>
                    <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-lg">
                      {dia.oracao}
                    </p>
                  </div>
                )}

                {/* Desafio */}
                {dia.desafio_do_dia && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Desafio do Dia
                    </h4>
                    <div className="bg-green-500/10 text-green-700 dark:text-green-300 p-3 rounded-lg text-sm">
                      {dia.desafio_do_dia}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Conclusão */}
      {conclusao && (
        <Card className="bg-gradient-to-r from-amber-500/5 to-amber-500/10">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              ✨ Conclusão da Semana
            </h4>
            <p className="text-sm text-muted-foreground">{conclusao}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
