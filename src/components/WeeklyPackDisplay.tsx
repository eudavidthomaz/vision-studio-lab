import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Image, Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageGenerationModal from "./ImageGenerationModal";
import { ShareContentDialog } from "./ShareContentDialog";

interface WeeklyPackProps {
  pack: {
    resumo?: string;
    frases_impactantes?: string[];
    stories?: Array<{
      dia: number;
      tipo: string;
      texto: string;
      versiculo?: string;
    }>;
    estudo_biblico?: {
      tema?: string;
      versiculos?: string[];
      perguntas?: string[];
    };
    legendas?: Array<{
      texto?: string;
      pilar_estrategico?: string;
      cta?: string;
      hashtags?: string[];
    }>;
    carrosseis?: Array<{
      titulo?: string;
      pilar_estrategico?: string;
      slides?: Array<string | {
        dia?: number;
        texto?: string;
        versiculo?: string;
      }>;
    }>;
    reels?: Array<{
      titulo?: string;
      pilar_estrategico?: string;
      roteiro?: string;
      duracao_estimada?: string;
      hook?: string;
    }>;
  };
  packId?: string;
}

const WeeklyPackDisplay = ({ pack, packId }: WeeklyPackProps) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<{ copy: string; pilar: string } | null>(null);
  const { toast } = useToast();

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado para a área de transferência.",
    });
  };

  const openImageModal = (copy: string, pilar: string) => {
    setSelectedContent({ copy, pilar });
    setImageModalOpen(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Pacote Semanal</h2>
        {packId && (
          <Button 
            onClick={() => setShareDialogOpen(true)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="resumo" className="w-full">
        <TabsList className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-1 sm:gap-2 h-auto bg-gray-800/50 p-1 sm:p-2">
          <TabsTrigger value="resumo" className="text-xs sm:text-sm px-2 sm:px-3">Resumo</TabsTrigger>
          <TabsTrigger value="frases" className="text-xs sm:text-sm px-2 sm:px-3">Frases</TabsTrigger>
          <TabsTrigger value="stories" className="text-xs sm:text-sm px-2 sm:px-3">Stories</TabsTrigger>
          <TabsTrigger value="estudo" className="text-xs sm:text-sm px-2 sm:px-3">Estudo</TabsTrigger>
          <TabsTrigger value="legendas" className="text-xs sm:text-sm px-2 sm:px-3">Legendas</TabsTrigger>
          <TabsTrigger value="carrosseis" className="text-xs sm:text-sm px-2 sm:px-3">Carrosséis</TabsTrigger>
          <TabsTrigger value="reels" className="text-xs sm:text-sm px-2 sm:px-3">Reels</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="mt-4 sm:mt-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl text-white">Resumo da Pregação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-gray-300 whitespace-pre-wrap">{pack.resumo}</p>
              <Button
                onClick={() => copyToClipboard(pack.resumo || '', 'resumo')}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                {copiedIndex === 'resumo' ? (
                  <><Check className="h-4 w-4 mr-2" /> Copiado</>
                ) : (
                  <><Copy className="h-4 w-4 mr-2" /> Copiar</>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frases" className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
          {pack.frases_impactantes?.map((frase, index) => (
            <Card key={index} className="bg-gray-800/50 border-gray-700 hover:border-primary/50 transition-colors">
              <CardContent className="pt-4 sm:pt-6">
                <p className="text-sm sm:text-base lg:text-lg text-gray-300 italic mb-3 sm:mb-4">"{frase}"</p>
                <Button
                  onClick={() => copyToClipboard(frase, `frase-${index}`)}
                  variant="outline"
                  size="sm"
                  className="h-8 sm:h-9"
                >
                  {copiedIndex === `frase-${index}` ? (
                    <><Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> <span className="text-xs sm:text-sm">Copiado</span></>
                  ) : (
                    <><Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> <span className="text-xs sm:text-sm">Copiar</span></>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="stories" className="mt-6 space-y-4">
          {pack.stories?.map((story, index) => (
            <Card key={index} className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Story #{index + 1} - Dia {story.dia}</CardTitle>
                <CardDescription className="text-gray-400">{story.tipo}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-gray-300 mb-4">{story.texto}</p>
                  {story.versiculo && (
                    <p className="text-sm text-gray-400 italic border-l-2 border-primary/30 pl-3">
                      {story.versiculo}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => copyToClipboard(story.texto, `story-${index}`)}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  {copiedIndex === `story-${index}` ? (
                    <><Check className="h-4 w-4 mr-2" /> Copiado</>
                  ) : (
                    <><Copy className="h-4 w-4 mr-2" /> Copiar</>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="estudo" className="mt-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">{pack.estudo_biblico?.tema}</CardTitle>
              <CardDescription className="text-gray-400">Estudo Bíblico Completo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Versículos</h3>
                <ul className="space-y-2">
                  {pack.estudo_biblico?.versiculos?.map((versiculo, index) => (
                    <li key={index} className="text-gray-300">• {versiculo}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Perguntas para Reflexão</h3>
                <ol className="space-y-2">
                  {pack.estudo_biblico?.perguntas?.map((pergunta, index) => (
                    <li key={index} className="text-gray-300">{index + 1}. {pergunta}</li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legendas" className="mt-6 space-y-4">
          {pack.legendas?.map((legenda, index) => {
            const fullText = `${legenda.texto}\n\n${legenda.cta}\n\n${legenda.hashtags?.join(' ') || ''}`;
            return (
              <Card key={index} className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6">
                  <p className="text-gray-300 mb-4 whitespace-pre-wrap">{legenda.texto}</p>
                  {legenda.cta && (
                    <p className="text-primary font-semibold mb-2">{legenda.cta}</p>
                  )}
                  {legenda.hashtags && legenda.hashtags.length > 0 && (
                    <p className="text-sm text-blue-400 mb-4">{legenda.hashtags.join(' ')}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(fullText, `legenda-${index}`)}
                      variant="outline"
                      size="sm"
                    >
                      {copiedIndex === `legenda-${index}` ? (
                        <><Check className="h-4 w-4 mr-2" /> Copiado</>
                      ) : (
                        <><Copy className="h-4 w-4 mr-2" /> Copiar</>
                      )}
                    </Button>
                    <Button
                      onClick={() => openImageModal(legenda.texto || '', legenda.pilar_estrategico || "Edificar")}
                      variant="outline"
                      size="sm"
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Gerar Imagem
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="carrosseis" className="mt-6 space-y-6">
          {pack.carrosseis?.map((carrossel, index) => (
            <Card key={index} className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">{carrossel.titulo}</CardTitle>
                {carrossel.pilar_estrategico && (
                  <CardDescription className="text-gray-400">{carrossel.pilar_estrategico}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {carrossel.slides?.map((slide, slideIndex) => {
                    // Normalizar slides: aceitar tanto string quanto objeto
                    const normalizedSlide = typeof slide === 'string' 
                      ? { texto: slide }
                      : slide;
                    
                    return (
                      <div key={slideIndex} className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                        <p className="text-sm text-gray-400 mb-2">
                          Slide {slideIndex + 1} {normalizedSlide.dia && `- Dia ${normalizedSlide.dia}`}
                        </p>
                        <p className="text-gray-300 mb-2">{normalizedSlide.texto}</p>
                        {normalizedSlide.versiculo && (
                          <p className="text-xs text-gray-500 italic border-l-2 border-primary/30 pl-2 mt-2">
                            {normalizedSlide.versiculo}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reels" className="mt-6 space-y-4">
          {pack.reels?.map((reel, index) => (
            <Card key={index} className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">{reel.titulo}</CardTitle>
                <CardDescription className="text-gray-400">
                  Duração: {reel.duracao_estimada}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reel.hook && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Hook:</h4>
                    <p className="text-gray-300">{reel.hook}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Roteiro:</h4>
                  <p className="text-gray-300 whitespace-pre-wrap">{reel.roteiro}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(reel.roteiro || '', `reel-${index}`)}
                    variant="outline"
                    size="sm"
                  >
                    {copiedIndex === `reel-${index}` ? (
                      <><Check className="h-4 w-4 mr-2" /> Copiado</>
                    ) : (
                      <><Copy className="h-4 w-4 mr-2" /> Copiar</>
                    )}
                  </Button>
                   <Button
                    onClick={() => openImageModal(reel.hook || reel.titulo || '', reel.pilar_estrategico || "Alcançar")}
                    variant="outline"
                    size="sm"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Gerar Capa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {packId && (
        <ShareContentDialog 
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          content={{ id: packId }}
          contentType="pack"
        />
      )}

      {selectedContent && (
        <ImageGenerationModal
          open={imageModalOpen}
          onOpenChange={setImageModalOpen}
          copy={selectedContent.copy}
          pilar={selectedContent.pilar}
        />
      )}
    </div>
  );
};

export default WeeklyPackDisplay;
