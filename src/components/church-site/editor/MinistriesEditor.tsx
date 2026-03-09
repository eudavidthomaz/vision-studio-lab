import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Loader2, Pencil, Baby, Users, Handshake, BookOpen, Music, Heart, Church, Star, Globe, Mic, Camera, Shield, Sparkles } from "lucide-react";
import type { ChurchSiteMinistry } from "@/types/churchSite";

const MINISTRY_ICONS: { value: string; label: string; Icon: React.ElementType }[] = [
  { value: "Heart", label: "Coração", Icon: Heart },
  { value: "Users", label: "Pessoas", Icon: Users },
  { value: "Music", label: "Música", Icon: Music },
  { value: "BookOpen", label: "Estudo", Icon: BookOpen },
  { value: "Baby", label: "Crianças", Icon: Baby },
  { value: "Sparkles", label: "Jovens", Icon: Sparkles },
  { value: "Handshake", label: "Servir", Icon: Handshake },
  { value: "Mic", label: "Louvor", Icon: Mic },
  { value: "Camera", label: "Mídia", Icon: Camera },
  { value: "Shield", label: "Intercessão", Icon: Shield },
  { value: "Church", label: "Igreja", Icon: Church },
  { value: "Star", label: "Destaque", Icon: Star },
  { value: "Globe", label: "Missões", Icon: Globe },
];

function IconPickerButton({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = MINISTRY_ICONS.find((i) => i.value === value) || MINISTRY_ICONS[0];
  const SelectedIcon = selected.Icon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 w-10 h-10" type="button">
          <SelectedIcon className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="grid grid-cols-4 gap-1">
          {MINISTRY_ICONS.map(({ value: v, label, Icon }) => (
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

interface MinistriesEditorProps {
  ministries: ChurchSiteMinistry[];
  onAdd: (ministry: Omit<ChurchSiteMinistry, "id">) => Promise<void>;
  onUpdate: (id: string, updates: Partial<ChurchSiteMinistry>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function MinistriesEditor({ ministries, onAdd, onUpdate, onDelete, isLoading }: MinistriesEditorProps) {
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
        description: newDescription.trim() ? newDescription.trim().split("\n").filter(Boolean) : [],
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
      {ministries.map((ministry) => {
        const iconData = MINISTRY_ICONS.find((i) => i.value === ministry.icon);
        const DisplayIcon = iconData?.Icon || Heart;

        return (
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
                <DisplayIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium flex-1">{ministry.title}</span>
                <Button variant="ghost" size="icon" onClick={() => setEditingId(ministry.id)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir ministério</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o ministério "{ministry.title}"? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(ministry.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        );
      })}

      <div className="p-3 rounded-lg border border-dashed border-border/60 space-y-2">
        <div className="flex items-center gap-2">
          <IconPickerButton value={newIcon} onChange={setNewIcon} />
          <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Nome do ministério" className="flex-1" />
        </div>
        <Input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Breve descrição do ministério" />
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
  const [description, setDescription] = useState(ministry.description.join(" "));
  const [icon, setIcon] = useState(ministry.icon);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <IconPickerButton value={icon} onChange={setIcon} />
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 font-medium" />
      </div>
      <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave({ title, description: description.trim() ? [description.trim()] : [], icon })} disabled={saving}>
          {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null} Salvar
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  );
}
