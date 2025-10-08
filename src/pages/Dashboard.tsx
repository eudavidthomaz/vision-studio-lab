import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import AudioInput from "@/components/AudioInput";
import WeeklyPackDisplay from "@/components/WeeklyPackDisplay";
import IdeonChallengeCard from "@/components/IdeonChallengeCard";
import OnboardingTour from "@/components/OnboardingTour";
import EmptyState from "@/components/EmptyState";
import ProgressSteps from "@/components/ProgressSteps";
import FeedbackButton from "@/components/FeedbackButton";
import NPSModal from "@/components/NPSModal";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useSecureApi } from "@/hooks/useSecureApi";
import { useQuota } from "@/hooks/useQuota";
import { RateLimitIndicator } from "@/components/RateLimitIndicator";
import { QuotaIndicator } from "@/components/QuotaIndicator";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [weeklyPack, setWeeklyPack] = useState<any>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [isGeneratingPack, setIsGeneratingPack] = useState(false);
  const [isGeneratingChallenge, setIsGeneratingChallenge] = useState(false);
  const [currentPlanner, setCurrentPlanner] = useState<Record<string, any[]>>({});
  const [runTour, setRunTour] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isFirstGeneration, setIsFirstGeneration] = useState(true);
  const [showNPSModal, setShowNPSModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  const { invokeFunction } = useSecureApi();
  const { canUse, incrementUsage } = useQuota();

  useEffect(() => {
    // Check for existing session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (user) {
      loadCurrentPlanner();
      
      // Check if should show tour
      const hasSeenTour = localStorage.getItem("ide-on-tour-completed");
      const hasSeenWelcome = localStorage.getItem("ide-on-welcome-seen");
      if (hasSeenWelcome && !hasSeenTour) {
        // Wait a bit before starting tour
        setTimeout(() => setRunTour(true), 1000);
      }
    }
  }, [loading, user, navigate]);

  const handleTranscriptionComplete = async (transcriptText: string) => {
    if (!canUse('weekly_packs')) {
      toast({
        title: 'Limite atingido',
        description: 'Você atingiu o limite mensal de packs semanais.',
        variant: 'destructive',
      });
      return;
    }

    setTranscript(transcriptText);
    setIsGeneratingPack(true);
    setGenerationProgress(0);

    // Track sermon upload
    await trackEvent('sermon_uploaded');

    try {
      // Step 1: Transcription complete (25%)
      setGenerationProgress(25);
      // Save sermon to database
      const { data: sermonData, error: sermonError } = await supabase
        .from('sermons')
        .insert({
          user_id: user.id,
          transcript: transcriptText,
          status: 'completed'
        })
        .select()
        .single();

      if (sermonError) throw sermonError;

      // Step 2: Analyzing sermon (50%)
      setGenerationProgress(50);

      // Generate weekly pack using secure API
      const pack = await invokeFunction<any>('generate-week-pack', {
        transcript: transcriptText
      });

      if (!pack) {
        throw new Error('Erro ao gerar pacote semanal');
      }
      
      // Step 3: Content generated (75%)
      setGenerationProgress(75);
      
      setWeeklyPack(pack);

      // Save weekly pack to database
      await supabase
        .from('weekly_packs')
        .insert({
          user_id: user.id,
          sermon_id: sermonData.id,
          pack: pack
        });

      // Step 4: Complete (100%)
      setGenerationProgress(100);

      // Increment quota usage
      incrementUsage('weekly_packs');

      // Track successful pack generation
      await trackEvent('pack_generated');

      // Celebration for first generation
      if (isFirstGeneration) {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 }
        });
        setIsFirstGeneration(false);
        
        // Show NPS modal after first successful generation
        setTimeout(() => setShowNPSModal(true), 2000);
      }

      toast({
        title: "Sucesso! 🎉",
        description: "Pacote semanal gerado com sucesso!",
      });
    } catch (error) {
      console.error('Error generating pack:', error);
      
      // Track failed pack generation
      await trackEvent('pack_generation_failed', { error: String(error) });
      
      toast({
        title: "Erro",
        description: "Não foi possível gerar o pacote semanal. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPack(false);
      setGenerationProgress(0);
    }
  };

  const handleTourComplete = () => {
    localStorage.setItem("ide-on-tour-completed", "true");
    setRunTour(false);
  };

  const getWeekStartDate = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  const loadCurrentPlanner = async () => {
    if (!user) return;
    
    try {
      const weekStart = getWeekStartDate();
      const { data: existingPlanner } = await supabase
        .from('content_planners')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStart)
        .maybeSingle();

      if (existingPlanner) {
        setCurrentPlanner((existingPlanner.content as Record<string, any[]>) || {});
      }
    } catch (error) {
      console.error('Error loading planner:', error);
    }
  };

  const handleImportToPlanner = async (selectedItems: any[], conflictResolution: 'replace' | 'add' | 'skip') => {
    try {
      const weekStart = getWeekStartDate();
      
      // Check if planner exists for this week
      const { data: existingPlanner } = await supabase
        .from('content_planners')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStart)
        .maybeSingle();

      // Organize selected items by day
      const importedContent: Record<string, any[]> = {};
      selectedItems.forEach(item => {
        const day = item.dia_sugerido;
        if (!importedContent[day]) importedContent[day] = [];
        importedContent[day].push({
          id: crypto.randomUUID(),
          titulo: item.titulo,
          tipo: item.tipo,
          pilar: item.pilar,
          dia_sugerido: day,
          copy: item.copy,
          hashtags: item.hashtags || [],
          cta: item.cta || "",
          slides: item.slides,
          hook: item.hook,
          roteiro: item.roteiro,
          duracao_estimada: item.duracao
        });
      });

      if (existingPlanner) {
        const existingContent = (existingPlanner.content as Record<string, any[]>) || {};
        let mergedContent: Record<string, any[]> = { ...existingContent };

        Object.keys(importedContent).forEach(day => {
          if (conflictResolution === 'replace') {
            mergedContent[day] = importedContent[day];
          } else if (conflictResolution === 'add') {
            mergedContent[day] = [
              ...(mergedContent[day] || []),
              ...importedContent[day]
            ];
          } else if (conflictResolution === 'skip') {
            if (!mergedContent[day] || mergedContent[day].length === 0) {
              mergedContent[day] = importedContent[day];
            }
          }
        });

        await supabase
          .from('content_planners')
          .update({ content: mergedContent })
          .eq('id', existingPlanner.id);
      } else {
        // Create new planner
        await supabase
          .from('content_planners')
          .insert({
            user_id: user.id,
            week_start_date: weekStart,
            content: importedContent
          });
      }

      // Reload planner
      await loadCurrentPlanner();

      toast({
        title: "Sucesso!",
        description: `${selectedItems.length} conteúdo(s) importado(s) para o planner.`,
      });
    } catch (error) {
      console.error('Error importing to planner:', error);
      toast({
        title: "Erro",
        description: "Não foi possível importar o conteúdo.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateChallenge = async () => {
    if (!canUse('challenges')) {
      toast({
        title: 'Limite atingido',
        description: 'Você atingiu o limite mensal de desafios Ide.On.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingChallenge(true);

    try {
      // Generate challenge using secure API
      const challengeData = await invokeFunction<any>('generate-ideon-challenge', {});

      if (!challengeData) {
        throw new Error('Erro ao gerar desafio');
      }
      setChallenge(challengeData);

      // Save challenge to database
      await supabase
        .from('ideon_challenges')
        .insert({
          user_id: user.id,
          challenge: challengeData
        });

      // Increment quota usage
      incrementUsage('challenges');

      // Track challenge generation
      await trackEvent('challenge_generated');

      toast({
        title: "Desafio criado!",
        description: "Um novo desafio Ide.On foi gerado para você.",
      });
    } catch (error) {
      console.error('Error generating challenge:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o desafio. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingChallenge(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Onboarding Tour */}
      <OnboardingTour run={runTour} onComplete={handleTourComplete} />
      
      {/* NPS Modal */}
      <NPSModal isOpen={showNPSModal} onClose={() => setShowNPSModal(false)} />
      
      {/* Feedback Button */}
      <FeedbackButton />

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">Ide.On</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate("/historico")}
                data-tour="history-button"
              >
                Histórico
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/planner")}
                data-tour="planner-button"
              >
                Planner Visual
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/metrics")}
              >
                Métricas
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/usage")}
              >
                Uso
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/analytics")}
              >
                Analytics
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
          
          {/* Indicators */}
          <div className="grid gap-4 md:grid-cols-2">
            <RateLimitIndicator />
            <QuotaIndicator />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!transcript && !weeklyPack && (
        <section className="container mx-auto px-4 py-20 text-center animate-fade-in">
          <div className="max-w-3xl mx-auto bg-card/30 backdrop-blur-md border border-border/50 rounded-2xl p-8 md:p-12 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-scale-in">
              Transforme Suas Pregações
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                Em Conteúdo Poderoso
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Grave sua pregação e receba automaticamente um pacote completo de conteúdo para redes sociais
            </p>
            
            <div className="flex justify-center" data-tour="audio-input">
              <AudioInput onTranscriptionComplete={handleTranscriptionComplete} />
            </div>
          </div>
        </section>
      )}

      {/* Loading State with Progress */}
      {isGeneratingPack && (
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
              <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">Gerando seu pacote semanal...</h3>
              <p className="text-gray-400">Aguarde enquanto criamos conteúdo incrível para você</p>
            </div>
            
            <ProgressSteps
              steps={[
                { 
                  label: "Transcrevendo pregação", 
                  status: generationProgress > 25 ? "completed" : generationProgress > 0 ? "active" : "pending" 
                },
                { 
                  label: "Analisando conteúdo e temas principais", 
                  status: generationProgress > 50 ? "completed" : generationProgress > 25 ? "active" : "pending" 
                },
                { 
                  label: "Gerando posts, stories e reels", 
                  status: generationProgress > 75 ? "completed" : generationProgress > 50 ? "active" : "pending" 
                },
                { 
                  label: "Finalizando pacote semanal", 
                  status: generationProgress === 100 ? "completed" : generationProgress > 75 ? "active" : "pending" 
                },
              ]}
              currentProgress={generationProgress}
            />
          </div>
        </section>
      )}

      {/* Results Section */}
      {weeklyPack && !isGeneratingPack && (
        <section className="container mx-auto px-4 py-12" data-tour="weekly-pack">
          <div className="mb-8 text-center animate-fade-in">
            <h3 className="text-3xl font-bold text-white mb-4">Seu Pacote Semanal Está Pronto! 🎉</h3>
            <p className="text-gray-400 mb-6">
              Todo o conteúdo foi gerado com base na sua pregação
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => {
                  setTranscript("");
                  setWeeklyPack(null);
                }}
                variant="outline"
              >
                Nova Pregação
              </Button>
              
              <Button
                onClick={handleGenerateChallenge}
                disabled={isGeneratingChallenge}
                className="bg-primary hover:bg-primary/90"
              >
                {isGeneratingChallenge ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  "Gerar Desafio Ide.On"
                )}
              </Button>
            </div>
          </div>

          <WeeklyPackDisplay 
            pack={weeklyPack}
            currentPlanner={currentPlanner}
            onImportToPlanner={handleImportToPlanner}
          />
        </section>
      )}

      {/* Challenge Section */}
      {challenge && (
        <section className="container mx-auto px-4 py-12">
          <IdeonChallengeCard challenge={challenge} />
        </section>
      )}

      {/* Empty State for Challenge */}
      {!challenge && weeklyPack && !isGeneratingChallenge && (
        <section className="container mx-auto px-4 py-12">
          <EmptyState
            icon={Sparkles}
            title="Crie um Desafio Ide.On"
            description="Engaje sua comunidade com desafios personalizados que promovem crescimento espiritual e compartilhamento do evangelho"
            action={
              <Button 
                onClick={handleGenerateChallenge}
                className="bg-primary hover:bg-primary/90"
              >
                Gerar Desafio Ide.On
              </Button>
            }
          >
            <div className="grid md:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
              <div className="bg-card/50 p-4 rounded-lg">
                <p className="text-white font-semibold mb-2">📱 Engajamento</p>
                <p className="text-sm text-muted-foreground">Desafios que incentivam ação e compartilhamento</p>
              </div>
              <div className="bg-card/50 p-4 rounded-lg">
                <p className="text-white font-semibold mb-2">🎯 Personalizado</p>
                <p className="text-sm text-muted-foreground">Baseado no tema da sua pregação</p>
              </div>
              <div className="bg-card/50 p-4 rounded-lg">
                <p className="text-white font-semibold mb-2">🌟 Impacto</p>
                <p className="text-sm text-muted-foreground">Leva a mensagem além das redes sociais</p>
              </div>
            </div>
          </EmptyState>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
