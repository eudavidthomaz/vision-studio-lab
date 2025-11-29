import { useMemo, useState } from "react";
import { ContentFormat, useContentTemplates } from "@/hooks/useContentTemplates";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { cn } from "@/lib/utils";

interface PromptBuilderProps {
  onBuild: (prompt: string, formats: ContentFormat[]) => void;
  initialFormats?: ContentFormat[];
}

export function PromptBuilder({ onBuild, initialFormats }: PromptBuilderProps) {
  const { templates, getPrompt } = useContentTemplates();
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("Líderes e membros da igreja");
  const [tone, setTone] = useState("inspirador e claro");
  const [goal, setGoal] = useState("gerar conteúdo multimodal completo");
  const [persona, setPersona] = useState("voz pastoral moderna, prática e acolhedora");
  const [formats, setFormats] = useState<ContentFormat[]>(
    initialFormats ?? ["blog", "carrossel", "email", "roteiro_video", "post_curto"]
  );

  const toggleFormat = (format: ContentFormat) => {
    setFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );
  };

  const promptPreview = useMemo(
    () => getPrompt(topic || "Tema central", audience, tone, goal, persona, formats),
    [topic, audience, tone, goal, persona, formats, getPrompt]
  );

  const handleBuild = () => {
    if (!topic.trim()) {
      return onBuild(promptPreview, formats);
    }
    onBuild(promptPreview, formats);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Construtor de Prompt</CardTitle>
        <CardDescription>
          Defina tema, público, tom e formatos para gerar conteúdo estruturado AIDA/PPA.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="topic">Tema</Label>
            <Input
              id="topic"
              placeholder="Ex.: Disciplina espiritual para jovens"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="audience">Público</Label>
            <Input
              id="audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="tone">Tom</Label>
            <Input id="tone" value={tone} onChange={(e) => setTone(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="goal">Objetivo</Label>
            <Input id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="persona">Persona / Voz</Label>
            <Input
              id="persona"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-lg border p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Formatos</p>
              <p className="text-xs text-muted-foreground">
                Selecione quais formatos multimodais serão gerados simultaneamente.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(templates).map(([key, template]) => (
                <Badge
                  key={key}
                  variant={formats.includes(key as ContentFormat) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleFormat(key as ContentFormat)}
                >
                  {template.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(templates).map(([key, template]) => (
              <div
                key={key}
                className={cn(
                  "rounded-lg border p-3 space-y-2",
                  formats.includes(key as ContentFormat) ? "border-primary/50" : "opacity-60"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{template.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {template.minWords && template.maxWords
                        ? `${template.minWords}-${template.maxWords} palavras`
                        : "Comprimento flexível"}
                    </p>
                  </div>
                  <Switch
                    checked={formats.includes(key as ContentFormat)}
                    onCheckedChange={() => toggleFormat(key as ContentFormat)}
                    aria-label={`Habilitar ${template.name}`}
                  />
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {template.fields.map((field) => (
                    <div key={field.label} className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <div>
                        <p className="font-medium text-foreground">{field.label}</p>
                        <p>{field.description}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {template.suggestions.map((suggestion) => (
                      <Badge key={suggestion} variant="secondary">
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Prompt gerado</Label>
          <Textarea value={promptPreview} className="min-h-[120px]" readOnly />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleBuild}>Gerar conteúdo multimodal</Button>
        </div>
      </CardContent>
    </Card>
  );
}
