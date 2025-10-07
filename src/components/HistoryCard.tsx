import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, Trash2, FileText } from "lucide-react";
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

interface HistoryCardProps {
  item: any;
  type: "pack" | "challenge" | "planner";
  onDelete: (id: string, type: "pack" | "challenge" | "planner") => void;
  onViewDetails: (item: any, type: "pack" | "challenge") => void;
}

export default function HistoryCard({ item, type, onDelete, onViewDetails }: HistoryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCardTitle = () => {
    if (type === "pack") {
      const pack = item.pack;
      return pack?.resumo?.substring(0, 50) || "Pacote Semanal";
    } else if (type === "challenge") {
      return item.challenge?.titulo || "Desafio Ide.On";
    } else {
      return `Planner - ${new Date(item.week_start_date).toLocaleDateString('pt-BR')}`;
    }
  };

  const getCardStats = () => {
    if (type === "pack") {
      const pack = item.pack;
      return {
        legendas: pack?.legendas?.length || 0,
        carrosseis: pack?.carrosseis?.length || 0,
        reels: pack?.reels?.length || 0,
      };
    } else if (type === "planner") {
      const content = item.content || {};
      const totalItems = Object.values(content).reduce((acc: number, day: any) => {
        return acc + (Array.isArray(day) ? day.length : 0);
      }, 0);
      return { totalItems };
    }
    return null;
  };

  const stats = getCardStats();

  return (
    <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground line-clamp-2">{getCardTitle()}</h3>
          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(item.created_at)}</span>
        </div>

        {stats && type === "pack" && (
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="font-semibold text-foreground">{stats.legendas}</div>
              <div className="text-xs text-muted-foreground">Legendas</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="font-semibold text-foreground">{stats.carrosseis}</div>
              <div className="text-xs text-muted-foreground">Carrosséis</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="font-semibold text-foreground">{stats.reels}</div>
              <div className="text-xs text-muted-foreground">Reels</div>
            </div>
          </div>
        )}

        {stats && type === "planner" && 'totalItems' in stats && typeof stats.totalItems === 'number' && (
          <div className="text-sm text-center p-2 bg-muted/50 rounded">
            <div className="font-semibold text-foreground">{stats.totalItems}</div>
            <div className="text-xs text-muted-foreground">Conteúdos planejados</div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {(type === "pack" || type === "challenge") && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails(item, type)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Detalhes
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={type === "pack" || type === "challenge" ? "" : "flex-1"}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja deletar este item? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(item.id, type)}>
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}