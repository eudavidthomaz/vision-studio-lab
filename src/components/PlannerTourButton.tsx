import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HelpCircle, Sparkles, Filter, Calendar, BarChart3, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlannerTourButton() {
  const [open, setOpen] = useState(false);

  const features = [
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: "Templates",
      description: "Acesse templates prontos para criar conteúdo rapidamente. Clique no botão 'Templates' no topo da página.",
    },
    {
      icon: <Filter className="h-8 w-8 text-blue-500" />,
      title: "Filtros Avançados",
      description: "Filtre seu conteúdo por tipo, pilar, status de imagem ou dia. Encontre exatamente o que você precisa.",
    },
    {
      icon: <Calendar className="h-8 w-8 text-green-500" />,
      title: "Visualização Mensal",
      description: "Alterne entre visualização semanal e mensal. Veja a densidade de posts em cada dia do mês.",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
      title: "Estatísticas por Pilar",
      description: "Analise a distribuição do seu conteúdo entre os 7 pilares. Receba sugestões de balanceamento.",
    },
    {
      icon: <Eye className="h-8 w-8 text-pink-500" />,
      title: "Preview de Posts",
      description: "Clique em qualquer post para ver como ele ficará no Instagram ou Facebook. Edite o texto diretamente no preview!",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Guia de Recursos">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Novos Recursos do Planner
          </DialogTitle>
          <DialogDescription>
            Descubra todas as ferramentas disponíveis para otimizar seu planejamento de conteúdo
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 mt-4">
          {features.map((feature, index) => (
            <Card key={index} className="hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {feature.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Dica:</strong> Experimente alternar entre os modos de visualização 
            (Semana, Mês, Estatísticas) usando as abas no topo da página para encontrar a melhor forma de planejar seu conteúdo!
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)}>
            Entendi!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
