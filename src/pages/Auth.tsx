import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Loader2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Tradução de mensagens de erro do Supabase para português
const translateAuthError = (errorMessage: string): string => {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Email ou senha incorretos',
    'User already registered': 'Este email já está cadastrado',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
    'Unable to validate email address: invalid format': 'Formato de email inválido',
    'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos',
    'Signup requires a valid password': 'Digite uma senha válida',
    'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada',
    'Invalid email or password': 'Email ou senha inválidos',
  };
  
  // Verifica correspondência parcial
  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return errorMessage;
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard", { replace: true });
      }
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === 'SIGNED_IN') {
        // Check if this is a new user signup
        const hasSeenWelcome = localStorage.getItem("ide-on-welcome-seen");
        if (!hasSeenWelcome) {
          navigate("/welcome", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Reset contador ao mudar de aba
  const handleTabChange = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setFailedAttempts(0);
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast({ 
        title: 'Email obrigatório', 
        description: 'Digite seu email para continuar',
        variant: 'destructive' 
      });
      return;
    }

    setIsResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });
    setIsResetting(false);

    if (error) {
      toast({ 
        title: 'Erro', 
        description: translateAuthError(error.message), 
        variant: 'destructive' 
      });
    } else {
      toast({ 
        title: 'Email enviado!', 
        description: 'Verifique sua caixa de entrada para redefinir sua senha.' 
      });
      setShowResetPassword(false);
      setResetEmail('');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        setFailedAttempts(0);
        toast({
          title: "Bem-vindo!",
          description: "Login realizado com sucesso.",
        });
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        
        if (error) throw error;
        
        // Track signup completion
        await trackEvent('signup_completed', { email });
        
        toast({
          title: "Conta criada!",
          description: "Redirecionando para boas-vindas...",
        });
        // Navigate to welcome page for new users
        navigate("/welcome");
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro desconhecido';
      
      // Tratamento específico para login
      if (isLogin && errorMessage.toLowerCase().includes('invalid login credentials')) {
        setFailedAttempts(prev => prev + 1);
        toast({
          title: "Email ou senha incorretos",
          description: failedAttempts >= 1 
            ? "Verifique seus dados ou redefina sua senha" 
            : "Verifique seus dados e tente novamente. Não tem conta? Clique em Cadastro.",
          variant: "destructive",
        });
        return;
      }
      
      // Tratamento específico para signup - usuário já existe
      if (!isLogin && (errorMessage.toLowerCase().includes('already registered') || errorMessage.toLowerCase().includes('already been registered'))) {
        toast({
          title: "Email já cadastrado",
          description: "Este email já tem uma conta. Faça login ou redefina sua senha.",
          variant: "destructive",
        });
        // Sugerir mudar para login
        setTimeout(() => handleTabChange(true), 1500);
        return;
      }
      
      // Erro genérico traduzido
      toast({
        title: "Erro",
        description: translateAuthError(errorMessage),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Ide.On</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Transforme suas pregações em conteúdo</p>
        </div>

        <div className="bg-card backdrop-blur-sm border border-border rounded-lg p-6 sm:p-8 shadow-2xl animate-scale-in">
          {/* Alerta de tentativas falhas */}
          {isLogin && failedAttempts >= 2 && (
            <Alert className="mb-4 bg-amber-500/10 border-amber-500/30">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-200 ml-2">
                Muitas tentativas falhas?{" "}
                <Button 
                  variant="link" 
                  className="text-primary p-0 h-auto font-semibold" 
                  onClick={() => {
                    setResetEmail(email);
                    setShowResetPassword(true);
                  }}
                >
                  Redefina sua senha
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              variant={isLogin ? "default" : "outline"}
              className="flex-1"
              onClick={() => handleTabChange(true)}
            >
              Login
            </Button>
            <Button
              type="button"
              variant={!isLogin ? "default" : "outline"}
              className="flex-1"
              onClick={() => handleTabChange(false)}
            >
              Cadastro
            </Button>
          </div>

          {/* Texto explicativo para cadastro */}
          {!isLogin && (
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Crie sua conta gratuita para começar a usar o Ide.On
            </p>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input border-border text-foreground"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input border-border text-foreground"
                placeholder={isLogin ? "••••••••" : "Mínimo 6 caracteres"}
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                isLogin ? "Entrar" : "Criar Conta"
              )}
            </Button>
          </form>

          {isLogin && (
            <div className="text-center mt-4">
              <Button
                type="button"
                variant="link"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setResetEmail(email);
                  setShowResetPassword(true);
                }}
              >
                Esqueci minha senha
              </Button>
            </div>
          )}

          {/* Dica adicional para login */}
          {isLogin && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              Não tem conta?{" "}
              <Button 
                variant="link" 
                className="text-xs text-primary p-0 h-auto" 
                onClick={() => handleTabChange(false)}
              >
                Cadastre-se gratuitamente
              </Button>
            </p>
          )}
        </div>
      </div>

      {/* Dialog de Reset de Senha */}
      <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Redefinir Senha</DialogTitle>
            <DialogDescription>
              Digite seu email para receber instruções de redefinição
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="seu@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleResetPassword} 
              className="w-full"
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Email'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
