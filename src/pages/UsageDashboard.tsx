import { useQuota, QuotaFeature } from '@/hooks/useQuota';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Image, FileAudio, Video, TrendingUp, Calendar, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function UsageDashboard() {
  const navigate = useNavigate();
  const { quota, limits, userRole, isLoading, getUsagePercentage, daysUntilReset, getUsage, getLimit } = useQuota();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 animate-fade-in">
        <div className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!quota || !limits) {
    return (
      <div className="container mx-auto p-6 animate-fade-in">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            Não foi possível carregar suas informações de uso.
          </p>
        </Card>
      </div>
    );
  }

  const features: { key: QuotaFeature; label: string; description: string; icon: typeof Image; color: string }[] = [
    {
      key: 'images',
      label: 'Imagens Geradas',
      description: 'Imagens criadas com IA',
      icon: Image,
      color: 'text-blue-500',
    },
    {
      key: 'transcriptions',
      label: 'Transcrições',
      description: 'Uploads de áudio transcritos',
      icon: FileAudio,
      color: 'text-purple-500',
    },
    {
      key: 'live_captures',
      label: 'Captação ao Vivo',
      description: 'Sessões de captação (60min cada)',
      icon: Video,
      color: 'text-green-500',
    },
  ];

  const availableFeatures = features.filter(f => getLimit(f.key) > 0);
  const totalUsagePercentage = availableFeatures.length > 0 
    ? availableFeatures.reduce((acc, f) => acc + getUsagePercentage(f.key), 0) / availableFeatures.length
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Uso Mensal</h1>
          <p className="text-muted-foreground">
            Acompanhe seu consumo de recursos
          </p>
        </div>
        <Badge variant="outline" className="capitalize text-base px-4 py-2">
          Plano {userRole}
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Uso Geral</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">
              {totalUsagePercentage.toFixed(0)}%
            </p>
            <Progress value={totalUsagePercentage} className="h-2" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Reset em</p>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">
              {daysUntilReset} {daysUntilReset === 1 ? 'dia' : 'dias'}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(quota.reset_date).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </Card>

        {availableFeatures.slice(0, 2).map((feature) => {
          const Icon = feature.icon;
          const percentage = getUsagePercentage(feature.key);
          const used = getUsage(feature.key);
          const limit = getLimit(feature.key);

          return (
            <Card key={feature.key} className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{feature.label}</p>
                  <Icon className={`h-4 w-4 ${feature.color}`} />
                </div>
                <p className="text-2xl font-bold">
                  {used}/{limit}
                </p>
                <Progress value={percentage} className="h-2" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Detailed Usage */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Detalhamento de Uso</h2>
        <div className="space-y-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            const percentage = getUsagePercentage(feature.key);
            const used = getUsage(feature.key);
            const limit = getLimit(feature.key);
            const remaining = limit - used;
            const isAvailable = limit > 0;

            return (
              <div key={feature.key} className={`space-y-3 ${!isAvailable ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${feature.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{feature.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {isAvailable ? (
                      <>
                        <p className="text-sm font-medium">
                          {used} de {limit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {remaining} restantes
                        </p>
                      </>
                    ) : (
                      <Badge className="bg-amber-500 text-white">
                        <Crown className="h-3 w-3 mr-1" />
                        PRO
                      </Badge>
                    )}
                  </div>
                </div>
                {isAvailable && <Progress value={percentage} className="h-2" />}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Upgrade CTA */}
      {userRole === 'free' && (
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Precisa de mais recursos?</h3>
              <p className="text-sm text-muted-foreground">
                Faça upgrade para Pro e tenha acesso a limites muito maiores
              </p>
            </div>
            <Button onClick={() => navigate('/pricing')}>
              Ver Planos
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
