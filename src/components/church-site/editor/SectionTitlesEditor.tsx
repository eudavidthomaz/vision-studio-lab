import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, RotateCcw } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { ChurchSiteSectionTitles, ChurchSiteSectionTitle } from "@/types/churchSite";
import { DEFAULT_SECTION_TITLES } from "@/types/churchSite";

interface SectionTitlesEditorProps {
  sectionTitles: ChurchSiteSectionTitles;
  onChange: (sectionTitles: ChurchSiteSectionTitles) => void;
}

const SECTION_LABELS: Record<keyof ChurchSiteSectionTitles, string> = {
  firstTime: "Primeira Vez (FAQ)",
  about: "Sobre Nós",
  ministries: "Ministérios",
  media: "Mídia / YouTube",
  events: "Eventos",
  prayer: "Pedido de Oração",
  contact: "Contato",
  giving: "Dízimos e Ofertas",
};

export function SectionTitlesEditor({ sectionTitles, onChange }: SectionTitlesEditorProps) {
  const handleChange = (
    sectionKey: keyof ChurchSiteSectionTitles,
    field: keyof ChurchSiteSectionTitle,
    value: string
  ) => {
    onChange({
      ...sectionTitles,
      [sectionKey]: {
        ...sectionTitles[sectionKey],
        [field]: value,
      },
    });
  };

  const handleReset = (sectionKey: keyof ChurchSiteSectionTitles) => {
    onChange({
      ...sectionTitles,
      [sectionKey]: DEFAULT_SECTION_TITLES[sectionKey],
    });
  };

  return (
    <div className="space-y-3">
      {(Object.keys(SECTION_LABELS) as Array<keyof ChurchSiteSectionTitles>).map((sectionKey) => {
        const section = sectionTitles[sectionKey];
        const defaultSection = DEFAULT_SECTION_TITLES[sectionKey];
        const isModified =
          section.title !== defaultSection.title || section.subtitle !== defaultSection.subtitle;

        return (
          <SectionTitleItem
            key={sectionKey}
            label={SECTION_LABELS[sectionKey]}
            title={section.title}
            subtitle={section.subtitle}
            isModified={isModified}
            onTitleChange={(value) => handleChange(sectionKey, "title", value)}
            onSubtitleChange={(value) => handleChange(sectionKey, "subtitle", value)}
            onReset={() => handleReset(sectionKey)}
          />
        );
      })}
    </div>
  );
}

interface SectionTitleItemProps {
  label: string;
  title: string;
  subtitle: string;
  isModified: boolean;
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onReset: () => void;
}

function SectionTitleItem({
  label,
  title,
  subtitle,
  isModified,
  onTitleChange,
  onSubtitleChange,
  onReset,
}: SectionTitleItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border/60 bg-muted/20 overflow-hidden">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{label}</span>
            {isModified && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                personalizado
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3">
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs">Título</Label>
              <Input
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Título da seção"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Subtítulo</Label>
              <Textarea
                value={subtitle}
                onChange={(e) => onSubtitleChange(e.target.value)}
                placeholder="Descrição da seção"
                rows={2}
                className="text-sm"
              />
            </div>
            {isModified && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-xs text-muted-foreground"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Restaurar padrão
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
