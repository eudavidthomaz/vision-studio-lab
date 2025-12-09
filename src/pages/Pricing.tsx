import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, ArrowLeft, Infinity, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { PLAN_PRICES } from '@/hooks/useQuota';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfeito para começar',
    features: [
      { text: '10 imagens/mês', included: true },
      { text: '2 transcrições/mês', included: true },
      { text: 'Conteúdos ilimitados', included: true, highlight: true },
      { text: 'Captação ao vivo', included: false },
    ],
    cta: 'Plano Atual',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    priceId: PLAN_PRICES.pro.price_id,
    description: 'Para criadores ativos',
    features: [
      { text: '50 imagens/mês', included: true },
      { text: '5 transcrições/mês', included: true },
      { text: 'Conteúdos ilimitados', included: true, highlight: true },
      { text: '5 captações ao vivo (60min)', included: true },
    ],
    cta: 'Começar Pro',
    popular: false,
  },
  {
    id: 'team',
    name: 'Team',
    price: 79,
    priceId: PLAN_PRICES.team.price_id,
    description: 'Para equipes e igrejas',
    features: [
      { text: '200 imagens/mês', included: true },
      { text: '20 transcrições/mês', included: true },
      { text: 'Conteúdos ilimitados', included: true, highlight: true },
      { text: '20 captações ao vivo (60min)', included: true },
    ],
    cta: 'Começar Team',
    popular: true,
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role, isLoading, openCustomerPortal } = useSubscription();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('checkout') === 'canceled') {
      toast({
        title: 'Checkout cancelado',
        description: 'Você pode tentar novamente quando quiser.',
      });
    }
  }, [searchParams, toast]);

  const handleSelectPlan = async (plan: typeof PLANS[number]) => {
    if (plan.id === 'free') return;
    if (plan.id === role) {
      // Already on this plan, open portal
      try {
        await openCustomerPortal();
      } catch {
        toast({
          title: 'Erro',
          description: 'Não foi possível abrir o portal de gerenciamento.',
          variant: 'destructive',
        });
      }
      return;
    }

    setLoadingPlan(plan.id);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: plan.priceId },
      });

      if (error) throw error;
      if (data?.url) {
        toast({
          title: 'Redirecionando para pagamento...',
          description: (
            <span>
              Você será levado ao Stripe.{' '}
              <a href={data.url} className="underline font-medium">Clique aqui</a> caso não seja redirecionado.
            </span>
          ),
        });
        setTimeout(() => {
          window.location.href = data.url;
        }, 500);
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: 'Erro ao iniciar checkout',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Escolha seu Plano</h1>
          <p className="text-muted-foreground">
            Todos os planos incluem geração ilimitada de conteúdos a partir das transcrições.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === role;
            const isHigherTier = (role === 'team' && plan.id !== 'team') || 
                               (role === 'pro' && plan.id === 'free');

            return (
              <Card 
                key={plan.id} 
                className={`relative flex flex-col ${plan.popular ? 'border-amber-500 border-2' : ''} ${isCurrent ? 'border-primary bg-primary/5' : ''}`}
              >
                {plan.popular && !isCurrent && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500">
                    Mais Popular
                  </Badge>
                )}
                {isCurrent && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Seu Plano
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-2">
                  <CardTitle className="flex items-center justify-center gap-2">
                    {plan.id !== 'free' && <Crown className="h-5 w-5 text-amber-500" />}
                    {plan.name}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-bold">Grátis</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">R${plan.price}</span>
                        <span className="text-muted-foreground">/mês</span>
                      </>
                    )}
                  </div>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className={`flex items-center gap-2 text-sm ${!feature.included ? 'text-muted-foreground' : ''}`}>
                        {feature.included ? (
                          feature.highlight ? (
                            <Infinity className="h-4 w-4 text-green-500 shrink-0" />
                          ) : (
                            <Check className="h-4 w-4 text-green-500 shrink-0" />
                          )
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                        )}
                        <span className={feature.highlight ? 'font-medium' : ''}>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'secondary'}
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isLoading || loadingPlan !== null || (plan.id === 'free' && !isCurrent) || isHigherTier}
                  >
                    {loadingPlan === plan.id ? (
                      <Zap className="h-4 w-4 animate-pulse" />
                    ) : isCurrent ? (
                      plan.id === 'free' ? 'Plano Atual' : 'Gerenciar Plano'
                    ) : isHigherTier ? (
                      'Já possui plano superior'
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 text-center text-sm text-muted-foreground">
          <p>Cancele a qualquer momento. Sem compromisso.</p>
          <p className="mt-1">Precisa de mais? <a href="mailto:contato@ideon.app" className="text-primary underline">Entre em contato</a></p>
        </div>
      </div>
    </div>
  );
}
