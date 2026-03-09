import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, BookOpen, Heart, Sparkles, Users, Star, Globe, HandHeart, Church, Music, Flame } from "lucide-react";
import type { ChurchSiteValue } from "@/types/churchSite";

const VALUE_ICONS: { value: string; label: string; Icon: React.ElementType }[] = [
  { value: "BookOpen", label: "Bíblia", Icon: BookOpen },
  { value: "Heart", label: "Coração", Icon: Heart },
  { value: "Sparkles", label: "Brilho", Icon: Sparkles },
  { value: "Users", label: "Pessoas", Icon: Users },
  { value: "Star", label: "Estrela", Icon: Star },
  { value: "Globe", label: "Mundo", Icon: Globe },
  { value: "HandHeart", label: "Servir", Icon: HandHeart },
  { value: "Church", label: "Igreja", Icon: Church },
  { value: "Music", label: "Música", Icon: Music },
  { value: "Flame", label: "Chama", Icon: Flame },
];

function ValueIconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = VALUE_ICONS.find((i) => i.value === value) || VALUE_ICONS[1];
  const SelectedIcon = selected.Icon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 w-10 h-10" type="button">
          <SelectedIcon className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2" align="start">
        <div className="grid grid-cols-5 gap-1">
          {VALUE_ICONS.map(({ value: v, label, Icon }) => (
            <button
              key={v}
              type="button"
              onClick={() => { onChange(v); setOpen(false); }}
              className={`flex flex-col items-center gap-1 p-2 rounded-md text-xs hover:bg-accent transition-colors ${v === value ? "bg-accent ring-1 ring-primary" : ""}`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate w-full text-center text-[10px] text-muted-foreground">{label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ValuesEditorProps {
  values: ChurchSiteValue[];
  onChange: (values: ChurchSiteValue[]) => void;
}

export function ValuesEditor({ values, onChange }: ValuesEditorProps) {
  const handleUpdate = (index: number, field: keyof ChurchSiteValue, value: string) => {
    const updated = [...values];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleAdd = () => {
    if (values.length >= 6) return;
    onChange([...values, { icon: "Heart", title: "", content: "" }]);
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {values.map((val, index) => (
        <div key={index} className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2">
          <div className="flex items-center gap-2">
            <ValueIconPicker value={val.icon} onChange={(v) => handleUpdate(index, "icon", v)} />
            <Input
              value={val.title}
              onChange={(e) => handleUpdate(index, "title", e.target.value)}
              placeholder="Ex: Missão, Visão, Valores, Crenças...ão, Valores, Crenças..."
              className="flex-1 font-medium"
            />
            <Button variant="ghost" size="icon" onClick={() => handleRemove(index)} className="shrink-0 text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <Textarea
            value={val.content}
            onChange={(e) => handleUpdate(index, "content", e.target.value)}
     placeholder="Descreva este princípio da igreja..."
            rows={2}
          />
        </div>
      ))}

      {values.length < 6 && (
        <Button variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-1" /> Adicionar valor
        </Button>
      )}

      {values.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Descreva a identidade da sua igreja: missão, visão, valores e crenças.
        </p>
      )}
    </div>
  );
}
