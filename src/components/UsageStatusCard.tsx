import { Image, FileAudio, Video, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { useQuota, QuotaFeature } from "@/hooks/useQuota";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useState } from "react";
import { UpgradeModal } from "./UpgradeModal";

export const UsageStatusCard = () => {
  const { quota, limits, isLoading, getUsage, getLimit, getUsagePercentage, isFeatureAvailable } = useQuota();
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<QuotaFeature>('images');

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

  const handleLockedClick = (feature: QuotaFeature) => {
    setUpgradeFeature(feature);
    setShowUpgradeModal(true);
  };

  return (
    <>
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
          {usageItems.map((item) => {
            const used = getUsage(item.key);
            const limit = getLimit(item.key);
            const percentage = getUsagePercentage(item.key);
            const Icon = item.icon;
            const isLocked = !isFeatureAvailable(item.key);
            
            return (
              <div key={item.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${isLocked ? 'bg-muted' : item.bgColor}`}>
                      <Icon className={`w-4 h-4 ${isLocked ? 'text-muted-foreground' : item.color}`} />
                    </div>
                    <span className={`text-sm font-medium ${isLocked ? 'text-muted-foreground' : ''}`}>
                      {item.label}
                    </span>
                    {isLocked && (
                      <Badge 
                        variant="secondary" 
                        className="bg-amber-500/10 text-amber-600 text-[10px] px-1.5 py-0 cursor-pointer hover:bg-amber-500/20"
                        onClick={() => handleLockedClick(item.key)}
                      >
                        <Crown className="h-2.5 w-2.5 mr-0.5" />
                        PRO
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {isLocked ? (
                      <span className="text-amber-600 font-medium">Bloqueado</span>
                    ) : (
                      `${used}/${limit}`
                    )}
                  </span>
                </div>
                <Progress 
                  value={isLocked ? 0 : percentage} 
                  className={`h-2 ${isLocked ? 'opacity-50' : ''}`}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        feature={upgradeFeature}
        reason="feature_locked"
      />
    </>
  );
};