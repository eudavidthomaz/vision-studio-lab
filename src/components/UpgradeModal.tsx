import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, X } from 'lucide-react';
import { useQuota, PLAN_PRICES, QuotaFeature } from '@/hooks/useQuota';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: QuotaFeature;
  reason?: 'quota_exceeded' | 'feature_locked' | 'upgrade';
}

const FEATURE_LABELS: Record<QuotaFeature, string> = {
  images: 'geração de imagens',
  transcriptions: 'transcrições',
  live_captures: 'captação ao vivo',
};

const PLAN_FEATURES = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '10 imagens/mês',
      '2 transcrições/mês',
      'Conteúdos ilimitados',
    ],
    notIncluded: ['Captação ao vivo'],
  },
  pro: {
    name: 'Pro',
    price: 29,
    features: [
      '50 imagens/mês',
      '5 transcrições/mês',
      '5 captações ao vivo (60min)',
      'Conteúdos ilimitados',
    ],
  },
  team: {
    name: 'Team',
    price: 79,
    features: [
      '200 imagens/mês',
      '20 transcrições/mês',
      '20 captações ao vivo (60min)',
      'Conteúdos ilimitados',
    ],
  },
};

export const UpgradeModal = ({ open, onOpenChange, feature, reason = 'upgrade' }: UpgradeModalProps) => {
  const { userRole } = useQuota();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: 'pro' | 'team') => {
    setLoading(plan);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: PLAN_PRICES[plan].price_id },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: 'Erro ao iniciar checkout',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const getMessage = () => {
    if (reason === 'quota_exceeded' && feature) {
      return `Você atingiu o limite mensal de ${FEATURE_LABELS[feature]}. Faça upgrade para continuar usando.`;
    }
    if (reason === 'feature_locked' && feature) {
      return `${FEATURE_LABELS[feature].charAt(0).toUpperCase() + FEATURE_LABELS[feature].slice(1)} não está disponível no seu plano atual.`;
    }
    return 'Escolha o plano ideal para suas necessidades.';
  };

  const currentPlan = userRole || 'free';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="h-5 w-5 text-amber-500" />
            Fazer Upgrade
          </DialogTitle>
          <DialogDescription>{getMessage()}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2 mt-4">
          {/* Pro Plan */}
          <div className={`relative rounded-lg border-2 p-4 ${currentPlan === 'pro' ? 'border-primary bg-primary/5' : 'border-border'}`}>
            {currentPlan === 'pro' && (
              <Badge className="absolute -top-2 left-4 bg-primary">Seu Plano</Badge>
            )}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">{PLAN_FEATURES.pro.name}</h3>
              <div className="text-right">
                <span className="text-2xl font-bold">R${PLAN_FEATURES.pro.price}</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>
            </div>
            <ul className="space-y-2 mb-4">
              {PLAN_FEATURES.pro.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              onClick={() => handleUpgrade('pro')}
              disabled={currentPlan === 'pro' || currentPlan === 'team' || loading !== null}
            >
              {loading === 'pro' ? (
                <Zap className="h-4 w-4 animate-pulse" />
              ) : currentPlan === 'pro' ? (
                'Plano Atual'
              ) : currentPlan === 'team' ? (
                'Já possui Team'
              ) : (
                'Escolher Pro'
              )}
            </Button>
          </div>

          {/* Team Plan */}
          <div className={`relative rounded-lg border-2 p-4 ${currentPlan === 'team' ? 'border-primary bg-primary/5' : 'border-amber-500'}`}>
            {currentPlan === 'team' ? (
              <Badge className="absolute -top-2 left-4 bg-primary">Seu Plano</Badge>
            ) : (
              <Badge className="absolute -top-2 left-4 bg-amber-500">Mais Popular</Badge>
            )}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">{PLAN_FEATURES.team.name}</h3>
              <div className="text-right">
                <span className="text-2xl font-bold">R${PLAN_FEATURES.team.price}</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>
            </div>
            <ul className="space-y-2 mb-4">
              {PLAN_FEATURES.team.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={currentPlan === 'team' ? 'outline' : 'default'}
              onClick={() => handleUpgrade('team')}
              disabled={currentPlan === 'team' || loading !== null}
            >
              {loading === 'team' ? (
                <Zap className="h-4 w-4 animate-pulse" />
              ) : currentPlan === 'team' ? (
                'Plano Atual'
              ) : (
                'Escolher Team'
              )}
            </Button>
          </div>
        </div>

        {/* Free plan info */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p className="font-medium mb-1">Plano Free inclui:</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {PLAN_FEATURES.free.features.map((f, i) => (
              <span key={i} className="flex items-center gap-1">
                <Check className="h-3 w-3" /> {f}
              </span>
            ))}
            {PLAN_FEATURES.free.notIncluded?.map((f, i) => (
              <span key={i} className="flex items-center gap-1 text-muted-foreground/60">
                <X className="h-3 w-3" /> {f}
              </span>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
