import { useState } from "react";
import { Book, Edit3, Palette, Lightbulb, Copy, Save, RotateCw, Image, BookOpen, Instagram, Layout, Video, Sparkles, MessageSquare, Zap, Hash } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { toast } from "sonner";
import ImageGenerationModal from "./ImageGenerationModal";
import { EstudoBiblicoView } from "./content-views/EstudoBiblicoView";
import { ResumoPregacaoView } from "./content-views/ResumoPregacaoView";
import { IdeiaEstrategicaView } from "./content-views/IdeiaEstrategicaView";
import { DesafioSemanalView } from "./content-views/DesafioSemanalView";
import { CalendarioView } from "./content-views/CalendarioView";
import { ConviteView } from "./content-views/ConviteView";
import { AvisoView } from "./content-views/AvisoView";
import { GuiaView } from "./content-views/GuiaView";
import { EsbocoView } from "./content-views/EsbocoView";
import { VersiculosCitadosView } from "./content-views/VersiculosCitadosView";
import { TrilhaOracaoView } from "./content-views/TrilhaOracaoView";
import { QAEstruturadoView } from "./content-views/QAEstruturadoView";
import { ConviteGruposView } from "./content-views/ConviteGruposView";
import { DiscipuladoView } from "./content-views/DiscipuladoView";

interface ContentResultProps {
  content: any; // Tipo dinâmico baseado no content_type
  onSave: () => void;
  onRegenerate: () => void;
  isSaving: boolean;
}

