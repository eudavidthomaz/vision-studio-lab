import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSharedContent } from '@/hooks/useSharedContent';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import WeeklyPackDisplay from '@/components/WeeklyPackDisplay';
import IdeonChallengeCard from '@/components/IdeonChallengeCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ContentReviewPanel() {
  const { reviewToken } = useParams<{ reviewToken: string }>();
  const navigate = useNavigate();
  const { getReviewContent, updateApprovalStatus, addReviewerComment } = useSharedContent();
  const [shareData, setShareData] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadReviewContent = async () => {
      if (!reviewToken) {
        setError('Token inválido');
        setIsLoading(false);
        return;
      }

      try {
        const share = await getReviewContent(reviewToken);
        
        if (!share) {
          setError('Link inválido ou expirado');
          setIsLoading(false);
          return;
        }

        setShareData(share);

        // Buscar conteúdo original
        let contentData;
        switch (share.content_type) {
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

    loadReviewContent();
  }, [reviewToken]);

  const handleApprove = async () => {
    if (!reviewToken) return;
    
    setIsSubmitting(true);
    const success = await updateApprovalStatus(reviewToken, 'approved');
    setIsSubmitting(false);
    
    if (success) {
      // Mostrar página de confirmação
      setShareData({ ...shareData, approval_status: 'approved' });
    }
  };

  const handleReject = async () => {
    if (!reviewToken) return;
    
    setIsSubmitting(true);
    const success = await updateApprovalStatus(reviewToken, 'rejected', comment);
    setIsSubmitting(false);
    
    if (success) {
      setShowRejectDialog(false);
      setShareData({ ...shareData, approval_status: 'rejected' });
    }
  };

  const handleAddComment = async () => {
    if (!reviewToken || !comment.trim()) return;
    
    setIsSubmitting(true);
    const success = await addReviewerComment(reviewToken, comment);
    setIsSubmitting(false);
    
    if (success) {
      setShowCommentDialog(false);
      setComment('');
      setShareData({ ...shareData, reviewer_comment: comment });
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
        </div>
      </div>
    );
  }

  const isReviewed = shareData?.approval_status !== 'pending';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">I.O</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Painel de Revisão
              </h1>
              <p className="text-sm text-muted-foreground">Avalie o conteúdo abaixo</p>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {shareData?.content_type === 'pack' && content && (
          <WeeklyPackDisplay pack={content.pack} />
        )}
        
        {shareData?.content_type === 'challenge' && content && (
          <IdeonChallengeCard challenge={content.challenge} />
        )}
        
        {shareData?.content_type === 'planner' && content && (
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-2xl font-bold mb-4">Planejamento de Conteúdo</h2>
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(content.content, null, 2)}
            </pre>
          </div>
        )}

        {/* Painel de Aprovação */}
        <Card className="mt-8 p-6">
          <h3 className="text-xl font-bold mb-4">Ações de Revisão</h3>
          
          {isReviewed ? (
            <div className="text-center space-y-4">
              {shareData.approval_status === 'approved' ? (
                <>
                  <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
                  <h4 className="text-2xl font-bold text-green-500">Conteúdo Aprovado!</h4>
                  <p className="text-muted-foreground">
                    O criador foi notificado sobre a aprovação.
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="h-16 w-16 mx-auto text-destructive" />
                  <h4 className="text-2xl font-bold text-destructive">Conteúdo Reprovado</h4>
                  <p className="text-muted-foreground">
                    O criador foi notificado sobre a reprovação.
                  </p>
                  {shareData.reviewer_comment && (
                    <div className="mt-4 p-4 bg-muted rounded-lg text-left">
                      <p className="text-sm font-medium mb-2">Seu comentário:</p>
                      <p className="text-sm text-muted-foreground">{shareData.reviewer_comment}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="h-24 flex-col gap-2 bg-green-500 hover:bg-green-600"
              >
                <CheckCircle2 className="h-8 w-8" />
                <span className="text-lg font-semibold">Aprovar</span>
              </Button>

              <Button
                onClick={() => setShowRejectDialog(true)}
                disabled={isSubmitting}
                variant="destructive"
                className="h-24 flex-col gap-2"
              >
                <XCircle className="h-8 w-8" />
                <span className="text-lg font-semibold">Reprovar</span>
              </Button>

              <Button
                onClick={() => setShowCommentDialog(true)}
                disabled={isSubmitting}
                variant="outline"
                className="h-24 flex-col gap-2"
              >
                <MessageSquare className="h-8 w-8" />
                <span className="text-lg font-semibold">Adicionar Observação</span>
              </Button>
            </div>
          )}

          {shareData?.reviewer_comment && !isReviewed && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Observações anteriores:</p>
              <p className="text-sm text-muted-foreground">{shareData.reviewer_comment}</p>
            </div>
          )}
        </Card>
      </main>

      {/* Dialog de Reprovação */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reprovar Conteúdo</DialogTitle>
            <DialogDescription>
              Deseja adicionar um motivo para a reprovação? (Opcional)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-comment">Motivo da Reprovação</Label>
              <Textarea
                id="reject-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Explique o motivo da reprovação..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reprovar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Observação */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Observação</DialogTitle>
            <DialogDescription>
              Adicione uma observação sem alterar o status de aprovação.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="comment">Observação</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Digite sua observação..."
                rows={4}
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddComment} disabled={isSubmitting || !comment.trim()}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
