import { Calendar, Image, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { useQuota } from "@/hooks/useQuota";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export const UsageStatusCard = () => {
  const { quota, limits, isLoading } = useQuota();
  const navigate = useNavigate();

  if (isLoading || !quota || !limits) {
    return null;
  }

  const usageItems = [
    {
      icon: Calendar,
      label: "Packs de Sermões",
      used: quota.sermon_packs_generated,
      limit: limits.sermon_packs,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Lightbulb,
      label: "Desafios Ide.On",
      used: quota.challenges_used,
      limit: limits.challenges,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: Image,
      label: "Imagens Geradas",
      used: quota.images_generated,
      limit: limits.images,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Seu Uso Mensal</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/usage-dashboard")}
            className="text-xs"
          >
            Ver Detalhes
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {usageItems.map((item) => {
          const percentage = (item.used / item.limit) * 100;
          const Icon = item.icon;
          
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${item.bgColor}`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.used}/{item.limit}
                </span>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
