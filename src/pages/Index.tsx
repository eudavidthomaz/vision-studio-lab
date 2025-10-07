import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AudioInput from "@/components/AudioInput";
import WeeklyPackDisplay from "@/components/WeeklyPackDisplay";
import IdeonChallengeCard from "@/components/IdeonChallengeCard";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [weeklyPack, setWeeklyPack] = useState<any>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [isGeneratingPack, setIsGeneratingPack] = useState(false);
  const [isGeneratingChallenge, setIsGeneratingChallenge] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
    }
  }, [loading, user, navigate]);

  const handleTranscriptionComplete = async (transcriptText: string) => {
    setTranscript(transcriptText);
    setIsGeneratingPack(true);

    try {
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

      // Generate weekly pack
      const packResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-week-pack`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ transcript: transcriptText }),
        }
      );

      if (!packResponse.ok) {
        throw new Error('Erro ao gerar pacote semanal');
      }

      const pack = await packResponse.json();
      setWeeklyPack(pack);

      // Save weekly pack to database
      await supabase
        .from('weekly_packs')
        .insert({
          user_id: user.id,
          sermon_id: sermonData.id,
          pack: pack
        });

      toast({
        title: "Sucesso!",
        description: "Pacote semanal gerado com sucesso!",
      });
    } catch (error) {
      console.error('Error generating pack:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o pacote semanal. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPack(false);
    }
  };

  const handleGenerateChallenge = async () => {
    setIsGeneratingChallenge(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ideon-challenge`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao gerar desafio');
      }

      const challengeData = await response.json();
      setChallenge(challengeData);

      // Save challenge to database
      await supabase
        .from('ideon_challenges')
        .insert({
          user_id: user.id,
          challenge: challengeData
        });

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
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Ide.On</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/planner")}>
              Planner Visual
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Sair
            </Button>
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
            
            <div className="flex justify-center">
              <AudioInput onTranscriptionComplete={handleTranscriptionComplete} />
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {isGeneratingPack && (
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
            <h3 className="text-2xl font-semibold text-white">Gerando seu pacote semanal...</h3>
            <p className="text-gray-400">Isso pode levar alguns minutos. Aguarde.</p>
          </div>
        </section>
      )}

      {/* Results Section */}
      {weeklyPack && !isGeneratingPack && (
        <section className="container mx-auto px-4 py-12">
          <div className="mb-8 text-center">
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

          <WeeklyPackDisplay pack={weeklyPack} />
        </section>
      )}

      {/* Challenge Section */}
      {challenge && (
        <section className="container mx-auto px-4 py-12">
          <IdeonChallengeCard challenge={challenge} />
        </section>
      )}
    </div>
  );
};

export default Index;
