import { useQuota, QuotaFeature } from '@/hooks/useQuota';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Image, FileAudio, Video } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const QuotaIndicator = () => {
  const { quota, limits, userRole, isLoading, getUsagePercentage, isNearLimit, daysUntilReset, getUsage, getLimit } = useQuota();

  if (isLoading || !quota || !limits) return null;

  const features: { key: QuotaFeature; label: string; icon: typeof Image }[] = [
    {
      key: 'images',
      label: 'Imagens Geradas',
      icon: Image,
    },
    {
      key: 'transcriptions',
      label: 'Transcrições',
      icon: FileAudio,
    },
    {
      key: 'live_captures',
      label: 'Captação ao Vivo',
      icon: Video,
    },
  ];

  const availableFeatures = features.filter(f => getLimit(f.key) > 0);
  const hasWarning = availableFeatures.some(f => isNearLimit(f.key));

  return (
    <Card className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Seu Uso Mensal</h3>
        </div>
        <Badge variant="outline" className="capitalize">
          {userRole}
        </Badge>
      </div>

      {hasWarning && (
        <Alert>
          <AlertDescription className="text-xs">
            Você está próximo do limite em algumas features. Reseta em {daysUntilReset} dias.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {availableFeatures.map((feature) => {
          const percentage = getUsagePercentage(feature.key);
          const nearLimit = isNearLimit(feature.key);
          const Icon = feature.icon;
          const used = getUsage(feature.key);
          const limit = getLimit(feature.key);
          
          return (
            <div key={feature.key} className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <Icon className="h-3 w-3" />
                  <span className="font-medium">{feature.label}</span>
                </div>
                <span className={nearLimit ? 'text-destructive font-medium' : 'text-muted-foreground'}>
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
      </div>

      <p className="text-xs text-muted-foreground text-center pt-2 border-t">
        Reseta em {daysUntilReset} {daysUntilReset === 1 ? 'dia' : 'dias'}
      </p>
    </Card>
  );
};
