import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Info, Bell, Calendar, User } from "lucide-react";

interface AvisoViewProps {
  aviso: {
    tipo: string;
    titulo: string;
    mensagem: string;
    data_vigencia: string;
    responsavel: string;
    chamado_acao: string;
  };
}

const getTipoConfig = (tipo: string) => {
  const configs: Record<string, { icon: any; color: string; bgColor: string }> = {
    Urgente: { icon: AlertCircle, color: "text-red-600", bgColor: "bg-red-500/10 border-red-200" },
    Importante: { icon: Bell, color: "text-yellow-600", bgColor: "bg-yellow-500/10 border-yellow-200" },
    Informativo: { icon: Info, color: "text-blue-600", bgColor: "bg-blue-500/10 border-blue-200" },
  };
  return configs[tipo] || configs.Informativo;
};

export const AvisoView = ({ aviso }: AvisoViewProps) => {
  const config = getTipoConfig(aviso.tipo);
  const IconComponent = config.icon;

  return (
    <div className="space-y-6">
      <Card className={`border-2 ${config.bgColor}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <IconComponent className={`h-6 w-6 ${config.color}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={config.color}>
                  {aviso.tipo}
                </Badge>
              </div>
              <CardTitle className="text-xl">{aviso.titulo}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-background rounded-lg">
            <p className="text-muted-foreground whitespace-pre-wrap">{aviso.mensagem}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                <span className="font-medium">Válido até:</span> {aviso.data_vigencia}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                <span className="font-medium">Responsável:</span> {aviso.responsavel}
              </span>
            </div>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="font-semibold text-sm text-primary">{aviso.chamado_acao}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
