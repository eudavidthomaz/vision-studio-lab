import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Sparkles, Loader2, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";


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

  // Função para detectar tipo de conteúdo (formatos específicos primeiro)
  const detectContentType = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    // PRIORIDADE ABSOLUTA: Carrossel (slides/páginas sequenciais)
    if (/carrossel|carousel|slides?|páginas?|sequência|cards?\s*\d+/i.test(lowerText)) {
      return 'carrossel';
    }
    
    // FORMATOS ORGANIZACIONAIS (prioridade alta)
    if (/calendário|calendario|cronograma|planejamento|plano editorial|grade de posts|planner/i.test(lowerText)) return 'calendario';
    if (/aviso|comunicado|lembrete|atenção/i.test(lowerText)) return 'aviso';
    if (/guia|manual|passo a passo|tutorial/i.test(lowerText)) return 'guia';
    if (/esboço|outline|tópicos|estrutura/i.test(lowerText)) return 'esboco';
    if (/versículos citados|referências bíblicas|passagens mencionadas/i.test(lowerText)) return 'versiculos_citados';
    if (/trilha de oração|roteiro de oração|guia de intercessão/i.test(lowerText)) return 'trilha_oracao';
    if (/perguntas e respostas|q&a|dúvidas frequentes|faq/i.test(lowerText)) return 'qa_estruturado';
    if (/convite para grupo|chamado para célula|junte-se ao|entre no grupo/i.test(lowerText)) return 'convite_grupos';
    if (/discipulado|mentoria|acompanhamento espiritual/i.test(lowerText)) return 'discipulado';
    
    // Convite (verificar DEPOIS de carrossel)
    if (/convite|convidar|chamado para|venha para|participe/i.test(lowerText)) return 'convite';
    
    // FORMATOS BÍBLICOS/CRIATIVOS
    if (/desafio|challenge|compromisso semanal|missão|jornada/i.test(lowerText)) return 'desafio_semanal';
    if (/estudo|estudo bíblico|análise bíblica|exegese/i.test(lowerText)) return 'estudo';
    if (/resumo|resumir|sintetize|principais pontos|síntese/i.test(lowerText)) return 'resumo';
    if (/devocional|meditação|reflexão diária/i.test(lowerText)) return 'devocional';
    if (/reel|vídeo|roteiro|script/i.test(lowerText)) return 'reel';
    if (/stories|story|storys/i.test(lowerText)) return 'stories';
    if (/perguntas|questões|discussão|célula/i.test(lowerText)) return 'perguntas';
    if (/post|publicação|legenda/i.test(lowerText)) return 'post';
    if (/ideia|viral|campanha|estratégia|plano de conteúdo|série/i.test(lowerText)) return 'ideia_estrategica';
    
    return 'post';
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    // PASSO 1: Analisar prompt do usuário para extrair TODAS especificações
    const userSpecs = extractUserSpecifications(prompt.trim());
    
    // PASSO 2: Detectar tipo base
    const baseType = detectContentType(prompt.trim());
    
    // PASSO 3: Construir prompt estruturado HIERARQUICAMENTE
    let finalPrompt = '';
    
    // Nível 1: Metadados (lidos primeiro pela IA)
    finalPrompt += `TIPO_SOLICITADO: ${baseType}\n\n`;
    
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
      <DialogContent className="sm:max-w-[650px] max-h-[92vh] overflow-y-auto rounded-xl shadow-2xl border-border/50">
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
              <SelectContent className="bg-popover max-h-[300px]">
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
            className="min-h-[140px] sm:min-h-[160px] resize-none text-xs sm:text-sm"
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
