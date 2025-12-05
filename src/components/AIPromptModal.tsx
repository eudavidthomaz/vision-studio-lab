import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Sparkles, Loader2, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { detectContentTypes, type ContentType } from "@/lib/detectContentTypes";


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
  const [selectedType, setSelectedType] = useState<ContentType | "">("");
  const [typeError, setTypeError] = useState<string>("");

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

  const contentTypeOptions: { value: ContentType; label: string; description: string }[] = [
    { value: "carrossel", label: "Carrossel", description: "Sequência de slides ou cards" },
    { value: "stories", label: "Stories", description: "Sequência para stories" },
    { value: "reel", label: "Reel / Vídeo curto", description: "Roteiro ou legenda para vídeo" },
    { value: "post", label: "Post simples", description: "Legenda curta ou texto único" },
    { value: "devocional", label: "Devocional", description: "Reflexão bíblica com aplicação" },
    { value: "estudo", label: "Estudo bíblico", description: "Análise estruturada com tópicos" },
    { value: "resumo", label: "Resumo de pregação", description: "Síntese dos principais pontos" },
    { value: "resumo_breve", label: "Resumo breve", description: "Síntese super curta" },
    { value: "trilha_oracao", label: "Trilha de oração", description: "Guia passo a passo de oração" },
    { value: "calendario", label: "Calendário", description: "Planejamento de posts ou séries" },
    { value: "guia", label: "Guia / Manual", description: "Passo a passo ou tutorial" },
    { value: "ideia_estrategica", label: "Ideia estratégica", description: "Campanha, série ou plano" },
    { value: "roteiro_reels", label: "Roteiro para reels", description: "Script detalhado para vídeo" },
    { value: "convite", label: "Convite / Chamada", description: "Convites para eventos ou grupos" },
  ];

  const inferredTypes: ContentType[] = prompt.trim() ? detectContentTypes(prompt.trim()) : [];

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    if (!selectedType && inferredTypes.length > 1) {
      setTypeError("Selecione o formato desejado para evitar misturar instruções.");
      return;
    }

    const chosenType = selectedType || inferredTypes[0] || "post";

    // PASSO 1: Analisar prompt do usuário para extrair TODAS especificações
    const userSpecs = extractUserSpecifications(prompt.trim());

    // PASSO 2: Detectar tipo base
    const detectedTypes = detectContentTypes(prompt.trim());
    const baseType = chosenType;
    
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
          
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium">
              🎯 Formato do conteúdo (evita confusões)
            </label>
            <Select
              value={selectedType || ""}
              onValueChange={(value) => {
                setSelectedType(value as ContentType);
                setTypeError("");
              }}
            >
              <SelectTrigger className="h-10 sm:h-11">
                <SelectValue placeholder="Selecione ou deixe que a IA detecte" />
              </SelectTrigger>
              <SelectContent className="bg-popover max-h-[320px]">
                {contentTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-2 items-center text-[11px] sm:text-xs text-muted-foreground">
              {inferredTypes.length > 0 ? (
                <>
                  <span className="font-medium text-foreground">Formatos detectados automaticamente:</span>
                  {inferredTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="font-normal">
                      {type}
                    </Badge>
                  ))}
                </>
              ) : (
                <span className="text-muted-foreground">Digite seu pedido para detectar o formato automaticamente.</span>
              )}
            </div>

            {typeError && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                {typeError}
              </div>
            )}
          </div>

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
