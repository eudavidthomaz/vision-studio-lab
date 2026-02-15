import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Sparkles, Loader2, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { detectContentTypes } from "@/lib/detectContentTypes";


interface AIPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  preselectedSermonId?: string;
}

export const AIPromptModal = ({ open, onOpenChange, onGenerate, isLoading, preselectedSermonId }: AIPromptModalProps) => {
  const [prompt, setPrompt] = useState("");
  const [sermons, setSermons] = useState<any[]>([]);
  const [selectedSermonId, setSelectedSermonId] = useState<string>("");

  useEffect(() => {
    if (open) {
      // Buscar pregações do usuário
      supabase
        .from('sermons')
        .select('id, created_at, transcript')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(20)
        .then(({ data }) => setSermons(data || []));
      
      // Pré-selecionar sermão se fornecido
      if (preselectedSermonId) {
        setSelectedSermonId(preselectedSermonId);
      }
    }
  }, [open, preselectedSermonId]);

  // Nova função para extrair especificações do usuário
  const extractUserSpecifications = (text: string) => {
    const specs: any = {};
    
    // Quantidade (slides, páginas, cards, dias, etc.)
    const quantidadeMatch = text.match(/(\d+)\s*(slides?|páginas?|cards?|dias?|semanas?|pontos?|cenas?)/i);
    if (quantidadeMatch) {
      specs.quantidade = parseInt(quantidadeMatch[1]);
      specs.unidade = quantidadeMatch[2].toLowerCase();
    }
    
    // Tom emocional
    const tons = ['emocional', 'inspirador', 'reflexivo', 'prático', 'profundo', 'leve', 'sério', 'motivador', 'urgente'];
    const tomMatch = tons.find(t => new RegExp(`\\b${t}\\b`, 'i').test(text));
    if (tomMatch) {
      specs.tom = tomMatch;
    }
    
    // Duração (para vídeos)
    const duracaoMatch = text.match(/(\d+)\s*(segundos?|minutos?|seg|min)/i);
    if (duracaoMatch) {
      specs.duracao = `${duracaoMatch[1]}${duracaoMatch[2][0]}`;
    }
    
    // Público-alvo
    const publicoOptions = ['jovens', 'adolescentes', 'crianças', 'adultos', 'idosos', 'casais', 'solteiros'];
    const publicoMatch = publicoOptions.find(p => new RegExp(`\\b${p}\\b`, 'i').test(text));
    if (publicoMatch) {
      specs.publico = publicoMatch;
    }
    
    return specs;
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    // PASSO 1: Analisar prompt do usuário para extrair TODAS especificações
    const userSpecs = extractUserSpecifications(prompt.trim());
    
    // PASSO 2: Detectar tipo base usando sistema unificado
    const detectedTypes = detectContentTypes(prompt.trim());
    const baseType = detectedTypes[0];
    
    // Log detalhado para debug
    console.log('🔍 [AIPromptModal] Prompt original:', prompt.trim());
    console.log('🎯 [AIPromptModal] Tipos detectados:', detectedTypes);
    console.log('📋 [AIPromptModal] Tipo principal:', baseType);
    console.log('⚙️ [AIPromptModal] Especificações:', userSpecs);
    
    // PASSO 3: Construir prompt estruturado HIERARQUICAMENTE
    let finalPrompt = '';
    
    // Nível 1: Metadados (lidos primeiro pela IA)
    finalPrompt += `TIPO_SOLICITADO: ${baseType}\n`;

    if (detectedTypes.length > 1) {
      finalPrompt += `FORMATOS_DETECTADOS: ${detectedTypes.join(", ")}\n`;
    }

    finalPrompt += "\n";
    
    if (userSpecs.quantidade) {
      finalPrompt += `QUANTIDADE_OBRIGATÓRIA: ${userSpecs.quantidade} ${userSpecs.unidade || 'itens'} (EXATAMENTE)\n`;
    }
    if (userSpecs.tom) {
      finalPrompt += `TOM_OBRIGATÓRIO: ${userSpecs.tom}\n`;
    }
    if (userSpecs.duracao) {
      finalPrompt += `DURAÇÃO: ${userSpecs.duracao}\n`;
    }
    if (userSpecs.publico) {
      finalPrompt += `PÚBLICO_ALVO: ${userSpecs.publico}\n`;
    }
    
    finalPrompt += `\n---\n\n`;
    
    // Nível 2: Contexto (se houver pregação selecionada)
    if (selectedSermonId && selectedSermonId !== "none") {
      const { data: sermon } = await supabase
        .from('sermons')
        .select('transcript')
        .eq('id', selectedSermonId)
        .single();
      
      if (sermon?.transcript) {
        finalPrompt += `CONTEXTO BASE (Transcrição de Pregação):\n\n${sermon.transcript}\n\n---\n\n`;
      }
    }

    // Nível 3: Pedido específico do usuário (SEMPRE no final)
    finalPrompt += `INSTRUÇÃO PRINCIPAL DO USUÁRIO:\n${prompt.trim()}`;

    // Nível 4: Camada estratégica obrigatória para redes sociais
    finalPrompt += `\n\n---\n\n`;
    finalPrompt += `RESPONDA COMO UM ESTRATEGISTA DE MARKETING PARA IGREJAS. MESMO QUE O PEDIDO SEJA GENÉRICO, INTERPRETE E DEFINA O FORMATO MAIS ADEQUADO PARA REDES SOCIAIS (PRIORIZE INSTAGRAM).\n`;
    finalPrompt += `SEM RESUMIR NADA, ENTREGUE SEMPRE AS SEÇÕES A SEGUIR EM PORTUGUÊS: \n`;
    finalPrompt += `1) "ideia_estrategica": { titulo, objetivo, publico_alvo, promessa, chamada_para_acao, tom, formato_prioritario, proximos_passos } focada em atrair e engajar a audiência cristã.\n`;
    finalPrompt += `2) "fundamento_biblico": { versiculos: [lista], contexto, principio_atemporal } explicando o porquê bíblico da mensagem. Use referências completas.\n`;
    finalPrompt += `3) "conteudo": inclua o formato solicitado (carrossel, post, reel, stories etc.) com textos completos, legenda, CTA e hashtags sugeridas. Nunca devolva textos cortados ou abreviados.\n`;
    finalPrompt += `4) Inclua também "dica_producao" ou detalhes visuais quando fizer sentido para facilitar a execução.\n`;
    finalPrompt += `Garanta coerência entre a ideia estratégica, o fundamento bíblico e os textos gerados.`;
    
    console.log('📋 Especificações extraídas:', userSpecs);
    console.log('🎯 Tipo detectado:', baseType);
    
    onGenerate(finalPrompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-[650px] max-h-[85dvh] overflow-y-auto overflow-x-hidden rounded-xl shadow-2xl border-border/50" data-prevent-zoom>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse" />
            O que você quer criar hoje?
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm leading-relaxed">
            Descreva o conteúdo que você precisa e deixe a IA criar para você
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          {/* Select de pregações (opcional) */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium">
              📖 Usar pregação anterior (opcional)
            </label>
            <Select value={selectedSermonId} onValueChange={setSelectedSermonId}>
              <SelectTrigger className="h-10 sm:h-11">
                <SelectValue placeholder="Selecione uma pregação..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma (criar do zero)</SelectItem>
                {sermons.map((sermon) => (
                  <SelectItem key={sermon.id} value={sermon.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {new Date(sermon.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {sermon.transcript?.substring(0, 80)}...
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Badge indicador quando pregação selecionada */}
          {selectedSermonId && selectedSermonId !== "none" && (
            <div className="flex items-center gap-2 p-2.5 bg-primary/10 rounded-lg text-xs sm:text-sm backdrop-blur-sm border border-primary/20">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
              <span className="text-primary font-medium leading-tight">
                Gerando com base em pregação selecionada
              </span>
            </div>
          )}
          
          <Textarea
            placeholder={
              selectedSermonId && selectedSermonId !== "none"
                ? "Ex: Crie um carrossel sobre os pontos principais... ou Faça um post sobre a mensagem central..."
                : "Ex: Crie um carrossel para o Instagram sobre amor... ou Preciso de um post reflexivo sobre graça..."
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[100px] sm:min-h-[140px] resize-none text-xs sm:text-sm"
            disabled={isLoading}
            autoFocus
          />
          
          <div className="text-[10px] sm:text-xs text-muted-foreground space-y-1 bg-muted/30 rounded-lg p-2.5 sm:p-3">
            <p className="font-semibold text-foreground">💡 Dicas para melhores resultados:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-1 sm:ml-2 leading-relaxed">
              {selectedSermonId && selectedSermonId !== "none" ? (
                <>
                  <li>Peça conteúdos específicos baseados na pregação selecionada</li>
                  <li>Ex: "Destaque os 3 pontos principais em um carrossel"</li>
                  <li>Ex: "Crie stories diários com frases da mensagem"</li>
                </>
              ) : (
                <>
                  <li>Seja específico sobre o tema e formato (carrossel, reel, post...)</li>
                  <li>Mencione o tom desejado (inspirador, reflexivo, prático...)</li>
                  <li>Indique a rede social se quiser (Instagram, Facebook...)</li>
                </>
              )}
            </ul>
            <p className="mt-2 text-xs opacity-70">Atalho: Ctrl/Cmd + Enter para gerar</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !prompt.trim()}
            className="bg-gradient-to-r from-primary to-accent"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Conteúdo
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
