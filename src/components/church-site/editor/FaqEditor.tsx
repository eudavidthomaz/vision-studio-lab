import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import type { ChurchSiteFaqItem } from "@/types/churchSite";

interface FaqEditorProps {
  items: ChurchSiteFaqItem[];
  onChange: (items: ChurchSiteFaqItem[]) => void;
}

export function FaqEditor({ items, onChange }: FaqEditorProps) {
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const handleAdd = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    onChange([...items, { question: newQuestion.trim(), answer: newAnswer.trim() }]);
    setNewQuestion("");
    setNewAnswer("");
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof ChurchSiteFaqItem, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2">
          <div className="flex items-start gap-2">
            <div className="flex-1 space-y-2">
              <Input
                value={item.question}
                onChange={(e) => handleUpdate(index, "question", e.target.value)}
                placeholder="Pergunta"
                className="font-medium"
              />
              <Textarea
                value={item.answer}
                onChange={(e) => handleUpdate(index, "answer", e.target.value)}
                placeholder="Resposta"
                rows={2}
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleRemove(index)} className="shrink-0 text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}

      <div className="p-3 rounded-lg border border-dashed border-border/60 space-y-2">
        <Input
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Nova pergunta..."
        />
        <Textarea
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          placeholder="Resposta..."
          rows={2}
        />
        <Button variant="outline" size="sm" onClick={handleAdd} disabled={!newQuestion.trim() || !newAnswer.trim()}>
          <Plus className="w-4 h-4 mr-1" /> Adicionar pergunta
        </Button>
      </div>

      {items.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Nenhuma pergunta adicionada. Adicione perguntas frequentes para ajudar os visitantes.
        </p>
      )}
    </div>
  );
}
