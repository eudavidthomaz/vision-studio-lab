import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, FileText, Camera, Video, Edit, Mic, Calendar, Users, Zap, Library } from "lucide-react";
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
import { AICreatorCard } from "@/components/AICreatorCard";
import { AIPromptModal } from "@/components/AIPromptModal";
import { RecentContentSection } from "@/components/RecentContentSection";
import { HeroHeader } from "@/components/HeroHeader";
import { SermonCompletedModal } from "@/components/SermonCompletedModal";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [weeklyPack, setWeeklyPack] = useState<any>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [isGeneratingPack, setIsGeneratingPack] = useState(false);
  const [isGeneratingChallenge, setIsGeneratingChallenge] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isFirstGeneration, setIsFirstGeneration] = useState(true);
  const [showNPSModal, setShowNPSModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showSermonCompletedModal, setShowSermonCompletedModal] = useState(false);
  const [currentSermonSummary, setCurrentSermonSummary] = useState("");
  const [currentSermonId, setCurrentSermonId] = useState("");
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
      // Check if should show tour
      const hasSeenTour = localStorage.getItem("ide-on-tour-completed");
      const hasSeenWelcome = localStorage.getItem("ide-on-welcome-seen");
      if (hasSeenWelcome && !hasSeenTour) {
        // Wait a bit before starting tour
        setTimeout(() => setRunTour(true), 1000);
      }
    }
  }, [loading, user, navigate]);

  const handleTranscriptionComplete = async (transcriptText: string, sermonId?: string) => {
    setTranscript(transcriptText);
    setIsGeneratingPack(true);
    setGenerationProgress(0);

    await trackEvent('sermon_uploaded');

    try {
      setGenerationProgress(25);

      // Gerar resumo automático (até 500 palavras)
      const summaryPrompt = `TIPO_SOLICITADO: resumo_breve

${transcriptText}`;

      const summaryResult = await invokeFunction<any>('generate-ai-content', {
        prompt: summaryPrompt
      });

      if (!summaryResult || !summaryResult.generated_content) {
        throw new Error('Erro ao gerar resumo');
      }

      const summary = summaryResult.generated_content.resumo || summaryResult.generated_content.resumo_pregacao?.resumo || "Resumo não disponível";

      setGenerationProgress(75);

      // Salvar automaticamente em "Meus Conteúdos"
      const { error: saveError } = await supabase
        .from('generated_contents')
        .insert({
          user_id: user.id,
          content: { resumo: summary, transcript: transcriptText },
          source_type: 'sermon_transcription',
          content_format: 'resumo_breve',
          prompt_original: 'Transcrição de áudio'
        });

      if (saveError) {
        console.error('Error saving sermon:', saveError);
      }

      setGenerationProgress(100);

      // Incrementar quota
      incrementUsage('weekly_packs');
      await trackEvent('sermon_completed');

      // Abrir modal de celebração
      setCurrentSermonSummary(summary);
      setCurrentSermonId(sermonId || '');
      setShowSermonCompletedModal(true);

      // Celebration for first generation
      if (isFirstGeneration) {
        setIsFirstGeneration(false);
        setTimeout(() => setShowNPSModal(true), 3000);
      }

    } catch (error) {
      console.error('Error processing sermon:', error);
      await trackEvent('sermon_processing_failed', { error: String(error) });
      
      toast({
        title: "Erro",
        description: "Não foi possível processar o sermão. Tente novamente.",
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

  const handleOpenContentCreator = () => {
    setShowSermonCompletedModal(false);
    setShowAIModal(true);
  };

  const handleGenerateAIContent = async (prompt: string) => {
    setIsGeneratingAI(true);
    try {
      const result = await invokeFunction<any>('generate-ai-content', { prompt });
      
      if (!result || !result.content_id) {
        throw new Error('Erro ao gerar conteúdo');
      }

      await trackEvent('ai_content_generated', { prompt: prompt.substring(0, 50) });

      toast({
        title: "Conteúdo criado! 🎉",
        description: "Seu conteúdo foi gerado com sucesso!",
      });

      setShowAIModal(false);
      navigate(`/conteudo/${result.content_id}`);
    } catch (error: any) {
      console.error('Error generating AI content:', error);
      
      const errorMessage = error?.message || 
        'Não foi possível gerar o conteúdo. Tente novamente com um prompt mais específico.';
      
      toast({
        title: "Erro na geração",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
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
          {/* Hero Header */}
          <HeroHeader 
            onNavigateToContent={() => navigate('/meus-conteudos')}
            onNavigateToProfile={() => navigate('/profile')}
            onLogout={handleLogout}
          />

          {/* Main Content Area */}
          <div className="space-y-8">
            {/* Hero Section - AI Creator */}
            <section data-tour="ai-creator">
              <AICreatorCard onClick={() => setShowAIModal(true)} />
            </section>
            
            {/* Recent Content */}
            <section>
              <RecentContentSection />
            </section>

            {/* Audio Input Section */}
            <section id="audio-input-section" className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                Gerar Pacote Completo
              </h2>
              <div className="bg-card border border-border rounded-xl p-4 sm:p-6 lg:p-8" data-tour="audio-input">
                <AudioInput onTranscriptionComplete={handleTranscriptionComplete} />
              </div>
            </section>
          </div>

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

        {/* Sermon Completed Modal */}
        <SermonCompletedModal
          open={showSermonCompletedModal}
          onOpenChange={setShowSermonCompletedModal}
          sermon={{
            id: currentSermonId,
            summary: currentSermonSummary,
            created_at: new Date().toISOString(),
          }}
          onCreateContent={handleOpenContentCreator}
        />

        {/* AI Modal */}
        <AIPromptModal 
          open={showAIModal} 
          onOpenChange={setShowAIModal}
          onGenerate={handleGenerateAIContent}
          isLoading={isGeneratingAI}
          preselectedSermonId={currentSermonId}
        />
      </div>
    </>
  );
};

export default Dashboard;
