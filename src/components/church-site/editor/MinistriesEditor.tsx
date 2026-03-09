import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2, Pencil } from "lucide-react";
import type { ChurchSiteMinistry } from "@/types/churchSite";

const MINISTRY_ICONS = [
  { value: "Heart", label: "❤️ Coração" },
  { value: "Users", label: "👥 Pessoas" },
  { value: "Music", label: "🎵 Música" },
  { value: "BookOpen", label: "📖 Estudo" },
  { value: "Baby", label: "👶 Crianças" },
  { value: "Sparkles", label: "✨ Jovens" },
  { value: "HandHeart", label: "🤝 Servir" },
  { value: "Mic", label: "🎤 Louvor" },
  { value: "Camera", label: "📷 Mídia" },
  { value: "Shield", label: "🛡️ Intercessão" },
];

interface MinistriesEditorProps {
  ministries: ChurchSiteMinistry[];
  siteId: string;
  onAdd: (ministry: Omit<ChurchSiteMinistry, "id">) => Promise<void>;
  onUpdate: (id: string, updates: Partial<ChurchSiteMinistry>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function MinistriesEditor({ ministries, siteId, onAdd, onUpdate, onDelete, isLoading }: MinistriesEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIcon, setNewIcon] = useState("Heart");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      await onAdd({
        title: newTitle.trim(),
        description: newDescription.trim() ? newDescription.trim().split("\n") : [],
        icon: newIcon,
        sortOrder: ministries.length,
      });
      setNewTitle("");
      setNewDescription("");
      setNewIcon("Heart");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await onDelete(id);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<ChurchSiteMinistry>) => {
    setSaving(true);
    try {
      await onUpdate(id, updates);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {ministries.map((ministry) => (
        <div key={ministry.id} className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2">
          {editingId === ministry.id ? (
            <MinistryEditForm
              ministry={ministry}
              onSave={(updates) => handleUpdate(ministry.id, updates)}
              onCancel={() => setEditingId(null)}
              saving={saving}
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium flex-1">{ministry.title}</span>
              <span className="text-xs text-muted-foreground">{ministry.description.length} descrição(ões)</span>
              <Button variant="ghost" size="icon" onClick={() => setEditingId(ministry.id)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(ministry.id)} className="text-destructive hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      ))}

      <div className="p-3 rounded-lg border border-dashed border-border/60 space-y-2">
        <div className="flex items-center gap-2">
          <Select value={newIcon} onValueChange={setNewIcon}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MINISTRY_ICONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Nome do ministério" className="flex-1" />
        </div>
        <Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Descrição (uma linha por parágrafo)" rows={2} />
        <Button variant="outline" size="sm" onClick={handleAdd} disabled={!newTitle.trim() || saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
          Adicionar ministério
        </Button>
      </div>

      {ministries.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Nenhum ministério cadastrado. Adicione os ministérios da sua igreja.
        </p>
      )}
    </div>
  );
}

function MinistryEditForm({
  ministry,
  onSave,
  onCancel,
  saving,
}: {
  ministry: ChurchSiteMinistry;
  onSave: (updates: Partial<ChurchSiteMinistry>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(ministry.title);
  const [description, setDescription] = useState(ministry.description.join("\n"));
  const [icon, setIcon] = useState(ministry.icon);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select value={icon} onValueChange={setIcon}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MINISTRY_ICONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 font-medium" />
      </div>
      <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave({ title, description: description.split("\n").filter(Boolean), icon })} disabled={saving}>
          {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null} Salvar
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  );
}
