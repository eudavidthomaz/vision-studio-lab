import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Keyboard } from "lucide-react";

export default function KeyboardShortcutsHelper() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts dialog with Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      // Close with Escape
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const shortcuts = [
    { keys: ["Ctrl/Cmd", "Z"], description: "Desfazer última ação" },
    { keys: ["Ctrl/Cmd", "Y"], description: "Refazer ação desfeita" },
    { keys: ["Ctrl/Cmd", "Shift", "Z"], description: "Refazer (alternativo)" },
    { keys: ["Ctrl/Cmd", "K"], description: "Mostrar atalhos do teclado" },
    { keys: ["Esc"], description: "Fechar modais/diálogos" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            Atalhos do Teclado
          </DialogTitle>
          <DialogDescription>
            Use estes atalhos para navegar mais rapidamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {shortcut.description}
                  </span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <Badge key={keyIndex} variant="outline" className="font-mono">
                        {key}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-4 p-3 bg-primary/10 rounded-lg text-sm text-muted-foreground">
          Pressione <Badge variant="outline" className="mx-1 font-mono">Ctrl/Cmd + K</Badge> a qualquer momento para ver esta lista
        </div>
      </DialogContent>
    </Dialog>
  );
}
