import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { ChurchSiteValue } from "@/types/churchSite";

const ICON_OPTIONS = [
  { value: "BookOpen", label: "📖 Bíblia" },
  { value: "Heart", label: "❤️ Coração" },
  { value: "Sparkles", label: "✨ Brilho" },
  { value: "Users", label: "👥 Pessoas" },
  { value: "Star", label: "⭐ Estrela" },
  { value: "Globe", label: "🌍 Mundo" },
  { value: "HandHeart", label: "🤝 Servir" },
  { value: "Cross", label: "✝️ Cruz" },
  { value: "Music", label: "🎵 Música" },
  { value: "Flame", label: "🔥 Chama" },
];

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
            <Select value={val.icon} onValueChange={(v) => handleUpdate(index, "icon", v)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={val.title}
              onChange={(e) => handleUpdate(index, "title", e.target.value)}
              placeholder="Título do valor"
              className="flex-1 font-medium"
            />
            <Button variant="ghost" size="icon" onClick={() => handleRemove(index)} className="shrink-0 text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <Textarea
            value={val.content}
            onChange={(e) => handleUpdate(index, "content", e.target.value)}
            placeholder="Descrição deste valor..."
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
          Adicione os valores/pilares da sua igreja (ex: Palavra, Comunhão, Missão).
        </p>
      )}
    </div>
  );
}
