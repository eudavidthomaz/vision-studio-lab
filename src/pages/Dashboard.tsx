import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import AudioInput from "@/components/AudioInput";
import OnboardingTour from "@/components/OnboardingTour";
import FeedbackButton from "@/components/FeedbackButton";
import NPSModal from "@/components/NPSModal";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useQuota } from "@/hooks/useQuota";
import { useContentLibrary } from "@/hooks/useContentLibrary";
import { AICreatorCard } from "@/components/AICreatorCard";
import { AIPromptModal } from "@/components/AIPromptModal";
import { RecentContentSection } from "@/components/RecentContentSection";
import { HeroHeader } from "@/components/HeroHeader";
import { SermonCompletedModal } from "@/components/SermonCompletedModal";
import { useSubscription } from "@/hooks/useSubscription";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [runTour, setRunTour] = useState(false);
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  const { incrementUsage } = useQuota();
  const { createContent } = useContentLibrary();
  const { invalidateSubscription } = useSubscription();

  // Handle checkout success redirect
  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    const sessionId = searchParams.get('session_id');
    
    if (checkoutStatus === 'success' && sessionId) {
      // Remove the query params
      searchParams.delete('checkout');
      searchParams.delete('session_id');
      setSearchParams(searchParams, { replace: true });
      
      // Process the checkout session to link Stripe customer
      const processCheckoutSuccess = async () => {
        try {
          const { error } = await supabase.functions.invoke('handle-checkout-success', {
            body: { sessionId }
          });
          
          if (error) {
            console.error('Error processing checkout:', error);
          }
        } catch (err) {
          console.error('Failed to process checkout session:', err);
        }
        
        // Force subscription refresh regardless of processing result
        invalidateSubscription();
      };
      
      processCheckoutSuccess();
      
      // Show success message with confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast({
        title: "🎉 Plano ativado com sucesso!",
        description: "Obrigado por assinar! Seus novos recursos já estão disponíveis.",
        duration: 6000,
      });
      
      trackEvent('subscription_activated');
    } else if (checkoutStatus === 'success') {
      // Fallback for old URLs without session_id
      searchParams.delete('checkout');
      setSearchParams(searchParams, { replace: true });
      invalidateSubscription();
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast({
        title: "🎉 Plano ativado com sucesso!",
        description: "Obrigado por assinar! Seus novos recursos já estão disponíveis.",
        duration: 6000,
      });
      
      trackEvent('subscription_activated');
    } else if (checkoutStatus === 'cancelled') {
      searchParams.delete('checkout');
      setSearchParams(searchParams, { replace: true });
      
      toast({
        title: "Assinatura cancelada",
        description: "A assinatura foi cancelada. Você pode tentar novamente quando quiser.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [searchParams, setSearchParams, invalidateSubscription, toast, trackEvent]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

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
      const hasSeenTour = localStorage.getItem("ide-on-tour-completed");
      const hasSeenWelcome = localStorage.getItem("ide-on-welcome-seen");
      if (hasSeenWelcome && !hasSeenTour) {
        setTimeout(() => setRunTour(true), 1000);
      }
    }
  }, [loading, user, navigate]);

  const handleTranscriptionComplete = async (transcriptText: string, sermonId?: string) => {
    setTranscript(transcriptText);
    await trackEvent('sermon_uploaded');

    try {
      incrementUsage('transcriptions');
      await trackEvent('sermon_completed');

      if (sermonId) {
        const { data: sermon } = await supabase
          .from('sermons')
          .select('id, transcript, summary')
          .eq('id', sermonId)
          .single();

        if (sermon) {
          setCurrentSermonId(sermon.id);
          
          if (sermon.summary) {
            setCurrentSermonSummary(sermon.summary);
          } else {
            const { data: summaryData } = await supabase.functions.invoke(
              'generate-sermon-summary',
              { body: { transcript: sermon.transcript } }
            );
            
            const generatedSummary = summaryData?.summary || sermon.transcript.substring(0, 500) + '...';
            setCurrentSermonSummary(generatedSummary);
            
            await supabase
              .from('sermons')
              .update({ summary: generatedSummary })
              .eq('id', sermon.id);
          }
          
          setGeneratedContentsCount(0);
        }
      }

      setShowSermonCompletedModal(true);

      toast({
        title: "✅ Sua Pregação Foi Salva!",
        description: "Transcrição completa. Agora você pode criar posts, stories, reels e muito mais!",
        duration: 5000,
      });

      if (isFirstGeneration) {
        setIsFirstGeneration(false);
        setTimeout(() => setShowNPSModal(true), 3000);
      }

    } catch (error) {
      console.error('Error processing sermon:', error);
      await trackEvent('sermon_processing_failed', { error: String(error) });
      
      toast({
        title: "Ops! Algo deu errado",
        description: "Não conseguimos processar o áudio. Tente novamente ou contate o suporte.",
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
    
    toast({
      title: "🤖 Analisando seu pedido...",
      description: "Preparando a geração de conteúdo",
      duration: 2000,
    });
    
    try {
      console.log('🚀 Gerando conteúdo com prompt:', prompt.substring(0, 100));
      
      setTimeout(() => {
        toast({
          title: "✨ Criando conteúdo...",
          description: "Nossa IA está trabalhando nisso",
          duration: Infinity,
        });
      }, 1000);
      
      const contentId = await createContent(prompt, preselectedSermonId);
      
      console.log('✅ Conteúdo criado com ID:', contentId);

      await trackEvent('ai_content_generated', { prompt: prompt.substring(0, 50) });

      toast({
        title: "🎉 Conteúdo criado!",
        description: "Redirecionando para visualização...",
        duration: 3000,
      });

      setShowAIModal(false);
      
      setTimeout(() => {
        navigate(`/biblioteca/${contentId}`);
      }, 300);
      
    } catch (error: any) {
      console.error('❌ Error generating AI content:', error);
      
      const errorMessage = error?.message || 
        'Não foi possível gerar o conteúdo. Tente novamente com um prompt mais específico.';
      
      toast({
        title: "❌ Erro na geração",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
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
      <OnboardingTour run={runTour} onComplete={handleTourComplete} />
      <NPSModal isOpen={showNPSModal} onClose={() => setShowNPSModal(false)} />
      <FeedbackButton />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <HeroHeader 
            onNavigateToContent={() => navigate('/biblioteca')}
            onNavigateToProfile={() => navigate('/profile')}
            onLogout={handleLogout}
          />

          <div className="space-y-8">
            <section data-tour="ai-creator">
              <AICreatorCard onClick={() => setShowAIModal(true)} />
            </section>
            
            <section>
              <RecentContentSection />
            </section>

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
        </div>

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
          onCreateContents={handleOpenContentCreator}
        />

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