import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Share2 } from 'lucide-react';

interface ShareContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: any;
  contentType: 'pack' | 'challenge' | 'planner';
}

export const ShareContentDialog = ({ open, onOpenChange, content, contentType }: ShareContentDialogProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateShareUrl = () => {
    // Sempre usar domínio de produção para links compartilhados
    const baseUrl = import.meta.env.PROD 
      ? 'https://midias.app' 
      : window.location.origin;
    const contentId = content.id;
    return `${baseUrl}/shared/${contentType}/${contentId}`;
  };

  const shareUrl = generateShareUrl();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Link copiado!',
        description: 'O link foi copiado para sua área de transferência.',
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Confira este conteúdo!',
          text: 'Veja o que criei com Pastor.IA',
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      handleCopy();
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
          <div className="space-y-2">
            <Label htmlFor="share-link">Link de Compartilhamento</Label>
            <div className="flex gap-2">
              <Input
                id="share-link"
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleShare} className="flex-1">
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Qualquer pessoa com este link poderá visualizar o conteúdo.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
