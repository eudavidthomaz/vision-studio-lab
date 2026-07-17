import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowLeft, Mail, MessageCircle, Instagram, LifeBuoy } from "lucide-react";
import logoIdeon from "@/assets/logo-ideon.png";

const faqs = [
  {
    q: "Como transformo uma pregação em conteúdo?",
    a: "Acesse o Dashboard, envie o áudio, vídeo do YouTube ou cole a transcrição da sua pregação. A IA gera automaticamente posts, stories, reels, carrosséis e legendas prontos para publicar.",
  },
  {
    q: "Existem limites de uso no plano gratuito?",
    a: "A geração de conteúdo a partir de sermões é ilimitada. Existem cotas apenas para geração de imagens com IA, transcrição de áudios enviados e capturas ao vivo. Os limites exatos aparecem no seu painel de uso.",
  },
  {
    q: "Como faço upgrade ou cancelo minha assinatura?",
    a: "Vá em Perfil → Assinatura e clique em 'Gerenciar assinatura'. Você será direcionado ao portal seguro do Stripe onde pode fazer upgrade, downgrade ou cancelar a qualquer momento. Ao cancelar, o acesso permanece ativo até o fim do ciclo já pago.",
  },
  {
    q: "A transcrição de áudio funciona em qualquer idioma?",
    a: "Sim. Usamos o modelo Whisper otimizado, com foco em português. O sistema aceita arquivos até o limite do seu plano.",
  },
  {
    q: "Como funciona o editor de vídeo (shorts)?",
    a: "Em 'Editor de Vídeo' você cola a URL pública de um vídeo (YouTube, Vimeo ou link direto MP4) e a IA gera cortes verticais prontos para Reels, Shorts e TikTok. Após o processamento, você pode abrir o editor para ajustar e exportar.",
  },
  {
    q: "Posso criar um site para a minha igreja?",
    a: "Sim. Em 'Sites' você cria um site white-label da sua igreja com editor visual, endereço próprio e conteúdo integrado à plataforma.",
  },
  {
    q: "Como excluo minha conta e meus dados?",
    a: "Envie um e-mail para contato@midias.app com o assunto 'Exclusão de conta'. Confirmamos e removemos seus dados em até 30 dias, conforme a LGPD.",
  },
  {
    q: "Encontrei um bug. O que faço?",
    a: "Nos avise por e-mail em contato@midias.app com uma descrição do problema e, se possível, um print da tela. Respondemos em até 48h úteis.",
  },
];

const Support = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Suporte — Midias.app | Central de Ajuda</title>
        <meta name="description" content="Central de suporte do Ide.On. Tire dúvidas, veja o FAQ e fale com nosso time por e-mail." />
        <link rel="canonical" href="https://midias.app/suporte" />
        <meta property="og:title" content="Suporte — Midias.app" />
        <meta property="og:description" content="Central de ajuda e canais de contato do Ide.On." />
        <meta property="og:url" content="https://midias.app/suporte" />
        <meta property="og:type" content="website" />
      </Helmet>

      <header className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoIdeon} alt="Logo Ide.On" className="h-8 w-8 rounded-lg object-contain" />
            <span className="text-2xl font-brother uppercase text-foreground">Ide.On</span>
          </Link>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        <div className="text-center mb-12">
          <LifeBuoy className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl md:text-5xl font-gunterz uppercase text-foreground mb-4">Como podemos ajudar?</h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Nosso time está pronto para responder suas dúvidas sobre o Ide.On. Antes disso, dá uma olhada no FAQ — talvez sua resposta já esteja aí.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <GlassCard glowColor="primary">
            <a href="mailto:contato@midias.app" className="block p-6 text-center">
              <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
              <h2 className="font-semibold text-foreground mb-1">E-mail</h2>
              <p className="text-sm text-muted-foreground break-all">contato@midias.app</p>
              <p className="text-xs text-muted-foreground mt-2">Resposta em até 48h úteis</p>
            </a>
          </GlassCard>

          <GlassCard glowColor="blue">
            <a href="https://wa.me/message/IDEON" target="_blank" rel="noreferrer" className="block p-6 text-center">
              <MessageCircle className="w-8 h-8 text-primary mx-auto mb-3" />
              <h2 className="font-semibold text-foreground mb-1">WhatsApp</h2>
              <p className="text-sm text-muted-foreground">Fale com o time</p>
              <p className="text-xs text-muted-foreground mt-2">Seg a Sex, 9h–18h</p>
            </a>
          </GlassCard>

          <GlassCard glowColor="cyan">
            <a href="https://instagram.com/ideon.app" target="_blank" rel="noreferrer" className="block p-6 text-center">
              <Instagram className="w-8 h-8 text-primary mx-auto mb-3" />
              <h2 className="font-semibold text-foreground mb-1">Instagram</h2>
              <p className="text-sm text-muted-foreground">@ideon.app</p>
              <p className="text-xs text-muted-foreground mt-2">Novidades e dicas</p>
            </a>
          </GlassCard>
        </div>

        <GlassCard glowColor="primary">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-gunterz uppercase text-foreground mb-6">Perguntas Frequentes</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-b border-border/30 last:border-b-0">
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary text-sm md:text-base py-4">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm md:text-base">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </GlassCard>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Veja também nossa{" "}
            <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
            {" "}e os{" "}
            <Link to="/termos" className="text-primary hover:underline">Termos de Serviço</Link>.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Support;
