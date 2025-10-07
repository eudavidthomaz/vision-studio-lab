import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ContentItem {
  id: string;
  titulo: string;
  tipo: string;
  pilar: string;
  dia_sugerido: string;
  copy: string;
  hashtags: string[];
  cta: string;
  [key: string]: any;
}

interface ImportItem {
  id: string;
  titulo: string;
  tipo: "Legenda" | "Carrossel" | "Reel";
  pilar: string;
  dia_sugerido: string;
  copy: string;
  hashtags: string[];
  cta: string;
  slides?: Array<{ texto?: string; sugestao_imagem?: string }>;
  roteiro?: string;
  duracao?: string;
  hook?: string;
}

interface ImportToPlannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pack: any;
  currentPlanner: Record<string, ContentItem[]>;
  onImport: (selectedItems: ImportItem[], conflictResolution: 'replace' | 'add' | 'skip') => void;
}

const daysOfWeek = [
  { day: "Segunda", pilar: "Edificar" },
  { day: "Terça", pilar: "Alcançar" },
  { day: "Quarta", pilar: "Pertencer" },
  { day: "Quinta", pilar: "Servir" },
  { day: "Sexta", pilar: "Convite" },
  { day: "Sábado", pilar: "Comunidade" },
  { day: "Domingo", pilar: "Cobertura" }
];

const ImportToPlannerModal = ({ open, onOpenChange, pack, currentPlanner, onImport }: ImportToPlannerModalProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [conflictResolution, setConflictResolution] = useState<'replace' | 'add' | 'skip'>('add');

  const getDayFromPilar = (pilar: string): string => {
    const found = daysOfWeek.find(d => d.pilar === pilar);
    return found?.day || "Segunda";
  };

  const importableItems = useMemo((): ImportItem[] => {
    const items: ImportItem[] = [];

    // Convert legendas
    pack.legendas?.forEach((legenda: any, index: number) => {
      const pilar = legenda.pilar_estrategico || "Edificar";
      items.push({
        id: `legenda-${index}`,
        titulo: legenda.texto?.substring(0, 50) + "..." || `Legenda ${index + 1}`,
        tipo: "Legenda",
        pilar,
        dia_sugerido: getDayFromPilar(pilar),
        copy: legenda.texto || "",
        hashtags: legenda.hashtags || [],
        cta: legenda.cta || ""
      });
    });

    // Convert carrosseis
    pack.carrosseis?.forEach((carrossel: any, index: number) => {
      const pilar = carrossel.pilar_estrategico || "Edificar";
      items.push({
        id: `carrossel-${index}`,
        titulo: carrossel.titulo || `Carrossel ${index + 1}`,
        tipo: "Carrossel",
        pilar,
        dia_sugerido: getDayFromPilar(pilar),
        copy: carrossel.slides?.map((s: any) => s.texto).join('\n\n') || "",
        hashtags: [],
        cta: "",
        slides: carrossel.slides
      });
    });

    // Convert reels
    pack.reels?.forEach((reel: any, index: number) => {
      const pilar = reel.pilar_estrategico || "Alcançar";
      items.push({
        id: `reel-${index}`,
        titulo: reel.titulo || `Reel ${index + 1}`,
        tipo: "Reel",
        pilar,
        dia_sugerido: getDayFromPilar(pilar),
        copy: reel.roteiro || "",
        hashtags: [],
        cta: "",
        roteiro: reel.roteiro,
        duracao: reel.duracao_estimada,
        hook: reel.hook
      });
    });

    return items;
  }, [pack]);

  const conflictDays = useMemo(() => {
    const conflicts = new Set<string>();
    importableItems.forEach(item => {
      if (currentPlanner[item.dia_sugerido]?.length > 0) {
        conflicts.add(item.dia_sugerido);
      }
    });
    return conflicts;
  }, [importableItems, currentPlanner]);

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === importableItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(importableItems.map(i => i.id)));
    }
  };

  const handleImport = () => {
    const selected = importableItems.filter(item => selectedIds.has(item.id));
    onImport(selected, conflictResolution);
    onOpenChange(false);
    setSelectedIds(new Set());
  };

  const groupedByDay = useMemo(() => {
    const grouped: Record<string, ImportItem[]> = {};
    importableItems.forEach(item => {
      if (!grouped[item.dia_sugerido]) {
        grouped[item.dia_sugerido] = [];
      }
      grouped[item.dia_sugerido].push(item);
    });
    return grouped;
  }, [importableItems]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Importar para Planner</DialogTitle>
          <DialogDescription>
            Selecione os conteúdos que deseja adicionar ao seu planner da semana atual
          </DialogDescription>
        </DialogHeader>

        {conflictDays.size > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Dias com conteúdo existente detectados:</p>
                <p className="text-sm">{Array.from(conflictDays).join(", ")}</p>
                <RadioGroup value={conflictResolution} onValueChange={(v: any) => setConflictResolution(v)} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="add" id="add" />
                    <Label htmlFor="add">Adicionar aos existentes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="replace" id="replace" />
                    <Label htmlFor="replace">Substituir conteúdos existentes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="skip" id="skip" />
                    <Label htmlFor="skip">Pular dias com conteúdo</Label>
                  </div>
                </RadioGroup>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between border-b pb-2">
          <Button variant="ghost" size="sm" onClick={toggleAll}>
            {selectedIds.size === importableItems.length ? "Desmarcar Todos" : "Selecionar Todos"}
          </Button>
          <p className="text-sm text-muted-foreground">
            {selectedIds.size} de {importableItems.length} selecionados
          </p>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {daysOfWeek.map(({ day, pilar }) => {
              const dayItems = groupedByDay[day] || [];
              if (dayItems.length === 0) return null;

              return (
                <div key={day} className="space-y-3">
                  <div className="flex items-center gap-2 sticky top-0 bg-background pt-2 pb-1">
                    <Calendar className="h-4 w-4" />
                    <h3 className="font-semibold">{day}</h3>
                    <Badge variant="outline">{pilar}</Badge>
                    {currentPlanner[day]?.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {currentPlanner[day].length} existente(s)
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 pl-6">
                    {dayItems.map(item => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => toggleItem(item.id)}
                      >
                        <Checkbox
                          checked={selectedIds.has(item.id)}
                          onCheckedChange={() => toggleItem(item.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">{item.tipo}</Badge>
                            <h4 className="font-medium text-sm truncate">{item.titulo}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{item.copy}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={selectedIds.size === 0}>
            Importar {selectedIds.size > 0 && `(${selectedIds.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportToPlannerModal;
