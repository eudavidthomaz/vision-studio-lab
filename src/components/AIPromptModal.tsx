import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Sparkles, Loader2, BookOpen, Wand2, Calendar, Video, ClipboardList, Smartphone, Shield, TrendingUp, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Comandos especiais disponíveis
const SPECIAL_COMMANDS = [
  {
    command: "/treino-voluntário",
    name: "Treino de Voluntário",
    description: "Onboarding completo para capacitar novos voluntários",
    icon: GraduationCap,
    example: "Ex: /treino-voluntário para equipe de fotografia",
    category: "Educação"
  },
  {
    command: "/campanha-temática",
    name: "Campanha Temática",
    description: "Planejamento de série com 4 semanas de conteúdo",
    icon: Calendar,
    example: "Ex: /campanha-temática sobre família",
    category: "Estratégia"
  },
  {
    command: "/roteiro-reels",
    name: "Roteiro de Reels",
    description: "Script completo com Hook, Valor e CTA",
    icon: Video,
    example: "Ex: /roteiro-reels sobre superação",
    category: "Criativo"
  },
  {
    command: "/checklist-culto",
    name: "Checklist de Culto",
    description: "Checklist pré, durante e pós-culto com avisos éticos",
    icon: ClipboardList,
    example: "Ex: /checklist-culto para culto de domingo",
    category: "Operacional"
  },
  {
    command: "/kit-básico",
    name: "Kit Básico",
    description: "Setup mínimo para mídia digna mesmo com celular",
    icon: Smartphone,
    example: "Ex: /kit-básico para igreja pequena",
    category: "Recursos"
  },
  {
    command: "/manual-ética",
    name: "Manual de Ética",
    description: "Guia para proteger imagens e evitar abusos (LGPD/ECA)",
    icon: Shield,
    example: "Ex: /manual-ética para equipe de mídia",
    category: "Segurança"
  },
  {
    command: "/estratégia-social",
    name: "Estratégia Social",
    description: "Plano completo para Instagram com metas semanais",
    icon: TrendingUp,
    example: "Ex: /estratégia-social para aumentar alcance",
    category: "Marketing"
  }
];

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
  const [showCommands, setShowCommands] = useState(true);

  // Detectar se há comando especial no prompt
  const detectedCommand = SPECIAL_COMMANDS.find(cmd => 
    prompt.toLowerCase().includes(cmd.command.toLowerCase())
  );

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

  // Função para detectar tipo de conteúdo (formatos específicos primeiro)
  const detectContentType = (text: string): string => {
    // FORMATOS ORGANIZACIONAIS (prioridade alta)
    if (/calendário|cronograma|planejamento|plano editorial|grade de posts/i.test(text)) return 'calendario';
    if (/aviso|comunicado|lembrete|atenção/i.test(text)) return 'aviso';
    if (/guia|manual|passo a passo|tutorial/i.test(text)) return 'guia';
    if (/esboço|outline|tópicos|estrutura/i.test(text)) return 'esboco';
    if (/versículos citados|referências bíblicas|passagens mencionadas/i.test(text)) return 'versiculos_citados';
    if (/trilha de oração|roteiro de oração|guia de intercessão/i.test(text)) return 'trilha_oracao';
    if (/perguntas e respostas|q&a|dúvidas frequentes|faq/i.test(text)) return 'qa_estruturado';
    if (/convite para grupo|chamado para célula|junte-se ao|entre no grupo/i.test(text)) return 'convite_grupos';
    if (/discipulado|mentoria|acompanhamento espiritual/i.test(text)) return 'discipulado';
    if (/convite|convidar|chamado para|venha para/i.test(text)) return 'convite';
    
    // FORMATOS BÍBLICOS/CRIATIVOS
    if (/desafio|challenge|compromisso semanal|missão|jornada/i.test(text)) return 'desafio_semanal';
    if (/estudo|estudo bíblico|análise bíblica|exegese/i.test(text)) return 'estudo';
    if (/resumo|resumir|sintetize|principais pontos|síntese/i.test(text)) return 'resumo';
    if (/devocional|meditação|reflexão diária/i.test(text)) return 'devocional';
    if (/carrossel|slides|cards/i.test(text)) return 'carrossel';
    if (/reel|vídeo|roteiro|script/i.test(text)) return 'reel';
    if (/stories|story|storys/i.test(text)) return 'stories';
    if (/perguntas|questões|discussão|célula/i.test(text)) return 'perguntas';
    if (/post|publicação|legenda/i.test(text)) return 'post';
    if (/ideia|viral|campanha|estratégia|plano de conteúdo|série/i.test(text)) return 'ideia_estrategica';
    
    return 'post';
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    // Detectar intenção ANTES de combinar com transcrição
    const userIntent = detectContentType(prompt.trim());
    
    let finalPrompt = prompt.trim();
    
    // Se usuário selecionou uma pregação, buscar transcrição
    if (selectedSermonId && selectedSermonId !== "none") {
      const { data: sermon } = await supabase
        .from('sermons')
        .select('transcript')
        .eq('id', selectedSermonId)
        .single();
      
      if (sermon?.transcript) {
        finalPrompt = `TIPO_SOLICITADO: ${userIntent}

Com base nesta transcrição de pregação:

${sermon.transcript}

---

Pedido específico do usuário:
${prompt.trim()}`;
      }
    }
    
    onGenerate(finalPrompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !isLoading) {
      handleSubmit();
    }
  };

  // Inserir comando ao clicar
  const insertCommand = (command: string) => {
    setPrompt(command + " ");
    setShowCommands(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            O que você quer criar hoje?
          </DialogTitle>
          <DialogDescription>
            Descreva o conteúdo que você precisa e deixe a IA criar para você
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Comandos especiais sugeridos */}
          {showCommands && !prompt && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Comandos Especiais</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs"
                  onClick={() => setShowCommands(false)}
                >
                  Ocultar
                </Button>
              </div>
              
              <TooltipProvider delayDuration={200}>
                <div className="grid grid-cols-2 gap-2">
                  {SPECIAL_COMMANDS.map((cmd) => {
                    const Icon = cmd.icon;
                    return (
                      <Tooltip key={cmd.command}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="justify-start gap-2 h-auto py-2 px-3 text-left hover:bg-primary/10 hover:border-primary transition-colors"
                            onClick={() => insertCommand(cmd.command)}
                          >
                            <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-xs font-medium truncate">{cmd.name}</span>
                              <span className="text-[10px] text-muted-foreground truncate">{cmd.category}</span>
                            </div>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[300px]">
                          <div className="space-y-1">
                            <p className="font-medium text-xs">{cmd.name}</p>
                            <p className="text-xs text-muted-foreground">{cmd.description}</p>
                            <p className="text-[10px] text-primary mt-2">{cmd.example}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
              
              {!showCommands && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full h-8 text-xs"
                  onClick={() => setShowCommands(true)}
                >
                  <Wand2 className="w-3 h-3 mr-2" />
                  Ver Comandos Especiais
                </Button>
              )}
            </div>
          )}

          {/* Select de pregações (opcional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              📖 Usar pregação anterior (opcional)
            </label>
            <Select value={selectedSermonId} onValueChange={setSelectedSermonId}>
              <SelectTrigger>
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

          {/* Badge indicador quando comando detectado */}
          {detectedCommand && (
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
              <Badge variant="default" className="gap-1.5">
                {(() => {
                  const Icon = detectedCommand.icon;
                  return <Icon className="w-3 h-3" />;
                })()}
                {detectedCommand.category}
              </Badge>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium text-primary">{detectedCommand.name}</span>
                <span className="text-xs text-muted-foreground truncate">{detectedCommand.description}</span>
              </div>
            </div>
          )}

          {/* Badge indicador quando pregação selecionada */}
          {selectedSermonId && selectedSermonId !== "none" && (
            <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-md text-sm">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-primary font-medium">
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
            className="min-h-[150px] resize-none"
            disabled={isLoading}
            autoFocus
          />
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">💡 Dicas:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
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
