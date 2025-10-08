import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordDialog({ open, onClose }: ChangePasswordDialogProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ 
        title: 'Senhas não coincidem', 
        description: 'Digite a mesma senha nos dois campos',
        variant: 'destructive' 
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({ 
        title: 'Senha muito curta', 
        description: 'A senha deve ter no mínimo 6 caracteres',
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    setLoading(false);

    if (error) {
      toast({ 
        title: 'Erro ao alterar senha', 
        description: error.message, 
        variant: 'destructive' 
      });
    } else {
      toast({ 
        title: 'Senha alterada!',
        description: 'Sua senha foi atualizada com sucesso.' 
      });
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Senha</DialogTitle>
          <DialogDescription>
            Digite sua nova senha duas vezes para confirmar
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input 
              id="new-password"
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirmar Senha</Label>
            <Input 
              id="confirm-password"
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              placeholder="Digite novamente"
            />
          </div>
          <Button 
            onClick={handleChangePassword} 
            className="w-full"
            disabled={loading || !newPassword || !confirmPassword}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Confirmar Alteração'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
