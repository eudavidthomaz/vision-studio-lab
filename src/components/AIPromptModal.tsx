import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sparkles, Loader2, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AIPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

export const AIPromptModal = ({ open, onOpenChange, onGenerate, isLoading }: AIPromptModalProps) => {
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
    }
  }, [open]);

  // Função para detectar tipo de conteúdo
  const detectContentType = (text: string): string => {
    if (/estudo|estudo bíblico|análise bíblica|exegese/i.test(text)) return 'estudo';
    if (/resumo|resumir|sintetize|principais pontos|síntese/i.test(text)) return 'resumo';
    if (/carrossel|slides|cards/i.test(text)) return 'carrossel';
    if (/reel|vídeo|roteiro|script/i.test(text)) return 'reel';
    if (/stories|story|storys/i.test(text)) return 'stories';
    if (/devocional|meditação|reflexão diária/i.test(text)) return 'devocional';
    if (/perguntas|questões|discussão|célula/i.test(text)) return 'perguntas';
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
