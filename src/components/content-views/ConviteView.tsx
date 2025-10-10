import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Phone } from "lucide-react";

interface ConviteViewProps {
  convite: {
    titulo_evento: string;
    data: string;
    horario: string;
    local: string;
    descricao: string;
    publico_alvo: string;
    como_participar: string;
    contato?: string;
    chamado_acao: string;
  };
}

export const ConviteView = ({ convite }: ConviteViewProps) => {
  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{convite.titulo_evento}</CardTitle>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <Badge variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              {convite.data}
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Clock className="h-4 w-4" />
              {convite.horario}
            </Badge>
            <Badge variant="outline" className="gap-2">
              <MapPin className="h-4 w-4" />
              {convite.local}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-muted-foreground whitespace-pre-wrap">{convite.descricao}</p>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Para quem é?</p>
                  <p className="text-sm text-muted-foreground mt-1">{convite.publico_alvo}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Como participar:</h4>
            <p className="text-sm text-muted-foreground">{convite.como_participar}</p>
          </div>

          {convite.contato && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="font-medium">Contato:</span>
                  <span className="text-muted-foreground">{convite.contato}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center p-4 bg-primary text-primary-foreground rounded-lg">
            <p className="font-semibold">{convite.chamado_acao}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
