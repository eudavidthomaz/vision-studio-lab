import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Loader2, AlertTriangle, Mail, Lock, Eye, EyeClosed, ArrowRight } from "lucide-react";
import logoIdeon from "@/assets/logo-ideon.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";

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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();

  // 3D card tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);

  const handleCardMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleCardMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard", { replace: true });
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === 'SIGNED_IN') {
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

  const handleTabChange = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setFailedAttempts(0);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast({
          title: "Erro ao entrar com Google",
          description: error.message || "Tente novamente",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Erro ao entrar com Google",
        description: err.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
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
        
        await trackEvent('signup_completed', { email });
        
        toast({
          title: "Conta criada!",
          description: "Redirecionando para boas-vindas...",
        });
        navigate("/welcome");
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro desconhecido';
      
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
      
      if (!isLogin && (errorMessage.toLowerCase().includes('already registered') || errorMessage.toLowerCase().includes('already been registered'))) {
        toast({
          title: "Email já cadastrado",
          description: "Este email já tem uma conta. Faça login ou redefina sua senha.",
          variant: "destructive",
        });
        setTimeout(() => handleTabChange(true), 1500);
        return;
      }
      
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
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-background">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, hsl(263 70% 15% / 0.6) 0%, hsl(240 10% 3.9%) 70%)',
        }}
      />

      {/* Animated glow spots */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[120px] z-0"
        style={{
          background: 'hsl(263 85% 65%)',
          top: '-10%',
          left: '20%',
        }}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[100px] z-0"
        style={{
          background: 'hsl(188 95% 50%)',
          bottom: '5%',
          right: '10%',
        }}
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 20, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full opacity-10 blur-[80px] z-0"
        style={{
          background: 'hsl(263 70% 50%)',
          top: '60%',
          left: '5%',
        }}
        animate={{
          x: [0, 25, -15, 0],
          y: [0, -20, 15, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Card container with perspective */}
      <div className="relative z-10 w-full max-w-md" style={{ perspective: '1200px' }}>
        <motion.div
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          className="relative"
        >
          {/* Card border glow — traveling light beam */}
          <div className="absolute -inset-px rounded-2xl overflow-hidden z-0">
            <div className="absolute inset-0 rounded-2xl auth-border-glow" />
          </div>

          {/* Glass card */}
          <div className="relative rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-8 sm:p-10 shadow-2xl z-10">
            {/* Inner subtle pattern */}
            <div 
              className="absolute inset-0 rounded-2xl opacity-[0.02] pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 0%, hsl(263 85% 65%) 0%, transparent 60%)',
              }}
            />

            {/* Logo and header */}
            <motion.div 
              className="relative flex flex-col items-center mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Logo with glow ring */}
              <div className="relative mb-4">
                <div className="absolute -inset-2 rounded-2xl bg-primary/20 blur-xl" />
                <img 
                  src={logoIdeon} 
                  alt="Ide.On" 
                  className="relative h-16 w-16 rounded-xl object-contain" 
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.h1
                  key={isLogin ? "login" : "signup"}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-2xl font-bold text-foreground tracking-tight"
                >
                  {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
                </motion.h1>
              </AnimatePresence>
              <p className="text-sm text-muted-foreground mt-1">
                {isLogin ? "Entre para continuar no Ide.On" : "Comece a usar o Ide.On gratuitamente"}
              </p>
            </motion.div>

            {/* Failed attempts alert */}
            {isLogin && failedAttempts >= 2 && (
              <Alert className="mb-5 bg-white/[0.03] border-amber-500/20 backdrop-blur-sm">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-200/80 ml-2 text-sm">
                  Muitas tentativas falhas?{" "}
                  <button 
                    className="text-primary font-semibold hover:underline" 
                    onClick={() => {
                      setResetEmail(email);
                      setShowResetPassword(true);
                    }}
                  >
                    Redefina sua senha
                  </button>
                </AlertDescription>
              </Alert>
            )}

            {/* Login form */}
            <form onSubmit={handleAuth} className="space-y-4">
              {/* Email input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 z-10 pointer-events-none" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                    onFocus={() => setFocusedInput("email")}
                    onBlur={() => setFocusedInput(null)}
                    className="w-full bg-white/[0.05] border-transparent focus:border-white/20 text-foreground placeholder:text-white/25 h-11 pl-10 pr-3 rounded-lg transition-all duration-300 focus:bg-white/[0.08] focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:ring-offset-0"
                  />
                  {/* Focus highlight bar */}
                  {focusedInput === "email" && (
                    <motion.div
                      layoutId="inputHighlight"
                      className="absolute -bottom-px left-[10%] right-[10%] h-px"
                      style={{ background: 'var(--gradient-primary)' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </div>
              </div>

              {/* Password input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 z-10 pointer-events-none" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={isLogin ? "••••••••" : "Mínimo 6 caracteres"}
                    minLength={6}
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput(null)}
                    className="w-full bg-white/[0.05] border-transparent focus:border-white/20 text-foreground placeholder:text-white/25 h-11 pl-10 pr-10 rounded-lg transition-all duration-300 focus:bg-white/[0.08] focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:ring-offset-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors z-10"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeClosed className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {focusedInput === "password" && (
                    <motion.div
                      layoutId="inputHighlight"
                      className="absolute -bottom-px left-[10%] right-[10%] h-px"
                      style={{ background: 'var(--gradient-primary)' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </div>
              </div>

              {/* Remember me & Forgot password — login only */}
              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <div /> {/* spacer */}
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors text-xs"
                    onClick={() => {
                      setResetEmail(email);
                      setShowResetPassword(true);
                    }}
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}

              {/* Submit button */}
              <div className="relative pt-2">
                <div className="absolute -inset-1 rounded-xl bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <Button
                  type="submit"
                  variant="solid"
                  className="w-full h-11 rounded-lg text-sm font-semibold gap-2 group"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      {isLogin ? "Entrar" : "Criar Conta"}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative flex items-center my-6">
              <div className="flex-1 h-px bg-white/[0.08]" />
              <span className="px-3 text-xs text-muted-foreground">ou</span>
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            {/* Google sign in */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="relative w-full h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-300 flex items-center justify-center gap-3 text-sm text-foreground disabled:opacity-50 disabled:pointer-events-none group"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continuar com Google
            </button>

            {/* Toggle login/signup link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              {isLogin ? "Não tem conta? " : "Já tem conta? "}
              <button
                type="button"
                className="text-primary font-medium hover:underline underline-offset-4"
                onClick={() => handleTabChange(!isLogin)}
              >
                {isLogin ? "Cadastre-se" : "Faça login"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Dialog de Reset de Senha */}
      <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
        <DialogContent className="sm:max-w-md max-h-[85dvh] overflow-y-auto">
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
