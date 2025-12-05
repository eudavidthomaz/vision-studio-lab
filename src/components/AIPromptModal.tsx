import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "./ui/select";
import { Badge } from "./ui/badge";
import { Sparkles, Loader2, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CONTENT_TYPE_GROUPS, CONTENT_TYPES, ContentType, isValidContentType } from "@/lib/contentTypes";


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
  const [selectedType, setSelectedType] = useState<ContentType | "auto">("auto");

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

  // Extrair especificações do usuário
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
    const publicoOptions = ['jovens', 'adolescentes', 'crianças', 'adultos', 'idosos', 'casais', 'solteiros', 'mulheres', 'homens', 'líderes'];
    const publicoMatch = publicoOptions.find(p => new RegExp(`\\b${p}\\b`, 'i').test(text));
    if (publicoMatch) {
      specs.publico = publicoMatch;
    }
    
    return specs;
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    // PASSO 1: Analisar prompt do usuário para extrair especificações
    const userSpecs = extractUserSpecifications(prompt.trim());
    
    // PASSO 2: Usar tipo selecionado explicitamente (prioridade máxima)
    const finalType = selectedType !== "auto" ? selectedType : null;
    
    // PASSO 3: Construir prompt estruturado HIERARQUICAMENTE
    let finalPrompt = '';
    
    // Nível 1: Tipo EXPLÍCITO (se selecionado no dropdown)
    if (finalType) {
      finalPrompt += `TIPO_SOLICITADO: ${finalType}\n`;
      finalPrompt += `TIPO_EXPLICITO: true\n`; // Flag para backend não sobrescrever
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
    
    console.log('📋 Tipo selecionado:', finalType || 'auto (detecção por regex)');
    console.log('📋 Especificações extraídas:', userSpecs);
    
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
          {/* Select de TIPO de conteúdo (NOVO - prioridade máxima) */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium">
              🎯 Tipo de conteúdo
            </label>
            <Select value={selectedType} onValueChange={(v) => setSelectedType(v as ContentType | "auto")}>
              <SelectTrigger className="h-10 sm:h-11">
                <SelectValue placeholder="Selecione o tipo..." />
              </SelectTrigger>
              <SelectContent className="bg-popover max-h-[350px]">
                <SelectItem value="auto">
                  <span className="flex items-center gap-2">
                    <span>✨</span>
                    <span>Automático (detectar do texto)</span>
                  </span>
                </SelectItem>
                {CONTENT_TYPE_GROUPS.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel className="text-xs text-muted-foreground">{group.label}</SelectLabel>
                    {group.types.map((type) => (
                      <SelectItem key={type} value={type}>
                        <span className="flex items-center gap-2">
                          <span>{CONTENT_TYPES[type].icon}</span>
                          <span>{CONTENT_TYPES[type].label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            {selectedType !== "auto" && (
              <p className="text-[10px] text-muted-foreground">
                Tipo fixado em <strong>{CONTENT_TYPES[selectedType].label}</strong>
              </p>
            )}
          </div>

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
