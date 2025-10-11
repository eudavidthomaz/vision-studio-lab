import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentResultDisplay } from "@/components/ContentResultDisplay";
import { toast } from "sonner";

export default function ContentResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadContent();
  }, [id]);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_contents')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        console.error('Content not found');
        toast.error('Conteúdo não encontrado');
        navigate('/dashboard');
        return;
      }
      
      // Debug log para análise
      const contentData = data.content as any;
      console.log('📦 Conteúdo carregado:', {
        id,
        contentType: contentData?.content_type,
        hasEstrutura: !!contentData?.estrutura_visual,
        hasConteudo: !!contentData?.conteudo,
        keys: Object.keys(contentData || {})
      });
      
      // O conteúdo já está no formato correto - campo content contém o JSON completo
      setContent(data.content);
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Erro ao carregar conteúdo');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Já está salvo, apenas mostrar feedback
      toast.success('Conteúdo salvo na sua biblioteca!');
      setTimeout(() => {
        navigate('/meus-conteudos');
      }, 1000);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Erro ao salvar conteúdo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = () => {
    navigate('/dashboard');
    toast.info('Crie um novo conteúdo com o botão de IA');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Conteúdo não encontrado</p>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Seu Conteúdo Gerado</h1>
          <p className="text-muted-foreground">
            Conteúdo completo com fundamento bíblico e dicas de produção
          </p>
        </div>

        <ContentResultDisplay
          content={content}
          onSave={handleSave}
          onRegenerate={handleRegenerate}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}
