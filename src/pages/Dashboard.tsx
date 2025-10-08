import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, FileText, Camera, Video, Edit, Mic, Calendar, Users, Zap } from "lucide-react";
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
import { QuickActionCard } from "@/components/QuickActionCard";
import { MobileCardCarousel } from "@/components/MobileCardCarousel";
import { QuickPostModal } from "@/components/QuickPostModal";
import { QuickPhotoModal } from "@/components/QuickPhotoModal";
import { QuickVideoModal } from "@/components/QuickVideoModal";
import { RecentContentSection } from "@/components/RecentContentSection";
import { WeekPreviewSection } from "@/components/WeekPreviewSection";

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
  const [showPostModal, setShowPostModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
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
    <>
      {/* Onboarding Tour */}
      <OnboardingTour run={runTour} onComplete={handleTourComplete} />
      
      {/* NPS Modal */}
      <NPSModal isOpen={showNPSModal} onClose={() => setShowNPSModal(false)} />
      
      {/* Feedback Button */}
      <FeedbackButton />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Ide.On
              </h1>
              <p className="text-muted-foreground">O que você quer fazer hoje?</p>
            </div>
            
            <div className="flex items-center gap-4">
              <RateLimitIndicator />
              <QuotaIndicator />
              
              <Button
                variant="outline"
                onClick={() => navigate('/historico')}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Histórico
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/planner')}
                className="gap-2"
                data-tour="planner-button"
              >
                <Calendar className="w-4 h-4" />
                Planner
              </Button>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="gap-2"
              >
                Sair
              </Button>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Ações Rápidas
            </h2>
            
            {/* Mobile: Swipeable Carousel */}
            <MobileCardCarousel>
              <QuickActionCard
                icon={Camera}
                title="Criar Foto Rápida"
                description="Post com arte sugerida"
                color="purple"
                onClick={() => setShowPhotoModal(true)}
              />
              <QuickActionCard
                icon={Video}
                title="Criar Vídeo Curto"
                description="Roteiro de Reel/Short"
                color="blue"
                onClick={() => setShowVideoModal(true)}
              />
              <QuickActionCard
                icon={Edit}
                title="Criar Post Rápido"
                description="Texto completo para feed"
                color="cyan"
                onClick={() => setShowPostModal(true)}
              />
              <QuickActionCard
                icon={Mic}
                title="Gerar Pack Completo"
                description="Semana inteira de conteúdo"
                color="green"
                onClick={() => {
                  const element = document.getElementById('audio-input-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
              <QuickActionCard
                icon={Calendar}
                title="Organizar Semana"
                description="Ver seu planner visual"
                color="orange"
                onClick={() => navigate('/planner')}
              />
              <QuickActionCard
                icon={Users}
                title="Gestão de Equipe"
                description="Em breve"
                color="pink"
                onClick={() => toast({
                  title: "Em breve!",
                  description: "Funcionalidade de equipe chegando em breve.",
                })}
              />
            </MobileCardCarousel>

            {/* Desktop: Grid Layout */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <QuickActionCard
                icon={Camera}
                title="Criar Foto Rápida"
                description="Post com arte sugerida"
                color="purple"
                onClick={() => setShowPhotoModal(true)}
              />
              <QuickActionCard
                icon={Video}
                title="Criar Vídeo Curto"
                description="Roteiro de Reel/Short"
                color="blue"
                onClick={() => setShowVideoModal(true)}
              />
              <QuickActionCard
                icon={Edit}
                title="Criar Post Rápido"
                description="Texto completo para feed"
                color="cyan"
                onClick={() => setShowPostModal(true)}
              />
              <QuickActionCard
                icon={Mic}
                title="Gerar Pack Completo"
                description="Semana inteira de conteúdo"
                color="green"
                onClick={() => {
                  const element = document.getElementById('audio-input-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
              <QuickActionCard
                icon={Calendar}
                title="Organizar Semana"
                description="Ver seu planner visual"
                color="orange"
                onClick={() => navigate('/planner')}
              />
              <QuickActionCard
                icon={Users}
                title="Gestão de Equipe"
                description="Em breve"
                color="pink"
                onClick={() => toast({
                  title: "Em breve!",
                  description: "Funcionalidade de equipe chegando em breve.",
                })}
              />
            </div>
          </section>

          {/* Recent Content Section */}
          <section className="mb-12">
            <RecentContentSection />
          </section>

          {/* Week Preview Section */}
          <section className="mb-12">
            <WeekPreviewSection />
          </section>

          {/* Audio Input Section */}
          <section id="audio-input-section" className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Mic className="w-6 h-6 text-primary" />
              Gerar Pacote Completo
            </h2>
            <div className="bg-card border border-border rounded-xl p-8" data-tour="audio-input">
              <AudioInput onTranscriptionComplete={handleTranscriptionComplete} />
            </div>
          </section>

          {/* Loading State */}
          {isGeneratingPack && (
            <div className="bg-card border border-border rounded-lg p-8">
              <ProgressSteps 
                steps={[
                  { 
                    label: "Transcrevendo pregação", 
                    status: generationProgress > 25 ? "completed" : generationProgress > 0 ? "active" : "pending" 
                  },
                  { 
                    label: "Analisando conteúdo", 
                    status: generationProgress > 50 ? "completed" : generationProgress > 25 ? "active" : "pending" 
                  },
                  { 
                    label: "Gerando conteúdo", 
                    status: generationProgress > 75 ? "completed" : generationProgress > 50 ? "active" : "pending" 
                  },
                  { 
                    label: "Finalizando", 
                    status: generationProgress === 100 ? "completed" : generationProgress > 75 ? "active" : "pending" 
                  },
                ]}
                currentProgress={generationProgress}
              />
            </div>
          )}

          {/* Results */}
          {weeklyPack && !isGeneratingPack && (
            <div className="space-y-8">
              <WeeklyPackDisplay 
                pack={weeklyPack}
                currentPlanner={currentPlanner}
                onImportToPlanner={handleImportToPlanner}
              />
              
              {challenge && (
                <IdeonChallengeCard challenge={challenge} />
              )}
              
              {!challenge && (
                <div className="text-center">
                  <Button 
                    onClick={handleGenerateChallenge}
                    disabled={isGeneratingChallenge}
                    className="gap-2"
                  >
                    {isGeneratingChallenge ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Gerar Desafio Ide.On
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        <QuickPostModal open={showPostModal} onOpenChange={setShowPostModal} />
        <QuickPhotoModal open={showPhotoModal} onOpenChange={setShowPhotoModal} />
        <QuickVideoModal open={showVideoModal} onOpenChange={setShowVideoModal} />
      </div>
    </>
  );
};

export default Dashboard;
