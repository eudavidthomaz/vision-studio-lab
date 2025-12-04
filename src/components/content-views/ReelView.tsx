import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Video, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import ImageGenerationModal from "@/components/ImageGenerationModal";

interface ReelViewProps {
  roteiro?: {
    cenas: Array<{
      numero: number;
      duracao: string;
      visual: string;
      audio: string;
      texto_overlay?: string;
    }>;
  };
  estrutura_visual?: {
    cenas?: Array<{
      numero: number;
      duracao: string;
      visual: string;
      audio: string;
      texto_overlay?: string;
    }>;
    hook?: string;
    desenvolvimento?: string;
    cta?: string;
    texto_tela?: string[];
    duracao_total?: string;
    audio_sugerido?: string;
    roteiro?: string;
  };
  conteudo?: {
    legenda?: string;
    hashtags?: string[];
  };
  dica_producao?: {
    hashtags?: string[];
  };
  // Suporte para ContentViewer
  data?: any;
  contentType?: string;
}

export function ReelView({ roteiro, conteudo, data, estrutura_visual, dica_producao, contentType }: ReelViewProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [generatedCoverImage, setGeneratedCoverImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Extrair valores com fallback para ContentViewer
  const actualRoteiro = roteiro || data?.roteiro || data?.roteiro_video;
  const actualEstrutura = estrutura_visual || data?.estrutura_visual;
  const actualConteudo = conteudo || data?.conteudo;
  const hashtags = actualConteudo?.hashtags || dica_producao?.hashtags || data?.dica_producao?.hashtags;

  const roteiroCenas = actualRoteiro?.cenas || actualEstrutura?.cenas;
  const roteiroBlocos = actualEstrutura && (actualEstrutura.hook || actualEstrutura.desenvolvimento || actualEstrutura.cta);
  const roteiroTexto = actualEstrutura?.roteiro;
  
  const handleGenerateCover = () => {
    setIsGenerating(true);
    setImageModalOpen(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success(`${label} copiado!`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="p-2">
          <CardTitle className="text-xs font-semibold flex items-center gap-1.5 mb-2">
            <ImageIcon className="h-3.5 w-3.5" />
            Capa do Reel
          </CardTitle>
          <Button
            variant={generatedCoverImage ? "outline" : "default"}
            size="sm"
            onClick={handleGenerateCover}
            disabled={isGenerating}
            className="w-full h-8 text-xs"
          >
            <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
            {isGenerating ? "Gerando..." : generatedCoverImage ? "Regerar" : "Gerar Capa"}
          </Button>
        </CardHeader>
        {generatedCoverImage && (
          <CardContent className="p-3 pt-0">
            <div id="generated-reel-cover" className="rounded-lg overflow-hidden bg-muted">
              <img 
                src={generatedCoverImage} 
                alt="Capa do reel"
                className="w-full h-auto"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Roteiro de Vídeo */}
      {roteiroCenas && roteiroCenas.length > 0 && (
        <Card>
          <CardHeader className="p-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5" />
              Roteiro - {roteiroCenas.length} Cenas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-2 pt-0">
            {roteiroCenas.map((cena) => (
              <Card key={cena.numero} className="border">
                <CardHeader className="p-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-xs font-semibold line-clamp-2 leading-tight flex-1 min-w-0">
                      Cena {cena.numero} ({cena.duracao})
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(
                        `Cena ${cena.numero}\nDuração: ${cena.duracao}\n\nVisual: ${cena.visual}\n\nÁudio: ${cena.audio}`,
                        `Cena ${cena.numero}`
                      )}
                      className="h-7 w-7 p-0 flex-shrink-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs p-2 pt-0">
                  <div>
                    <strong>Visual:</strong>
                    <p className="text-muted-foreground break-words">{cena.visual}</p>
                  </div>
                  <div>
                    <strong>Áudio/Texto:</strong>
                    <p className="text-muted-foreground break-words">{cena.audio}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Roteiro resumido (hook/desenvolvimento/CTA) */}
      {roteiroBlocos && (
        <Card>
          <CardHeader className="p-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5" />
                Roteiro estruturado
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(`Hook: ${actualEstrutura?.hook}\n\nDesenvolvimento: ${actualEstrutura?.desenvolvimento}\n\nCTA: ${actualEstrutura?.cta}`.trim(), "Roteiro")}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-2 pt-0 text-xs text-muted-foreground">
            {actualEstrutura?.duracao_total && (
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Duração</span>
                <span>{actualEstrutura.duracao_total}</span>
              </div>
            )}
            {actualEstrutura?.hook && (
              <div>
                <p className="font-medium text-foreground">Hook (0-3s)</p>
                <p className="whitespace-pre-wrap break-words">{actualEstrutura.hook}</p>
              </div>
            )}
            {actualEstrutura?.desenvolvimento && (
              <div>
                <p className="font-medium text-foreground">Desenvolvimento</p>
                <p className="whitespace-pre-wrap break-words">{actualEstrutura.desenvolvimento}</p>
              </div>
            )}
            {actualEstrutura?.cta && (
              <div>
                <p className="font-medium text-foreground">CTA Final</p>
                <p className="whitespace-pre-wrap break-words">{actualEstrutura.cta}</p>
              </div>
            )}
            {actualEstrutura?.texto_tela?.length ? (
              <div>
                <p className="font-medium text-foreground">Textos na tela</p>
                <div className="flex flex-wrap gap-2">
                  {actualEstrutura.texto_tela.map((texto, index) => (
                    <span key={index} className="px-2 py-1 rounded bg-muted text-[11px]">
                      {texto}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {actualEstrutura?.audio_sugerido && (
              <div>
                <p className="font-medium text-foreground">Áudio sugerido</p>
                <p className="whitespace-pre-wrap break-words">{actualEstrutura.audio_sugerido}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Roteiro textual simples */}
      {roteiroTexto && !roteiroCenas && !roteiroBlocos && (
        <Card>
          <CardHeader className="p-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5" />
                Roteiro
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(roteiroTexto, "Roteiro")}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{roteiroTexto}</p>
          </CardContent>
        </Card>
      )}

      {/* Legenda */}
      {actualConteudo?.legenda && (
        <Card>
          <CardHeader className="p-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-xs font-semibold flex-1 min-w-0 truncate">Legenda</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(actualConteudo.legenda!, "Legenda")}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{actualConteudo.legenda}</p>
          </CardContent>
        </Card>
      )}

      {/* Hashtags */}
      {hashtags && hashtags.length > 0 && (
        <Card>
          <CardHeader className="p-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-xs font-semibold flex-1 min-w-0 truncate">Hashtags</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(hashtags!.join(" "), "Hashtags")}
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, i) => (
                <span key={i} className="text-xs text-primary break-all">
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ImageGenerationModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        copy={`${data?.titulo || "Reel"}\n\n${actualRoteiro?.cenas?.[0]?.visual || ""}\n\n${actualConteudo?.legenda || ""}`}
        pilar="Alcançar"
        defaultFormat="reel_cover"
        onImageGenerated={(imageUrl) => {
          setGeneratedCoverImage(imageUrl);
          setIsGenerating(false);
          toast.success("Capa do reel gerada!");
          
          // Scroll suave até a imagem
          setTimeout(() => {
            const element = document.getElementById('generated-reel-cover');
            element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }}
      />
    </div>
  );
}
