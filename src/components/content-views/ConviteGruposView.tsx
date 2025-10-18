import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, MapPin, Phone } from "lucide-react";

interface ConviteGruposViewProps {
  convite: {
    tipo_grupo: string;
    nome_grupo: string;
    descricao: string;
    publico: string;
    quando: string;
    onde: string;
    como_entrar: string;
    contato: string;
    chamado_acao: string;
  };
}

export const ConviteGruposView = ({ convite }: ConviteGruposViewProps) => {
  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="text-center">
          <Badge variant="outline" className="w-fit mx-auto mb-3">
            {convite.tipo_grupo}
          </Badge>
          <CardTitle className="text-2xl">{convite.nome_grupo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground whitespace-pre-wrap">{convite.descricao}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Para quem é</p>
                    <p className="text-sm text-muted-foreground mt-1">{convite.publico}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Quando</p>
                    <p className="text-sm text-muted-foreground mt-1">{convite.quando}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Onde</p>
                    <p className="text-sm text-muted-foreground mt-1">{convite.onde}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Contato</p>
                    <p className="text-sm text-muted-foreground mt-1">{convite.contato}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Como entrar no grupo:</h4>
            <p className="text-sm text-muted-foreground">{convite.como_entrar}</p>
          </div>

          <div className="text-center p-4 bg-primary text-primary-foreground rounded-lg">
            <p className="font-semibold">{convite.chamado_acao}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
