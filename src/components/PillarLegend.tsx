import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const pillars = [
  {
    name: "Edificar",
    day: "Segunda",
    color: "bg-blue-500",
    description: "Devocional profundo com aplicação prática para o dia a dia"
  },
  {
    name: "Alcançar",
    day: "Terça",
    color: "bg-green-500",
    description: "Conteúdo de alto alcance, histórias de transformação"
  },
  {
    name: "Pertencer",
    day: "Quarta",
    color: "bg-purple-500",
    description: "Vida em comunidade, conexão, células e pequenos grupos"
  },
  {
    name: "Servir",
    day: "Quinta",
    color: "bg-orange-500",
    description: "Voluntariado, causas sociais e ação prática"
  },
  {
    name: "Convite",
    day: "Sexta",
    color: "bg-pink-500",
    description: "Expectativa e convite para o culto de fim de semana"
  },
  {
    name: "Comunidade",
    day: "Sábado",
    color: "bg-cyan-500",
    description: "Bastidores, UGC, preparação para o domingo"
  },
  {
    name: "Cobertura",
    day: "Domingo",
    color: "bg-red-500",
    description: "Live do culto, momentos principais da celebração"
  }
];

export default function PillarLegend() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Pilares Estratégicos da Semana</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pillars.map((pillar) => (
          <div key={pillar.name} className="flex items-start gap-3">
            <Badge className={`${pillar.color} text-white shrink-0`}>
              {pillar.day}
            </Badge>
            <div>
              <p className="font-semibold text-foreground">{pillar.name}</p>
              <p className="text-sm text-muted-foreground">{pillar.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
