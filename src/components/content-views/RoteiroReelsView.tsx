import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Copy, Clock, Sparkles, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { FundamentoBiblicoCard } from "./shared/FundamentoBiblicoCard";

interface RoteiroReelsViewProps {
  data: {
    titulo: string;
    fundamento_biblico?: {
      versiculos: string[];
      contexto: string;
      principio_atemporal: string;
    };
    estrutura_visual: {
      hook: string;
      desenvolvimento: string;
      cta: string;
      duracao_total: string;
      audio_sugerido: string;
      texto_tela: string[];
    };
    legenda: string;
    dica_producao: {
      iluminacao: string;
      angulo_camera: string;
      edicao: string;
      melhor_horario: string;
      hashtags: string[];
    };
  };
}

export const RoteiroReelsView = ({ data }: RoteiroReelsViewProps) => {
  const copyScript = () => {
    const text = `
🎬 ROTEIRO DO REEL: ${data.titulo}

⏱️ DURAÇÃO: ${data.estrutura_visual.duracao_total}

📍 HOOK (0-3s):
${data.estrutura_visual.hook}

📍 DESENVOLVIMENTO (3-10s):
${data.estrutura_visual.desenvolvimento}

📍 CTA (10-15s):
${data.estrutura_visual.cta}

🎵 ÁUDIO:
${data.estrutura_visual.audio_sugerido}

📝 LEGENDA:
${data.legenda}

#️⃣ HASHTAGS:
${data.dica_producao.hashtags.join(' ')}
    `.trim();
    
    navigator.clipboard.writeText(text);
    toast.success("Roteiro copiado!");
  };
  
  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 max-w-4xl mx-auto">
      
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Video className="w-6 h-6 text-purple-600 shrink-0" />
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    Reel / Short
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {data.estrutura_visual.duracao_total}
                  </Badge>
                </div>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl break-words">
                  {data.titulo}
                </CardTitle>
              </div>
            </div>
            <Button onClick={copyScript} size="sm" className="shrink-0">
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
      
      {/* Hook */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="bg-red-50 dark:bg-red-950/20">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-600" />
            Hook (0-3s)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Primeiros 3 segundos para parar o scroll
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm sm:text-base font-medium whitespace-pre-line">
            {data.estrutura_visual.hook}
          </p>
        </CardContent>
      </Card>
      
      {/* Desenvolvimento */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
          <CardTitle className="text-base sm:text-lg">Desenvolvimento (3-10s)</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm sm:text-base whitespace-pre-line text-muted-foreground">
            {data.estrutura_visual.desenvolvimento}
          </p>
        </CardContent>
      </Card>
      
      {/* CTA */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="bg-green-50 dark:bg-green-950/20">
          <CardTitle className="text-base sm:text-lg">Call to Action (10-15s)</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm sm:text-base font-medium whitespace-pre-line">
            {data.estrutura_visual.cta}
          </p>
        </CardContent>
      </Card>
      
      {/* Texto na Tela */}
      {data.estrutura_visual.texto_tela && data.estrutura_visual.texto_tela.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Texto na Tela (Overlays)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.estrutura_visual.texto_tela.map((texto, i) => (
                <div key={i} className="p-3 bg-primary/5 rounded-md border border-primary/20 text-center">
                  <p className="font-bold text-sm sm:text-lg">{texto}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Dicas de Produção */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            Dicas de Produção
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-1">💡 Iluminação</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {data.dica_producao.iluminacao}
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-1">📹 Ângulo</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {data.dica_producao.angulo_camera}
              </p>
            </div>
          </div>
          
          <div className="p-3 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-1">✂️ Edição</h4>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {data.dica_producao.edicao}
            </p>
          </div>
          
          <div className="p-3 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-1">🎵 Áudio</h4>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {data.estrutura_visual.audio_sugerido}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Legenda e Hashtags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Legenda e Hashtags</CardTitle>
          <p className="text-xs text-muted-foreground">
            Melhor horário: {data.dica_producao.melhor_horario}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm whitespace-pre-line">{data.legenda}</p>
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            {data.dica_producao.hashtags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
};
