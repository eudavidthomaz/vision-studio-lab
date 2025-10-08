import { useState } from "react";
import { Book, Edit3, Palette, Lightbulb, Copy, Image, Calendar, BookOpen } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import ImageGenerationModal from "./ImageGenerationModal";

interface UnifiedContentDisplayProps {
  content: {
    source_type?: string;
    source_metadata?: any;
    fundamento_biblico: {
      versiculos: string[];
      contexto: string;
      principio: string;
    };
    conteudo: {
      tipo?: string;
      legenda?: string;
      resumo_pregacao?: string;
      frases_impactantes?: string[];
      pilar: string;
    };
    estrutura_visual?: {
      cards?: Array<{ titulo: string; texto: string }>;
      roteiro?: string;
      stories?: string[];
      carrosseis?: Array<{
        titulo: string;
        slides: Array<{ texto: string; sugestao_imagem?: string }>;
      }>;
      reels?: Array<{
        titulo: string;
        roteiro: string;
        hook: string;
        duracao: string;
      }>;
      legendas?: Array<{
        texto: string;
        pilar: string;
        cta: string;
        hashtags: string[];
      }>;
    };
    dica_producao: {
      formato: string;
      estilo: string;
      horario?: string;
      hashtags: string[];
      estudo_biblico_detalhado?: {
        tema: string;
        versiculos_principais: string[];
        perguntas_reflexao: string[];
        plano_devocional?: {
          duracao: string;
          dias: Array<{
            dia: number;
            tema: string;
            leitura_biblica: string;
            reflexao: string;
            oracao_sugerida: string;
          }>;
        };
        livros_recomendados?: Array<{
          titulo: string;
          autor: string;
          tema_relacionado: string;
          para_quem: string;
        }>;
      };
    };
  };
}

