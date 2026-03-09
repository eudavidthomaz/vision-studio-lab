import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Trash2, Loader2, Pencil } from "lucide-react";
import type { ChurchSiteEvent } from "@/types/churchSite";

interface EventsEditorProps {
  events: ChurchSiteEvent[];
  onAdd: (event: Omit<ChurchSiteEvent, "id">) => Promise<void>;
  onUpdate: (id: string, updates: Partial<ChurchSiteEvent>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function EventsEditor({ events, onAdd, onUpdate, onDelete }: EventsEditorProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newTag, setNewTag] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newTitle.trim() || !newDate) return;
    setSaving(true);
    try {
      await onAdd({
        title: newTitle.trim(),
        date: newDate,
        time: newTime || null,
        tag: newTag || null,
        sortOrder: events.length,
      });
      setNewTitle("");
      setNewDate("");
      setNewTime("");
      setNewTag("");
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

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="p-3 rounded-lg border border-border/60 bg-muted/20">
          {editingId === event.id ? (
            <EventEditForm
              event={event}
              onSave={async (updates) => {
                setSaving(true);
                try {
                  await onUpdate(event.id, updates);
                  setEditingId(null);
                } finally {
                  setSaving(false);
                }
              }}
              onCancel={() => setEditingId(null)}
              saving={saving}
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <span className="text-sm font-medium">{event.title}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{event.date}</span>
                  {event.time && <span className="text-xs text-muted-foreground">• {event.time}</span>}
                  {event.tag && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">{event.tag}</span>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditingId(event.id)}>
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
                    <AlertDialogTitle>Excluir evento</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o evento "{event.title}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(event.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      ))}

      <div className="p-3 rounded-lg border border-dashed border-border/60 space-y-2">
        <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Nome do evento" />
        <div className="grid grid-cols-3 gap-2">
          <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
          <Input value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="Horário" />
          <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Tag (opcional)" />
        </div>
        <Button variant="outline" size="sm" onClick={handleAdd} disabled={!newTitle.trim() || !newDate || saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
          Adicionar evento
        </Button>
      </div>

      {events.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Nenhum evento cadastrado. Adicione os próximos eventos da sua igreja.
        </p>
      )}
    </div>
  );
}

function EventEditForm({
  event,
  onSave,
  onCancel,
  saving,
}: {
  event: ChurchSiteEvent;
  onSave: (updates: Partial<ChurchSiteEvent>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(event.title);
  const [date, setDate] = useState(event.date);
  const [time, setTime] = useState(event.time || "");
  const [tag, setTag] = useState(event.tag || "");

  return (
    <div className="space-y-2">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className="font-medium" />
      <div className="grid grid-cols-3 gap-2">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="Horário" />
        <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave({ title, date, time: time || null, tag: tag || null })} disabled={saving}>
          {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null} Salvar
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  );
}
