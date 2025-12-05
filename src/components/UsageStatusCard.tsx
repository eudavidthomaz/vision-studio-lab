import { Image, FileAudio, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { useQuota, QuotaFeature } from "@/hooks/useQuota";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export const UsageStatusCard = () => {
  const { quota, limits, isLoading, getUsage, getLimit, getUsagePercentage } = useQuota();
  const navigate = useNavigate();

  if (isLoading || !quota || !limits) {
    return null;
  }

  const usageItems: { key: QuotaFeature; icon: typeof Image; label: string; color: string; bgColor: string }[] = [
    {
      key: 'images',
      icon: Image,
      label: "Imagens Geradas",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      key: 'transcriptions',
      icon: FileAudio,
      label: "Transcrições",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      key: 'live_captures',
      icon: Video,
      label: "Captação ao Vivo",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  const availableItems = usageItems.filter(item => getLimit(item.key) > 0);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Seu Uso Mensal</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/usage")}
            className="text-xs"
          >
            Ver Detalhes
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableItems.map((item) => {
          const used = getUsage(item.key);
          const limit = getLimit(item.key);
          const percentage = getUsagePercentage(item.key);
          const Icon = item.icon;
          
          return (
            <div key={item.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${item.bgColor}`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {used}/{limit}
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
