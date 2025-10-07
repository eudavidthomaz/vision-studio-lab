import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weeklyPacksUsed: number;
  weeklyPacksLimit: number;
}

export const PaywallModal = ({ open, onOpenChange, weeklyPacksUsed, weeklyPacksLimit }: PaywallModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado para fazer upgrade');
        return;
      }

      // TODO: Substituir por price_id real do Stripe
      const priceId = 'price_XXXXX'; // Este será configurado no Stripe

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          userId: user.id,
          userEmail: user.email,
          successUrl: `${window.location.origin}/?success=true`,
          cancelUrl: `${window.location.origin}/?canceled=true`,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Erro ao iniciar upgrade. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Upgrade para Pro</DialogTitle>
          <DialogDescription>
            Você atingiu o limite do plano gratuito ({weeklyPacksUsed}/{weeklyPacksLimit} pacotes este mês)
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 my-6">
          {/* Plano Free */}
          <Card className="p-6 border-2">
            <h3 className="text-xl font-bold mb-2">Free</h3>
            <p className="text-3xl font-bold mb-4">R$ 0<span className="text-sm font-normal">/mês</span></p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>1 pacote semanal por mês</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Geração de challenges</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Planejador semanal</span>
              </li>
            </ul>
            <Button variant="outline" disabled className="w-full">
              Plano Atual
            </Button>
          </Card>

          {/* Plano Pro */}
          <Card className="p-6 border-2 border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-bold">
              Recomendado
            </div>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              Pro <Sparkles className="h-5 w-5 text-primary" />
            </h3>
            <p className="text-3xl font-bold mb-1">R$ 47<span className="text-sm font-normal">/mês</span></p>
            <p className="text-sm text-muted-foreground mb-4">7 dias grátis para testar</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="font-bold">Pacotes semanais ilimitados</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="font-bold">Challenges ilimitados</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="font-bold">Imagens ilimitadas</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Planejador semanal</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Suporte prioritário</span>
              </li>
            </ul>
            <Button 
              onClick={handleUpgrade} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Processando...' : 'Fazer Upgrade Agora'}
            </Button>
          </Card>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Cancele quando quiser. Sem compromissos de longo prazo.
        </p>
      </DialogContent>
    </Dialog>
  );
};
