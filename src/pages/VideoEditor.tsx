import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import CreateJobCard from '@/components/video-editor/CreateJobCard';
import JobList from '@/components/video-editor/JobList';
import { Loader2 } from 'lucide-react';

const ALLOWED_EMAIL = 'contato@ligadafotografia.com.br';

export default function VideoEditor() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      const e = data.user?.email?.toLowerCase() ?? null;
      setEmail(e);
      if (!data.user) navigate('/auth?redirect=/editor-video', { replace: true });
    });
    return () => { mounted = false; };
  }, [navigate]);

  if (email === undefined) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allowed = email === ALLOWED_EMAIL;

  return (
    <>
      <Helmet>
        <title>Editor de Vídeos — Ide.On</title>
        <meta name="description" content="Crie cortes virais automáticos e edite vídeos com IA dentro do Ide.On." />
        <link rel="canonical" href="https://midias.app/editor-video" />
      </Helmet>

      <main className="min-h-dvh px-4 sm:px-6 lg:px-8 py-8 pt-[max(2rem,env(safe-area-inset-top))]">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Editor de Vídeos</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Transforme um vídeo longo em cortes prontos para redes sociais, ou edite um único vídeo
              com IA — legendas, reframe vertical, remoção de silêncios e mais.
            </p>
          </header>

          {!allowed ? (
            <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">Em breve</h2>
              <p className="text-muted-foreground">
                O Editor de Vídeos estará disponível no plano Business em breve.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <CreateJobCard />
              <JobList />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
