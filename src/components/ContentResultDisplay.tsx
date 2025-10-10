import { useState } from "react";
import { Book, Edit3, Palette, Lightbulb, Copy, Save, RotateCw, Image } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
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

  // Detectar tipo de conteúdo
  const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
  const contentType = parsedContent.calendario_editorial ? 'calendario'
    : parsedContent.convite ? 'convite'
    : parsedContent.aviso ? 'aviso'
    : parsedContent.guia ? 'guia'
    : parsedContent.esboco ? 'esboco'
    : parsedContent.versiculos_citados ? 'versiculos_citados'
    : parsedContent.trilha_oracao ? 'trilha_oracao'
    : parsedContent.perguntas_respostas ? 'qa_estruturado'
    : parsedContent.convite_grupos ? 'convite_grupos'
    : parsedContent.plano_discipulado ? 'discipulado'
    : parsedContent.ideia_estrategica ? 'ideia_estrategica'
    : parsedContent.desafio_semanal ? 'desafio_semanal'
    : parsedContent.estudo_biblico ? 'estudo'
    : parsedContent.resumo_pregacao ? 'resumo'
    : 'default';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const openImageModal = (copy: string) => {
    setSelectedContent({ copy, pilar: parsedContent.conteudo?.pilar || 'EDIFICAR' });
    setImageModalOpen(true);
  };

  // Organizational formats (no fundamento_biblico)
  if (contentType === 'calendario') return <CalendarioView calendario={parsedContent.calendario_editorial} />;
  if (contentType === 'convite') return <ConviteView convite={parsedContent.convite} />;
  if (contentType === 'aviso') return <AvisoView aviso={parsedContent.aviso} />;
  if (contentType === 'guia') return <GuiaView guia={parsedContent.guia} />;
  if (contentType === 'convite_grupos') return <ConviteGruposView convite={parsedContent.convite_grupos} />;
  if (contentType === 'versiculos_citados') return <VersiculosCitadosView versiculos={parsedContent.versiculos_citados} />;

  // Biblical formats (with fundamento_biblico)
  if (contentType === 'esboco') return <EsbocoView esboco={parsedContent.esboco} />;
  if (contentType === 'trilha_oracao') return <TrilhaOracaoView trilha={parsedContent.trilha_oracao} />;
  if (contentType === 'qa_estruturado') return <QAEstruturadoView qa={parsedContent.perguntas_respostas} />;
  if (contentType === 'discipulado') return <DiscipuladoView plano={parsedContent.plano_discipulado} />;

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