export const UnifiedContentDisplay = ({ content }: UnifiedContentDisplayProps) => {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<{ 
    copy: string; 
    pilar: string;
    mode?: 'single' | 'carousel';
    slides?: Array<{ texto: string }>;
  } | null>(null);

  const isTranscript = content.source_type === 'transcript';
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const openImageModal = (copy: string, mode: 'single' | 'carousel' = 'single', slides?: Array<{ texto: string }>) => {
    setSelectedContent({ 
      copy, 
      pilar: content.conteudo.pilar,
      mode,
      slides
    });
    setImageModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="fundamento" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="fundamento">📖 Base</TabsTrigger>
          <TabsTrigger value="conteudo">✍️ Conteúdo</TabsTrigger>
          <TabsTrigger value="posts">🎨 Posts</TabsTrigger>
          <TabsTrigger value="stories">📱 Stories</TabsTrigger>
          <TabsTrigger value="carrosseis">🎞️ Carrosséis</TabsTrigger>
          <TabsTrigger value="reels">🎬 Reels</TabsTrigger>
          <TabsTrigger value="estudo">📚 Estudo</TabsTrigger>
        </TabsList>

        {/* Fundamento Bíblico */}
        <TabsContent value="fundamento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5 text-primary" />
                Fundamento Bíblico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {content.fundamento_biblico.versiculos.map((versiculo, idx) => (
                  <div key={idx} className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                    <p className="text-sm leading-relaxed italic">{versiculo}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => copyToClipboard(versiculo, "Versículo")}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copiar
                    </Button>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Contexto Histórico</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {content.fundamento_biblico.contexto}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Princípio Atemporal</h4>
                <p className="text-sm font-medium text-primary">
                  {content.fundamento_biblico.principio}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conteúdo */}
        <TabsContent value="conteudo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" />
                {isTranscript ? 'Resumo e Frases' : 'Conteúdo Criativo'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isTranscript && content.conteudo.resumo_pregacao && (
                <>
                  <div>
                    <h4 className="font-semibold mb-2">Resumo da Pregação</h4>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {content.conteudo.resumo_pregacao}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => copyToClipboard(content.conteudo.resumo_pregacao!, "Resumo")}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                  <Separator />
                </>
              )}

              {isTranscript && content.conteudo.frases_impactantes && (
                <div>
                  <h4 className="font-semibold mb-3">Frases Impactantes</h4>
                  <div className="space-y-2">
                    {content.conteudo.frases_impactantes.map((frase, idx) => (
                      <div key={idx} className="p-3 bg-muted/50 rounded-lg border-l-2 border-primary">
                        <p className="text-sm font-medium">{frase}</p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(frase, "Frase")}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copiar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openImageModal(frase)}
                          >
                            <Image className="w-3 h-3 mr-1" />
                            Imagem
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isTranscript && content.conteudo.legenda && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {content.conteudo.legenda}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(content.conteudo.legenda!, "Legenda")}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openImageModal(content.conteudo.legenda!)}
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Gerar Imagem
                    </Button>
                  </div>
                </div>
              )}
              
              <Badge className="mt-2">{content.conteudo.pilar}</Badge>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Posts/Legendas */}
        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Legendas para Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {content.estrutura_visual?.legendas ? (
                <div className="space-y-4">
                  {content.estrutura_visual.legendas.map((legenda, idx) => (
                    <div key={idx} className="p-4 bg-muted/50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge>{legenda.pilar}</Badge>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{legenda.texto}</p>
                      <div className="flex flex-wrap gap-2">
                        {legenda.hashtags.map((tag, i) => (
                          <Badge key={i} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground italic">CTA: {legenda.cta}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(`${legenda.texto}\n\n${legenda.hashtags.join(' ')}`, "Legenda")}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copiar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openImageModal(legenda.texto)}
                        >
                          <Image className="w-3 h-3 mr-1" />
                          Imagem
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma legenda disponível para este conteúdo.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stories */}
        <TabsContent value="stories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ideias para Stories</CardTitle>
            </CardHeader>
            <CardContent>
              {content.estrutura_visual?.stories ? (
                <div className="space-y-3">
                  {content.estrutura_visual.stories.map((story, idx) => (
                    <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm mb-3">{story}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(story, "Story")}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copiar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openImageModal(story)}
                        >
                          <Image className="w-3 h-3 mr-1" />
                          Gerar Imagem
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma ideia de story disponível.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Carrosséis */}
        <TabsContent value="carrosseis" className="space-y-4">
          {content.estrutura_visual?.carrosseis ? (
            content.estrutura_visual.carrosseis.map((carrossel, cIdx) => (
              <Card key={cIdx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{carrossel.titulo}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openImageModal(carrossel.titulo, 'carousel', carrossel.slides)}
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Gerar Todas as Imagens
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {carrossel.slides.map((slide, sIdx) => (
                      <div key={sIdx} className="p-4 bg-muted/50 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">Slide {sIdx + 1}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openImageModal(slide.texto)}
                          >
                            <Image className="w-3 h-3 mr-1" />
                            Gerar
                          </Button>
                        </div>
                        <p className="text-sm mb-2">{slide.texto}</p>
                        {slide.sugestao_imagem && (
                          <p className="text-xs text-muted-foreground italic">
                            💡 Sugestão: {slide.sugestao_imagem}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : content.estrutura_visual?.cards ? (
            <Card>
              <CardHeader>
                <CardTitle>Cards do Carrossel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {content.estrutura_visual.cards.map((card, idx) => (
                    <div key={idx} className="p-4 bg-muted/50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">Card {idx + 1}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openImageModal(`${card.titulo}\n\n${card.texto}`)}
                        >
                          <Image className="w-3 h-3 mr-1" />
                          Gerar
                        </Button>
                      </div>
                      <h4 className="font-semibold mb-2">{card.titulo}</h4>
                      <p className="text-sm text-muted-foreground">{card.texto}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-sm text-muted-foreground text-center">Nenhum carrossel disponível.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reels */}
        <TabsContent value="reels" className="space-y-4">
          {content.estrutura_visual?.reels ? (
            content.estrutura_visual.reels.map((reel, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>{reel.titulo}</CardTitle>
                  <Badge variant="secondary">{reel.duracao}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">🎣 Hook (Gancho Inicial)</h4>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm">{reel.hook}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">📝 Roteiro Completo</h4>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{reel.roteiro}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(reel.roteiro, "Roteiro")}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Roteiro
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openImageModal(reel.hook)}
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Gerar Capa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : content.estrutura_visual?.roteiro ? (
            <Card>
              <CardHeader>
                <CardTitle>Roteiro do Vídeo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {content.estrutura_visual.roteiro}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => copyToClipboard(content.estrutura_visual!.roteiro!, "Roteiro")}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-sm text-muted-foreground text-center">Nenhum reel disponível.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Estudo Bíblico */}
        <TabsContent value="estudo" className="space-y-4">
          {content.dica_producao.estudo_biblico_detalhado ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    {content.dica_producao.estudo_biblico_detalhado.tema}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Versículos Principais</h4>
                    <div className="space-y-2">
                      {content.dica_producao.estudo_biblico_detalhado.versiculos_principais.map((v, i) => (
                        <div key={i} className="p-3 bg-muted/50 rounded-lg text-sm">{v}</div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Perguntas para Reflexão</h4>
                    <ol className="space-y-2 list-decimal list-inside">
                      {content.dica_producao.estudo_biblico_detalhado.perguntas_reflexao.map((p, i) => (
                        <li key={i} className="text-sm text-muted-foreground">{p}</li>
                      ))}
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {content.dica_producao.estudo_biblico_detalhado.plano_devocional && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Plano Devocional ({content.dica_producao.estudo_biblico_detalhado.plano_devocional.duracao})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {content.dica_producao.estudo_biblico_detalhado.plano_devocional.dias.map((dia, i) => (
                        <div key={i} className="p-4 bg-muted/50 rounded-lg space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge>Dia {dia.dia}</Badge>
                            <h5 className="font-semibold">{dia.tema}</h5>
                          </div>
                          <p className="text-sm"><strong>Leitura:</strong> {dia.leitura_biblica}</p>
                          <p className="text-sm"><strong>Reflexão:</strong> {dia.reflexao}</p>
                          <p className="text-sm"><strong>Oração:</strong> {dia.oracao_sugerida}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {content.dica_producao.estudo_biblico_detalhado.livros_recomendados && (
                <Card>
                  <CardHeader>
                    <CardTitle>📚 Livros Recomendados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {content.dica_producao.estudo_biblico_detalhado.livros_recomendados.map((livro, i) => (
                        <div key={i} className="p-4 bg-muted/50 rounded-lg">
                          <h5 className="font-semibold">{livro.titulo}</h5>
                          <p className="text-sm text-muted-foreground">por {livro.autor}</p>
                          <p className="text-xs mt-2">{livro.tema_relacionado}</p>
                          <Badge variant="outline" className="mt-2">{livro.para_quem}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-sm text-muted-foreground text-center">
                  Estudo bíblico detalhado não disponível para este conteúdo.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Dicas de Produção */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Dicas de Produção
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Formato</h4>
                  <p className="text-sm text-muted-foreground">{content.dica_producao.formato}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Estilo Visual</h4>
                  <p className="text-sm text-muted-foreground">{content.dica_producao.estilo}</p>
                </div>
                {content.dica_producao.horario && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Melhor Horário</h4>
                    <p className="text-sm text-muted-foreground">{content.dica_producao.horario}</p>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Hashtags Estratégicas</h4>
                <div className="flex flex-wrap gap-2">
                  {content.dica_producao.hashtags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => copyToClipboard(content.dica_producao.hashtags.join(' '), "Hashtags")}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Hashtags
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Image Generation Modal */}
      {selectedContent && (
        <ImageGenerationModal
          open={imageModalOpen}
          onOpenChange={setImageModalOpen}
          copy={selectedContent.copy}
          pilar={selectedContent.pilar}
          mode={selectedContent.mode}
          slides={selectedContent.slides}
        />
      )}
    </div>
  );
};
