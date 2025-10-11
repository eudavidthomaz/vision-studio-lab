import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, FileText, Camera, Video, Edit, Mic, Calendar, Users, Zap, Library } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import AudioInput from "@/components/AudioInput";
import OnboardingTour from "@/components/OnboardingTour";
import EmptyState from "@/components/EmptyState";
import ProgressSteps from "@/components/ProgressSteps";
import FeedbackButton from "@/components/FeedbackButton";
import NPSModal from "@/components/NPSModal";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useSecureApi } from "@/hooks/useSecureApi";
import { useQuota } from "@/hooks/useQuota";
import { useContentLibrary } from "@/hooks/useContentLibrary";
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
  const [isGeneratingPack, setIsGeneratingPack] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isFirstGeneration, setIsFirstGeneration] = useState(true);
  const [showNPSModal, setShowNPSModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showSermonCompletedModal, setShowSermonCompletedModal] = useState(false);
  const [currentSermonSummary, setCurrentSermonSummary] = useState("");
  const [currentSermonId, setCurrentSermonId] = useState("");
  const [generatedContentsCount, setGeneratedContentsCount] = useState(0);
  const [preselectedSermonId, setPreselectedSermonId] = useState<string | undefined>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  const { invokeFunction } = useSecureApi();
  const { canUse, incrementUsage } = useQuota();
  const { createContent } = useContentLibrary();

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
    await trackEvent('sermon_uploaded');

    try {
      incrementUsage('sermon_packs');
      await trackEvent('sermon_completed');

      // Buscar dados completos do sermão do banco
      if (sermonId) {
        const { data: sermon } = await supabase
          .from('sermons')
          .select('id, transcript')
          .eq('id', sermonId)
          .single();

        if (sermon) {
          setCurrentSermonId(sermon.id);
          
          // Check if summary already exists in database
          const { data: sermonData } = await supabase
            .from('sermons')
            .select('summary')
            .eq('id', sermon.id)
            .single();
          
          if (sermonData?.summary) {
            // Use cached summary
            setCurrentSermonSummary(sermonData.summary);
          } else {
            // Generate new summary with AI
            toast({
              title: "📝 Gerando resumo...",
              description: "Criando resumo executivo da pregação",
            });

            try {
              const { data: summaryData, error: summaryError } = await supabase.functions.invoke(
                'generate-sermon-summary',
                { body: { transcript: sermon.transcript } }
              );

              if (summaryError) throw summaryError;

              const generatedSummary = summaryData?.summary || 'Resumo não disponível';
              setCurrentSermonSummary(generatedSummary);

              // Cache summary in database
              await supabase
                .from('sermons')
                .update({ summary: generatedSummary })
                .eq('id', sermon.id);

            } catch (err) {
              console.error('Error generating summary:', err);
              // Fallback: use first 500 characters
              const fallback = sermon.transcript.substring(0, 500) + '...';
              setCurrentSermonSummary(fallback);
            }
          }
          
          // Automaticamente gerar pack de conteúdos
          toast({
            title: "🤖 Gerando Conteúdos...",
            description: "Estamos criando posts, stories e reels para você!",
          });

          try {
            const { data, error } = await supabase.functions.invoke('generate-sermon-pack', {
              body: { sermon_id: sermon.id }
            });

            if (error) throw error;

            const contentsCount = data?.data?.contents_count || 0;
            setGeneratedContentsCount(contentsCount);
            
            console.log(`✅ Pack gerado: ${contentsCount} conteúdos criados`);
          } catch (packError) {
            console.error('Error generating pack:', packError);
            // Não bloqueia o fluxo se falhar - usuário pode criar manualmente
            setGeneratedContentsCount(0);
          }
        }
      }

      setShowSermonCompletedModal(true);

      toast({
        title: "✅ Transcrição Completa! 🎉",
        description: "Sua pregação foi transcrita com sucesso e está pronta para gerar conteúdos.",
        duration: 5000,
      });

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
    }
  };

  const handleTourComplete = () => {
    localStorage.setItem("ide-on-tour-completed", "true");
    setRunTour(false);
  };


  const handleOpenContentCreator = (sermonId: string) => {
    setPreselectedSermonId(sermonId);
    setShowSermonCompletedModal(false);
    setShowAIModal(true);
  };

  const handleViewContents = (sermonId: string) => {
    setShowSermonCompletedModal(false);
    navigate(`/biblioteca?sermon_id=${sermonId}`);
  };

  const handleGenerateAIContent = async (prompt: string) => {
    setIsGeneratingAI(true);
    try {
      console.log('🚀 Gerando conteúdo com prompt:', prompt.substring(0, 100));
      
      const contentId = await createContent(prompt, preselectedSermonId);
      
      console.log('✅ Conteúdo criado com ID:', contentId);

      await trackEvent('ai_content_generated', { prompt: prompt.substring(0, 50) });

      toast({
        title: "Conteúdo criado! 🎉",
        description: "Redirecionando para visualização...",
      });

      setShowAIModal(false);
      
      // Aguardar um pouco para garantir que o banco salvou
      setTimeout(() => {
        navigate(`/biblioteca/${contentId}`);
      }, 300);
      
    } catch (error: any) {
      console.error('❌ Error generating AI content:', error);
      
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
            onNavigateToContent={() => navigate('/biblioteca')}
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
          contentsCount={generatedContentsCount}
          onViewContents={handleViewContents}
        />

        {/* AI Modal */}
        <AIPromptModal 
          open={showAIModal} 
          onOpenChange={(open) => {
            setShowAIModal(open);
            if (!open) setPreselectedSermonId(undefined);
          }}
          onGenerate={handleGenerateAIContent}
          isLoading={isGeneratingAI}
          preselectedSermonId={preselectedSermonId}
        />
      </div>
    </>
  );
};

export default Dashboard;
