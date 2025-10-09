import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSharedContent } from '@/hooks/useSharedContent';
import { Copy, Check, Share2, Eye, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ShareContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: any;
  contentType: 'pack' | 'challenge' | 'planner' | 'generated';
}

export const ShareContentDialog = ({ open, onOpenChange, content, contentType }: ShareContentDialogProps) => {
  const [copied, setCopied] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [shareData, setShareData] = useState<any>(null);
  const { toast } = useToast();
  const { 
    createPublicShare, 
    createApprovalShare, 
    listMyShares,
    isLoading 
  } = useSharedContent();

  // Carregar compartilhamento existente
  useEffect(() => {
    if (open && content?.id) {
      listMyShares().then(shares => {
        const existing = shares.find(s => 
          s.content_id === content.id && 
          s.content_type === contentType
        );
        setShareData(existing);
        setRequiresApproval(existing?.requires_approval || false);
      });
    }
  }, [open, content]);

  const handleCreateShare = async () => {
    if (!content?.id) return;

    const result = requiresApproval
      ? await createApprovalShare(content.id, contentType)
      : await createPublicShare(content.id, contentType);

    if (result) {
      setShareData(result);
    }
  };

  const generateShareUrl = (token: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/shared/${contentType}/${token}`;
  };

  const generateReviewUrl = (token: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/review/${token}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">✅ Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">❌ Reprovado</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary">⏳ Pendente</Badge>;
    }
  };

  const handleCopy = async (url: string, label: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: 'Link copiado!',
        description: `O ${label} foi copiado para sua área de transferência.`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartilhar Conteúdo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!shareData ? (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="approval-mode">Requer Aprovação</Label>
                  <p className="text-xs text-muted-foreground">
                    Gera um link extra para revisão antes de publicar
                  </p>
                </div>
                <Switch
                  id="approval-mode"
                  checked={requiresApproval}
                  onCheckedChange={setRequiresApproval}
                />
              </div>

              <Button 
                onClick={handleCreateShare} 
                className="w-full"
                disabled={isLoading}
              >
                <Share2 className="mr-2 h-4 w-4" />
                {requiresApproval ? 'Criar Links (Público + Revisão)' : 'Criar Link Público'}
              </Button>
            </>
          ) : (
            <>
              {/* Status e Informações */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{shareData.views_count} visualizações</span>
                </div>
                {shareData.requires_approval && getStatusBadge(shareData.approval_status)}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  Expira {formatDistanceToNow(new Date(shareData.expires_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>

              {/* Link Público */}
              <div className="space-y-2">
                <Label htmlFor="share-link">Link de Visualização Pública</Label>
                <div className="flex gap-2">
                  <Input
                    id="share-link"
                    value={generateShareUrl(shareData.share_token)}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleCopy(
                      generateShareUrl(shareData.share_token),
                      'link público'
                    )}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Link de Revisão (se requer aprovação) */}
              {shareData.requires_approval && shareData.review_token && (
                <div className="space-y-2">
                  <Label htmlFor="review-link" className="text-primary">
                    Link de Revisão (Para Aprovação)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="review-link"
                      value={generateReviewUrl(shareData.review_token)}
                      readOnly
                      className="flex-1 border-primary"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-primary"
                      onClick={() => handleCopy(
                        generateReviewUrl(shareData.review_token),
                        'link de revisão'
                      )}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Envie este link para quem vai revisar e aprovar o conteúdo.
                  </p>
                </div>
              )}

              {/* Comentário do Revisor */}
              {shareData.reviewer_comment && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">💬 Observação do Revisor:</p>
                  <p className="text-sm text-muted-foreground">{shareData.reviewer_comment}</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                {shareData.requires_approval 
                  ? 'O conteúdo ficará visível após aprovação.'
                  : 'Qualquer pessoa com o link pode visualizar o conteúdo.'}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
