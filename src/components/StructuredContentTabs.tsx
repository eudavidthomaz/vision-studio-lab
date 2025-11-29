import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";

type StructuredModalidades = {
  blog?: {
    estrategia: string;
    titulo: string;
    resumo: string;
    corpo: string;
    ctas: string[];
    metadados: string[];
    suposicoes: string;
  };
  carrossel?: {
    estrategia: string;
    slides: string[];
    ctas: string[];
    metadados: string[];
    suposicoes: string;
  };
  email?: {
    assunto: string;
    preheader: string;
    corpo: string;
    cta: string;
    metadados: string[];
    suposicoes: string;
  };
  roteiro_video?: {
    gancho: string;
    apresentacao: string;
    pontos_chave: string[];
    fechamento: string;
    cta: string;
    sugestoes_cena: string | string[];
    metadados: string[];
    suposicoes: string;
  };
  post_curto?: {
    headline: string;
    corpo: string;
    cta: string;
    metadados: string[];
    suposicoes: string;
  };
  [key: string]: any;
};

interface StructuredContentTabsProps {
  modalidades: StructuredModalidades;
  checklist?: Record<string, any>;
  compact?: boolean;
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => toast.success("Bloco copiado"));
}

function renderBlock(label: string, content?: string | string[] | Record<string, any>) {
  if (!content) return null;

  const normalized = Array.isArray(content)
    ? content
        .filter(Boolean)
        .map((item, index) => `${index + 1}. ${item}`)
        .join("\n")
    : typeof content === "object"
      ? JSON.stringify(content, null, 2)
      : content;

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm">{label}</p>
        <Button variant="ghost" size="icon" onClick={() => copyText(normalized)}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{normalized}</p>
    </div>
  );
}

export function StructuredContentTabs({ modalidades, checklist, compact }: StructuredContentTabsProps) {
  const tabs = useMemo(() => Object.keys(modalidades || {}), [modalidades]);

  if (!tabs.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conteúdo estruturado não encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Gere novamente com o construtor para visualizar blocos multimodais.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue={tabs[0]} className={cn("w-full", compact && "text-sm")}> 
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <TabsList className="w-fit max-w-full overflow-x-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="capitalize">
              {tab.replace("_", " ")}
            </TabsTrigger>
          ))}
        </TabsList>
        {checklist && (
          <Badge variant="outline" className="gap-1">
            Checklist: {Object.keys(checklist).length} itens
          </Badge>
        )}
      </div>

      {tabs.map((tab) => {
        const bloco = modalidades[tab];
        if (!bloco) return null;

        const renderFormatBlocks = () => {
          switch (tab) {
            case "email":
              return (
                <div className="space-y-3">
                  {renderBlock("Assunto", bloco.assunto || bloco.titulo || bloco.headline)}
                  {renderBlock("Pré-header", bloco.preheader || bloco.resumo)}
                  {renderBlock("Corpo", bloco.corpo || bloco.texto)}
                  {renderBlock("CTA", bloco.cta || bloco.ctas)}
                  {renderBlock("Metadados", bloco.metadados || bloco.hashtags)}
                  {renderBlock("Suposições", bloco.suposicoes || bloco.assumptions)}
                </div>
              );
            case "carrossel":
              return (
                <div className="space-y-3">
                  {renderBlock("Estratégia", bloco.estrategia || bloco.gancho)}
                  {renderBlock("Slides", bloco.slides || bloco.corpo)}
                  {renderBlock("CTA", bloco.cta || bloco.ctas)}
                  {renderBlock("Metadados", bloco.metadados || bloco.hashtags)}
                  {renderBlock("Suposições", bloco.suposicoes || bloco.assumptions)}
                </div>
              );
            case "roteiro_video":
              return (
                <div className="space-y-3">
                  {renderBlock("Gancho", bloco.gancho || bloco.headline)}
                  {renderBlock("Apresentação", bloco.apresentacao || bloco.introducao)}
                  {renderBlock("Pontos-chave", bloco.pontos_chave || bloco.corpo)}
                  {renderBlock("Fechamento", bloco.fechamento || bloco.conclusao)}
                  {renderBlock("CTA", bloco.cta || bloco.ctas)}
                  {renderBlock("Sugestões de cena", bloco.sugestoes_cena)}
                  {renderBlock("Metadados", bloco.metadados || bloco.hashtags)}
                  {renderBlock("Suposições", bloco.suposicoes || bloco.assumptions)}
                </div>
              );
            case "post_curto":
              return (
                <div className="space-y-3">
                  {renderBlock("Headline", bloco.headline || bloco.titulo)}
                  {renderBlock("Corpo", bloco.corpo || bloco.texto)}
                  {renderBlock("CTA", bloco.cta || bloco.ctas)}
                  {renderBlock("Metadados", bloco.metadados || bloco.hashtags)}
                  {renderBlock("Suposições", bloco.suposicoes || bloco.assumptions)}
                </div>
              );
            default:
              return (
                <div className="space-y-3">
                  {renderBlock("Estratégia", bloco.estrategia || bloco.estrategia_geral)}
                  {renderBlock("Título/Headline", bloco.titulo || bloco.headline)}
                  {renderBlock("Resumo", bloco.resumo)}
                  {renderBlock("Corpo", bloco.corpo || bloco.secoes)}
                  {renderBlock("CTA x3", bloco.ctas || bloco.cta)}
                  {renderBlock("Metadados", bloco.metadados || bloco.hashtags)}
                  {renderBlock("Suposições", bloco.suposicoes || bloco.assumptions)}
                </div>
              );
          }
        };

        return (
          <TabsContent key={tab} value={tab} className="space-y-3">
            <ScrollArea className="max-h-[70vh] pr-2">{renderFormatBlocks()}</ScrollArea>
            {checklist && (
              <div className="rounded-lg border p-3 space-y-2">
                <p className="text-sm font-semibold">Checklist de qualidade</p>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {Object.entries(checklist).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="capitalize">{key.replace(/_/g, " ")}</span>
                      <Badge variant={value ? "default" : "outline"}>{value ? "ok" : "pendente"}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