export const ContentResultDisplay = ({ content, onSave, onRegenerate, isSaving }: ContentResultProps) => {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<{ copy: string; pilar: string } | null>(null);

  // Parse content - handle both string and object, and extract from array if needed
  const parsedContent = (() => {
    let parsed = typeof content === 'string' ? JSON.parse(content) : content;
    
    // If it's an array (structure from database), get first item
    if (Array.isArray(parsed)) {
      parsed = parsed[0];
    }
    
    return parsed;
  })();
  
  // Detect content type - prioritize explicit content_type, then infer from structure
  const contentType = 
    parsedContent.content_type ||
    (parsedContent.resumo_pregacao && parsedContent.versiculos_base && parsedContent.legendas_instagram) ? 'pack_semanal' :
    parsedContent.calendario_editorial ? 'calendario' :
    parsedContent.convite ? 'convite' :
    parsedContent.aviso ? 'aviso' :
    parsedContent.guia ? 'guia' :
    parsedContent.esboco ? 'esboco' :
    parsedContent.versiculos_citados ? 'versiculos_citados' :
    parsedContent.trilha_oracao ? 'trilha_oracao' :
    parsedContent.perguntas_respostas ? 'qa_estruturado' :
    parsedContent.convite_grupos ? 'convite_grupos' :
    parsedContent.plano_discipulado ? 'discipulado' :
    parsedContent.ideia_estrategica ? 'ideia_estrategica' :
    parsedContent.desafio_semanal ? 'desafio_semanal' :
    parsedContent.estudo_biblico ? 'estudo' :
    parsedContent.resumo_pregacao ? 'resumo' :
    'default';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const openImageModal = (copy: string) => {
    setSelectedContent({ copy, pilar: parsedContent.conteudo?.pilar || 'EDIFICAR' });
    setImageModalOpen(true);
  };

  // Organizational formats (no fundamento_biblico)
  if (contentType === 'calendario') {
    return (
      <>
        <CalendarioView calendario={parsedContent.calendario_editorial} />
        <div className="flex flex-wrap gap-3 mt-6">
          <Button onClick={onSave} disabled={isSaving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar na Biblioteca"}
          </Button>
          <Button onClick={onRegenerate} variant="outline" size="lg">
            <RotateCw className="w-4 h-4 mr-2" />
            Regenerar
          </Button>
        </div>
      </>
    );
  }

  if (contentType === 'convite') {
    return (
      <>
        <ConviteView convite={parsedContent.convite} />
        <div className="flex flex-wrap gap-3 mt-6">
          <Button onClick={onSave} disabled={isSaving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar na Biblioteca"}
          </Button>
          <Button onClick={onRegenerate} variant="outline" size="lg">
            <RotateCw className="w-4 h-4 mr-2" />
            Regenerar
          </Button>
        </div>
      </>
    );
  }

  if (contentType === 'aviso') {
    return (
      <>
        <AvisoView aviso={parsedContent.aviso} />
        <div className="flex flex-wrap gap-3 mt-6">
          <Button onClick={onSave} disabled={isSaving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar na Biblioteca"}
          </Button>
          <Button onClick={onRegenerate} variant="outline" size="lg">
            <RotateCw className="w-4 h-4 mr-2" />
            Regenerar
          </Button>
        </div>
      </>
    );
  }

  if (contentType === 'guia') {
    return (
      <>
        <GuiaView guia={parsedContent.guia} />
        <div className="flex flex-wrap gap-3 mt-6">
          <Button onClick={onSave} disabled={isSaving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar na Biblioteca"}
          </Button>
          <Button onClick={onRegenerate} variant="outline" size="lg">
            <RotateCw className="w-4 h-4 mr-2" />
            Regenerar
          </Button>
        </div>
      </>
    );
  }

  if (contentType === 'convite_grupos') {
    return (
      <>
        <ConviteGruposView convite={parsedContent.convite_grupos} />
        <div className="flex flex-wrap gap-3 mt-6">
          <Button onClick={onSave} disabled={isSaving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar na Biblioteca"}
          </Button>
          <Button onClick={onRegenerate} variant="outline" size="lg">
            <RotateCw className="w-4 h-4 mr-2" />
            Regenerar
          </Button>
        </div>
      </>
    );
  }

  if (contentType === 'versiculos_citados') {
    return (
      <>
        <VersiculosCitadosView versiculos={parsedContent.versiculos_citados} />
        <div className="flex flex-wrap gap-3 mt-6">
          <Button onClick={onSave} disabled={isSaving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar na Biblioteca"}
          </Button>
          <Button onClick={onRegenerate} variant="outline" size="lg">
            <RotateCw className="w-4 h-4 mr-2" />
            Regenerar
          </Button>
        </div>
      </>
    );
  }

  // Biblical formats (with fundamento_biblico)
  if (contentType === 'esboco') {
    return (
      <>
        <EsbocoView esboco={parsedContent.esboco} />
        <div className="flex flex-wrap gap-3 mt-6">
          <Button onClick={onSave} disabled={isSaving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar na Biblioteca"}
          </Button>
          <Button onClick={onRegenerate} variant="outline" size="lg">
            <RotateCw className="w-4 h-4 mr-2" />
            Regenerar
          </Button>
        </div>
      </>
    );
  }

  if (contentType === 'trilha_oracao') {
    return (
      <>
        <TrilhaOracaoView trilha={parsedContent.trilha_oracao} />
        <div className="flex flex-wrap gap-3 mt-6">
          <Button onClick={onSave} disabled={isSaving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar na Biblioteca"}
          </Button>
          <Button onClick={onRegenerate} variant="outline" size="lg">
            <RotateCw className="w-4 h-4 mr-2" />
            Regenerar
          </Button>
        </div>
      </>
    );
  }

  if (contentType === 'qa_estruturado') {
    return (
      <>
        <QAEstruturadoView qa={parsedContent.perguntas_respostas} />
        <div className="flex flex-wrap gap-3 mt-6">
          <Button onClick={onSave} disabled={isSaving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar na Biblioteca"}
          </Button>
          <Button onClick={onRegenerate} variant="outline" size="lg">
            <RotateCw className="w-4 h-4 mr-2" />
            Regenerar
          </Button>
        </div>
      </>
    );
  }

  if (contentType === 'discipulado') {
    return (
      <>
        <DiscipuladoView plano={parsedContent.plano_discipulado} />
        <div className="flex flex-wrap gap-3 mt-6">
          <Button onClick={onSave} disabled={isSaving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar na Biblioteca"}
          </Button>
          <Button onClick={onRegenerate} variant="outline" size="lg">
            <RotateCw className="w-4 h-4 mr-2" />
            Regenerar
          </Button>
        </div>
      </>
    );
  }

  if (contentType === 'ideia_estrategica' && parsedContent.ideia_estrategica) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Fundamento Bíblico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-sm">Versículos-base:</h4>
              <ul className="space-y-2">
                {content.fundamento_biblico.versiculos.map((v: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground border-l-2 border-primary pl-3">
                    {v}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Contexto:</h4>
              <p className="text-sm text-muted-foreground">{content.fundamento_biblico.contexto}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Princípio Atemporal:</h4>
              <p className="text-sm text-muted-foreground">{content.fundamento_biblico.principio_atemporal}</p>
            </div>
          </CardContent>
        </Card>
        
        <IdeiaEstrategicaView data={content.ideia_estrategica} />
        
        <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4 -mx-4 md:mx-0 md:border md:rounded-lg flex flex-col sm:flex-row gap-3">
          <Button onClick={onSave} disabled={isSaving} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar na Biblioteca"}
          </Button>
          <Button onClick={onRegenerate} variant="outline" className="flex-1">
            <RotateCw className="w-4 h-4 mr-2" />
            Regenerar
          </Button>
        </div>
      </div>
    );
  }
  
  if (contentType === 'estudo') {
    return (
      <div className="space-y-6">
        <EstudoBiblicoView data={content} />
        <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4 -mx-4 md:mx-0 md:border md:rounded-lg flex flex-col sm:flex-row gap-3">
          <Button onClick={onSave} disabled={isSaving} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar na Biblioteca"}
          </Button>
          <Button onClick={onRegenerate} variant="outline" className="flex-1">
            <RotateCw className="w-4 h-4 mr-2" />
            Regenerar
          </Button>
        </div>
      </div>
    );
  }

  if (contentType === 'resumo') {
    return (
      <div className="space-y-6">
        <ResumoPregacaoView data={content} />
        <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4 -mx-4 md:mx-0 md:border md:rounded-lg flex flex-col sm:flex-row gap-3">
          <Button onClick={onSave} disabled={isSaving} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar na Biblioteca"}
          </Button>
          <Button onClick={onRegenerate} variant="outline" className="flex-1">
            <RotateCw className="w-4 h-4 mr-2" />
            Regenerar
          </Button>
        </div>
      </div>
    );
  }

  if (contentType === 'desafio_semanal' && content.desafio_semanal) {
    return <DesafioSemanalView data={content} onSave={onSave} onRegenerate={onRegenerate} isSaving={isSaving} />;
  }

  // Pack Semanal - Comprehensive Weekly Content Pack
  if (contentType === 'pack_semanal') {
    const pack = parsedContent;

    const copyAllVerses = () => {
      const formatted = pack.versiculos_base.map((v: string, i: number) => `${i + 1}. ${v}`).join('\n\n');
      copyToClipboard(formatted, "Versículos copiados");
    };

    const copyFullReel = (reel: any) => {
      const formatted = `🎬 GANCHO:\n${reel.gancho}\n\n📝 DESENVOLVIMENTO:\n${reel.desenvolvimento}\n\n🎯 CTA:\n${reel.cta}`;
      copyToClipboard(formatted, "Roteiro copiado");
    };

    const copyAllSlides = (carousel: any) => {
      const formatted = carousel.slides.map((s: string, i: number) => `Slide ${i + 1}:\n${s}`).join('\n\n---\n\n');
      copyToClipboard(formatted, "Slides copiados");
    };

    const copyAllPhrases = () => {
      const formatted = pack.frases_impacto.join('\n\n');
      copyToClipboard(formatted, "Frases copiadas");
    };

    const copyAllHashtags = () => {
      const formatted = pack.hashtags_sugeridas.join(' ');
      copyToClipboard(formatted, "Hashtags copiadas");
    };

    const copyEntirePack = () => {
      const formatted = `
📖 RESUMO DA PREGAÇÃO
${pack.resumo_pregacao}

📜 VERSÍCULOS BASE
${pack.versiculos_base.map((v: string, i: number) => `${i + 1}. ${v}`).join('\n')}

📱 LEGENDAS INSTAGRAM
${pack.legendas_instagram.map((c: any, i: number) => `\n${i + 1}. [${c.tipo}]\n${c.texto}\nCTA: ${c.cta}`).join('\n---\n')}

🎠 CARROSSÉIS
${pack.carrosseis_instagram.map((car: any, i: number) => `\n${i + 1}. ${car.titulo}\n${car.slides.map((s: string, j: number) => `Slide ${j + 1}: ${s}`).join('\n')}`).join('\n---\n')}

🎥 ROTEIROS DE REELS
${pack.roteiros_reels.map((r: any, i: number) => `\n${i + 1}.\nGancho: ${r.gancho}\nDesenvolvimento: ${r.desenvolvimento}\nCTA: ${r.cta}`).join('\n---\n')}

⚡ FRASES DE IMPACTO
${pack.frases_impacto.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

#️⃣ HASHTAGS
${pack.hashtags_sugeridas.join(' ')}
      `.trim();
      
      copyToClipboard(formatted, "Pack completo copiado");
    };

    return (
      <div className="space-y-8">
        {/* Hero Section - Resumo */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              <CardTitle>Resumo da Pregação</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">{pack.resumo_pregacao}</p>
          </CardContent>
        </Card>

        {/* Versículos Base */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Book className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Versículos Base</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={copyAllVerses}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Todos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pack.versiculos_base.map((verse: string, idx: number) => (
              <div key={idx} className="group relative p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <p className="text-sm pr-8">{verse}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={() => copyToClipboard(verse, "Versículo copiado")}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tabs para diferentes tipos de conteúdo */}
        <Tabs defaultValue="legendas" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="legendas">
              <Instagram className="w-4 h-4 mr-2" />
              Legendas
            </TabsTrigger>
            <TabsTrigger value="carrosseis">
              <Layout className="w-4 h-4 mr-2" />
              Carrosséis
            </TabsTrigger>
            <TabsTrigger value="reels">
              <Video className="w-4 h-4 mr-2" />
              Reels
            </TabsTrigger>
            <TabsTrigger value="extras">
              <Sparkles className="w-4 h-4 mr-2" />
              Extras
            </TabsTrigger>
          </TabsList>

          {/* Tab: Legendas */}
          <TabsContent value="legendas" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {pack.legendas_instagram.map((caption: any, idx: number) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{caption.tipo}</Badge>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(caption.texto, "Legenda copiada")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openImageModal(caption.texto)}
                        >
                          <Image className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {caption.texto}
                    </p>
                    {caption.cta && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <MessageSquare className="w-3 h-3" />
                          CTA: {caption.cta}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab: Carrosséis */}
          <TabsContent value="carrosseis" className="mt-6">
            <div className="space-y-4">
              {pack.carrosseis_instagram.map((carousel: any, idx: number) => (
                <Accordion key={idx} type="single" collapsible>
                  <AccordionItem value={`carousel-${idx}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 w-full">
                        <Badge className="rounded-full">{idx + 1}</Badge>
                        <span className="font-semibold">{carousel.titulo}</span>
                        <Badge variant="outline" className="ml-auto mr-4">
                          {carousel.slides.length} slides
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-4">
                        {carousel.slides.map((slide: string, slideIdx: number) => (
                          <div key={slideIdx} className="group relative p-4 bg-card border rounded-lg">
                            <div className="flex items-start gap-3">
                              <Badge variant="secondary" className="mt-1">
                                Slide {slideIdx + 1}
                              </Badge>
                              <p className="flex-1 text-sm">{slide}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyToClipboard(slide, "Slide copiado")}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => copyAllSlides(carousel)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar Todos os Slides
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => openImageModal(carousel.slides.join('\n\n'))}
                          >
                            <Image className="w-4 h-4 mr-2" />
                            Gerar Imagem
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
          </TabsContent>

          {/* Tab: Reels */}
          <TabsContent value="reels" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {pack.roteiros_reels.map((reel: any, idx: number) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="w-5 h-5 text-primary" />
                        <CardTitle className="text-base">Roteiro {idx + 1}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyFullReel(reel)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default">Gancho</Badge>
                      </div>
                      <p className="text-sm bg-primary/5 p-3 rounded-lg">
                        {reel.gancho}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">Desenvolvimento</Badge>
                      </div>
                      <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">
                        {reel.desenvolvimento}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">CTA</Badge>
                      </div>
                      <p className="text-sm border p-3 rounded-lg">
                        {reel.cta}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab: Extras */}
          <TabsContent value="extras" className="mt-6">
            <div className="space-y-6">
              {/* Frases de Impacto */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">Frases de Impacto</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={copyAllPhrases}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Todas
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {pack.frases_impacto.map((phrase: string, idx: number) => (
                      <div
                        key={idx}
                        className="group relative p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/10 hover:border-primary/30 transition-all"
                      >
                        <p className="text-sm font-medium pr-8">{phrase}</p>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyToClipboard(phrase, "Frase copiada")}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openImageModal(phrase)}
                          >
                            <Image className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Hashtags */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">Hashtags Sugeridas</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={copyAllHashtags}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Todas
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {pack.hashtags_sugeridas.map((tag: string, idx: number) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => copyToClipboard(tag, "Hashtag copiada")}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Botões de Ação Globais */}
        <Card>
          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button onClick={onSave} disabled={isSaving} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar Pack Completo"}
            </Button>
            <Button onClick={onRegenerate} variant="outline" className="flex-1">
              <RotateCw className="w-4 h-4 mr-2" />
              Regenerar Pack
            </Button>
            <Button onClick={copyEntirePack} variant="secondary">
              <Copy className="w-4 h-4 mr-2" />
              Copiar Tudo
            </Button>
          </CardFooter>
        </Card>

        {/* Image Generation Modal */}
        <ImageGenerationModal
          open={imageModalOpen}
          onOpenChange={setImageModalOpen}
          copy={selectedContent?.copy || ""}
          pilar={selectedContent?.pilar || "EDIFICAR"}
        />
      </div>
    );
  }

  // Fallback when content type is not recognized
  if (contentType === 'default' && !parsedContent.fundamento_biblico && !parsedContent.conteudo) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              ⚠️ Formato de conteúdo não reconhecido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Este conteúdo foi gerado em um formato que ainda não tem visualização específica. 
              Você ainda pode copiar os dados abaixo:
            </p>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-96">
              {JSON.stringify(parsedContent, null, 2)}
            </pre>
            <div className="flex gap-2">
              <Button 
                onClick={() => copyToClipboard(JSON.stringify(parsedContent, null, 2), "Conteúdo")}
                variant="outline"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar JSON
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex gap-3">
          <Button onClick={onSave} disabled={isSaving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
          <Button onClick={onRegenerate} variant="outline" size="lg">
            <RotateCw className="w-4 h-4 mr-2" />
            Regenerar
          </Button>
        </div>
      </div>
    );
  }

  // Validação para formato de redes sociais
  if (!content.conteudo) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Formato de conteúdo não reconhecido. Tente gerar novamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  const copyAll = () => {
    const allText = `
📖 FUNDAMENTO BÍBLICO

${content.fundamento_biblico.versiculos.join('\n\n')}

Contexto: ${content.fundamento_biblico.contexto}

Princípio: ${content.fundamento_biblico.principio}

---

✍️ CONTEÚDO

${content.conteudo.legenda}

---

${content.estrutura_visual?.cards ? `
🎨 CARDS DO CARROSSEL

${content.estrutura_visual.cards.map((card, i) => `
Card ${i + 1}:
${card.titulo}
${card.texto}
`).join('\n')}

---
` : ''}

${content.estrutura_visual?.roteiro ? `
🎬 ROTEIRO

${content.estrutura_visual.roteiro}

---
` : ''}

💡 DICAS DE PRODUÇÃO

Formato: ${content.dica_producao.formato}
Estilo: ${content.dica_producao.estilo}
Melhor horário: ${content.dica_producao.horario}

Hashtags: ${content.dica_producao.hashtags.join(' ')}
`;
    copyToClipboard(allText, "Conteúdo completo");
  };

  return (
    <div className="space-y-6">
      {/* Fundamento Bíblico */}
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

      {/* Conteúdo Criativo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              Conteúdo Criativo
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary">{content.conteudo.tipo}</Badge>
              <Badge>{content.conteudo.pilar}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {content.conteudo.legenda}
            </p>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(content.conteudo.legenda, "Legenda")}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Legenda
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openImageModal(content.conteudo.legenda)}
            >
              <Image className="w-4 h-4 mr-2" />
              Gerar Imagem
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estrutura Visual */}
      {(content.estrutura_visual?.cards || content.estrutura_visual?.roteiro) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Estrutura Visual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.estrutura_visual.cards && (
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
            )}
            
            {content.estrutura_visual.roteiro && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Roteiro do Vídeo</h4>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {content.estrutura_visual.roteiro}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dica de Produção */}
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
            <div>
              <h4 className="font-semibold text-sm mb-1">Melhor Horário</h4>
              <p className="text-sm text-muted-foreground">{content.dica_producao.horario}</p>
            </div>
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

      {/* Ações */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4 -mx-4 md:mx-0 md:border md:rounded-lg flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="flex-1"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Salvando..." : "Salvar na Biblioteca"}
        </Button>
        <Button
          onClick={copyAll}
          variant="outline"
          className="flex-1"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copiar Tudo
        </Button>
        <Button
          onClick={onRegenerate}
          variant="outline"
          className="flex-1"
        >
          <RotateCw className="w-4 h-4 mr-2" />
          Regenerar
        </Button>
      </div>

      {/* Image Generation Modal */}
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
