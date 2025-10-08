import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const daysOfWeek = [
  { day: "Segunda", pilar: "Edificar" },
  { day: "Terça", pilar: "Alcançar" },
  { day: "Quarta", pilar: "Pertencer" },
  { day: "Quinta", pilar: "Servir" },
  { day: "Sexta", pilar: "Convite" },
  { day: "Sábado", pilar: "Comunidade" },
  { day: "Domingo", pilar: "Cobertura" }
];

interface MoveToDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDay: string;
  contentTitle: string;
  onMove: (targetDay: string) => void;
}

export default function MoveToDrawer({
  open,
  onOpenChange,
  currentDay,
  contentTitle,
  onMove,
}: MoveToDrawerProps) {
  const handleMove = (targetDay: string) => {
    onMove(targetDay);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Mover para outro dia</DrawerTitle>
          <DrawerDescription>
            "{contentTitle}" está em {currentDay}
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 pb-4">
          <div className="grid gap-2">
            {daysOfWeek.map(({ day, pilar }) => (
              <Button
                key={day}
                variant={day === currentDay ? "secondary" : "outline"}
                size="lg"
                onClick={() => handleMove(day)}
                disabled={day === currentDay}
                className="justify-start h-14 text-left"
              >
                <div className="flex-1">
                  <div className="font-semibold">{day}</div>
                  <div className="text-xs text-muted-foreground">{pilar}</div>
                </div>
                {day === currentDay && (
                  <Badge variant="secondary">Atual</Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" size="lg" className="h-12">
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
