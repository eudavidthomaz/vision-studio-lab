import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSharedContent } from '@/hooks/useSharedContent';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, Home } from 'lucide-react';
import WeeklyPackDisplay from '@/components/WeeklyPackDisplay';
import IdeonChallengeCard from '@/components/IdeonChallengeCard';

export default function SharedContentView() {
  const { contentType, shareToken } = useParams<{ contentType: string; shareToken: string }>();
  const navigate = useNavigate();
  const { getSharedContent } = useSharedContent();
  const [shareData, setShareData] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedContent = async () => {
      if (!shareToken) {
        setError('Token inválido');
        setIsLoading(false);
        return;
      }

      try {
        // Buscar dados do compartilhamento
        const share = await getSharedContent(shareToken);
        
        if (!share) {
          setError('Link inválido ou expirado');
          setIsLoading(false);
          return;
        }

        setShareData(share);

        // Buscar conteúdo original baseado no tipo
        let contentData;
        switch (share.content_type) {
          case 'generated':
            const { data: generated } = await supabase
              .from('generated_contents')
              .select('*')
              .eq('id', share.content_id)
              .single();
            contentData = generated;
            break;

          case 'pack':
            const { data: pack } = await supabase
              .from('weekly_packs')
              .select('*')
              .eq('id', share.content_id)
              .single();
            contentData = pack;
            break;
          
          case 'challenge':
            const { data: challenge } = await supabase
              .from('ideon_challenges')
              .select('*')
              .eq('id', share.content_id)
              .single();
            contentData = challenge;
            break;
          
          case 'planner':
            const { data: planner } = await supabase
              .from('content_planners')
              .select('*')
              .eq('id', share.content_id)
              .single();
            contentData = planner;
            break;
        }

        if (!contentData) {
          setError('Conteúdo não encontrado');
          setIsLoading(false);
          return;
        }

        setContent(contentData);
      } catch (err) {
        setError('Erro ao carregar conteúdo');
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedContent();
  }, [shareToken]);

  const getStatusBadge = () => {
    if (!shareData?.requires_approval) return null;

    switch (shareData.approval_status) {
      case 'approved':
        return (
          <Badge className="bg-green-500 text-white">
            ✅ Aprovado
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            ❌ Reprovado
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="secondary">
            ⏳ Aguardando Aprovação
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <AlertCircle className="h-16 w-16 mx-auto text-destructive" />
          <h1 className="text-2xl font-bold">Link Inválido</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate('/')} className="gap-2">
            <Home className="h-4 w-4" />
            Ir para Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header simples */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">I.O</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Ide.On
            </h1>
          </div>
          {getStatusBadge()}
        </div>
      </header>

      {/* Conteúdo */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {shareData?.content_type === 'generated' && content && (
          <>
            {content.source_type === 'audio-pack' ? (
              <WeeklyPackDisplay pack={content.content} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Conteúdo Gerado por IA</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm">
                    {JSON.stringify(content.content, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {shareData?.content_type === 'pack' && content && (
          <WeeklyPackDisplay pack={content.pack} />
        )}
        
        {shareData?.content_type === 'challenge' && content && (
          <IdeonChallengeCard challenge={content.challenge} />
        )}
        
        {shareData?.content_type === 'planner' && content && (
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo do Planner</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(content.content, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Comentário do revisor (se houver) */}
        {shareData?.reviewer_comment && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">💬 Observação do Revisor:</p>
            <p className="text-sm text-muted-foreground">{shareData.reviewer_comment}</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Criado com ❤️ por Ide.On</p>
        </div>
      </footer>
    </div>
  );
}
