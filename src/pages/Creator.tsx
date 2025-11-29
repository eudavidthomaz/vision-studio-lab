import { useState } from "react";
import { PromptBuilder } from "@/components/PromptBuilder";
import { StructuredContentTabs } from "@/components/StructuredContentTabs";
import { QualityChecklist } from "@/components/QualityChecklist";
import { useContentGeneration } from "@/hooks/useContentGeneration";
import { ContentFormat } from "@/hooks/useContentTemplates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Sparkles, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Creator() {
  const { generate, isLoading, lastPayload, promptUsed, reset } = useContentGeneration();
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedFormats, setSelectedFormats] = useState<ContentFormat[]>([
    "blog",
    "carrossel",
    "email",
    "roteiro_video",
    "post_curto",
  ]);

  const handleBuild = async (prompt: string, formats: ContentFormat[]) => {
    setSelectedFormats(formats);
    setCustomPrompt(prompt);
    await generate({ prompt, formats, options: { source: "structured-creator" } });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Criador Estruturado</h1>
          <p className="text-muted-foreground">
            Gere versões de blog, carrossel, e-mail, roteiro e post curto em um único fluxo.
          </p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Multimodal pronto
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <PromptBuilder onBuild={handleBuild} initialFormats={selectedFormats} />
          <Card>
            <CardHeader>
              <CardTitle>Prompt usado</CardTitle>
              <CardDescription>
                Ajuste antes de reenviar para refinar a resposta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-[160px]"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => reset()}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Limpar
                </Button>
                <Button
                  onClick={() =>
                    generate({ prompt: customPrompt, formats: selectedFormats, options: { source: "structured-creator" } })
                  }
                  disabled={isLoading || !customPrompt}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Regerar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <QualityChecklist
            items={[
              { label: "Título/Headline presente", checked: !!lastPayload?.modalidades },
              { label: "Resumo separado do corpo", checked: !!lastPayload?.modalidades },
              { label: "CTA destacado", checked: !!lastPayload?.modalidades },
              { label: "Metadados ao final", checked: !!lastPayload?.modalidades },
              { label: "Suposições explícitas", checked: !!lastPayload?.modalidades },
            ]}
          />
          <Card>
            <CardHeader>
              <CardTitle>Formato selecionados</CardTitle>
              <CardDescription>Inclua ou remova conforme o canal.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {selectedFormats.map((format) => (
                <Badge key={format} variant="outline" className="capitalize">
                  {format.replace("_", " ")}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Pré-visualização multimodal</CardTitle>
          <CardDescription>
            Estrutura em abas separando blog, carrossel, e-mail, roteiro e post curto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lastPayload?.modalidades ? (
            <StructuredContentTabs modalidades={lastPayload.modalidades} checklist={lastPayload.checklist} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum conteúdo gerado ainda. Construa um prompt e clique em "Gerar conteúdo multimodal".
            </p>
          )}
        </CardContent>
      </Card>

      {promptUsed && (
        <Card>
          <CardHeader>
            <CardTitle>Prompt utilizado</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">{promptUsed}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
