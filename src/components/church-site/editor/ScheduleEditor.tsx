import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, X } from "lucide-react";
import type { ChurchSiteScheduleItem } from "@/types/churchSite";

interface ScheduleEditorProps {
  items: ChurchSiteScheduleItem[];
  onChange: (items: ChurchSiteScheduleItem[]) => void;
}

export function ScheduleEditor({ items, onChange }: ScheduleEditorProps) {
  const [newDay, setNewDay] = useState("");
  const [newTime, setNewTime] = useState("");

  const handleAdd = () => {
    if (!newDay.trim()) return;
    const times = newTime.trim() ? [newTime.trim()] : [];
    onChange([...items, { day: newDay.trim(), times }]);
    setNewDay("");
    setNewTime("");
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdateDay = (index: number, day: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], day };
    onChange(updated);
  };

  const handleAddTime = (index: number, time: string) => {
    if (!time.trim()) return;
    const updated = [...items];
    updated[index] = { ...updated[index], times: [...updated[index].times, time.trim()] };
    onChange(updated);
  };

  const handleRemoveTime = (itemIndex: number, timeIndex: number) => {
    const updated = [...items];
    updated[itemIndex] = {
      ...updated[itemIndex],
      times: updated[itemIndex].times.filter((_, i) => i !== timeIndex),
    };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={item.day}
              onChange={(e) => handleUpdateDay(index, e.target.value)}
              placeholder="Ex: Domingo"
              className="font-medium flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => handleRemove(index)} className="shrink-0 text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {item.times.map((time, timeIndex) => (
              <span key={timeIndex} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                {time}
                <button onClick={() => handleRemoveTime(index, timeIndex)} className="hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <AddTimeInline onAdd={(time) => handleAddTime(index, time)} />
          </div>
        </div>
      ))}

      <div className="p-3 rounded-lg border border-dashed border-border/60 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Input value={newDay} onChange={(e) => setNewDay(e.target.value)} placeholder="Dia (ex: Domingo)" />
          <Input value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="Horário (ex: 09h)" />
        </div>
        <Button variant="outline" size="sm" onClick={handleAdd} disabled={!newDay.trim()}>
          <Plus className="w-4 h-4 mr-1" /> Adicionar dia
        </Button>
      </div>

      {items.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Nenhum horário adicionado. Adicione os dias e horários dos cultos.
        </p>
      )}
    </div>
  );
}

function AddTimeInline({ onAdd }: { onAdd: (time: string) => void }) {
  const [value, setValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-dashed border-border/60 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors"
      >
        <Plus className="w-3 h-3" /> horário
      </button>
    );
  }

  return (
    <Input
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && value.trim()) {
          onAdd(value.trim());
          setValue("");
          setIsEditing(false);
        }
        if (e.key === "Escape") {
          setValue("");
          setIsEditing(false);
        }
      }}
      onBlur={() => {
        if (value.trim()) onAdd(value.trim());
        setValue("");
        setIsEditing(false);
      }}
      placeholder="Ex: 19h30"
      className="w-24 h-7 text-xs"
    />
  );
}
