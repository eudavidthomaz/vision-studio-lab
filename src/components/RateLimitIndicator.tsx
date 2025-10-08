import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RateLimit {
  endpoint: string;
  current_count: number;
  max_requests: number;
  reset_at: string;
}

export const RateLimitIndicator = () => {
  const [limits, setLimits] = useState<RateLimit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRateLimits();
  }, []);

  const loadRateLimits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Group by endpoint and get the most recent
      const endpointMap = new Map<string, any>();
      data?.forEach(item => {
        if (!endpointMap.has(item.endpoint)) {
          endpointMap.set(item.endpoint, item);
        }
      });

      setLimits(Array.from(endpointMap.values()));
    } catch (error) {
      console.error('Error loading rate limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEndpointLabel = (endpoint: string) => {
    const labels: Record<string, string> = {
      'transcribe-sermon': 'Transcrição de Áudio',
      'generate-week-pack': 'Geração de Pack Semanal',
      'generate-ideon-challenge': 'Desafio Ide.On',
      'generate-content-idea': 'Ideias de Conteúdo',
      'generate-post-image': 'Geração de Imagens',
    };
    return labels[endpoint] || endpoint;
  };

  const getTimeUntilReset = (resetAt: string) => {
    const reset = new Date(resetAt);
    const now = new Date();
    const diff = reset.getTime() - now.getTime();
    const minutes = Math.ceil(diff / 60000);
    
    if (minutes < 1) return 'menos de 1 minuto';
    if (minutes === 1) return '1 minuto';
    return `${minutes} minutos`;
  };

  if (loading) return null;
  if (limits.length === 0) return null;

  const hasWarning = limits.some(l => (l.current_count / l.max_requests) > 0.8);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Uso de API</h3>
      </div>

      {hasWarning && (
        <Alert>
          <AlertDescription className="text-xs">
            Você está próximo do limite em algumas operações. Os limites são redefinidos automaticamente.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {limits.map((limit) => {
          const percentage = (limit.current_count / limit.max_requests) * 100;
          const isNearLimit = percentage > 80;
          
          return (
            <div key={limit.endpoint} className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium">{getEndpointLabel(limit.endpoint)}</span>
                <span className={isNearLimit ? 'text-destructive' : 'text-muted-foreground'}>
                  {limit.current_count}/{limit.max_requests}
                </span>
              </div>
              <Progress 
                value={percentage} 
                className="h-1.5"
              />
              <p className="text-xs text-muted-foreground">
                Reseta em {getTimeUntilReset(limit.reset_at)}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
