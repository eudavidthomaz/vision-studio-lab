import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowLeft, FileText } from "lucide-react";
import logoIdeon from "@/assets/logo-ideon.png";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Termos de Serviço — Midias.app</title>
        <meta name="description" content="Termos de uso do Ide.On (Midias.app): assinatura, uso aceitável, propriedade intelectual e responsabilidades." />
        <link rel="canonical" href="https://midias.app/termos" />
        <meta property="og:title" content="Termos de Serviço — Midias.app" />
        <meta property="og:description" content="Termos e condições de uso da plataforma Ide.On." />
        <meta property="og:url" content="https://midias.app/termos" />
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
        <div className="text-center mb-10">
          <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl md:text-5xl font-gunterz uppercase text-foreground mb-3">Termos de Serviço</h1>
          <p className="text-sm text-muted-foreground">Última atualização: 17 de julho de 2026</p>
        </div>

        <GlassCard glowColor="blue">
          <article className="p-6 md:p-10 space-y-8 text-foreground/90 text-sm md:text-base leading-relaxed">
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">1. Aceitação</h2>
              <p>
                Ao criar uma conta ou utilizar o <strong>Ide.On</strong> (operado sob a marca Midias.app), você declara ter lido, entendido e concordado com estes Termos de Serviço e com nossa <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>. Se não concorda, não utilize a plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">2. Descrição do serviço</h2>
              <p>
                O Ide.On é uma plataforma SaaS que utiliza inteligência artificial para transformar pregações, sermões e outros conteúdos religiosos em materiais de comunicação digital (posts, stories, reels, carrosséis, roteiros, legendas), além de oferecer sites white-label para igrejas, gestão de voluntários e escalas, e um editor de cortes verticais de vídeo.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">3. Cadastro e conta</h2>
              <p>
                Você é responsável por fornecer informações verdadeiras no cadastro e por manter em sigilo suas credenciais de acesso. Todas as ações realizadas em sua conta serão presumidas como suas. Notifique-nos imediatamente em caso de acesso não autorizado.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">4. Planos, cobrança e cancelamento</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Oferecemos plano gratuito e planos pagos com recursos e cotas específicos, descritos na página de <Link to="/pricing" className="text-primary hover:underline">preços</Link>.</li>
                <li>Assinaturas pagas são cobradas de forma recorrente (mensal ou anual) por meio da Stripe, com renovação automática.</li>
                <li>Você pode cancelar a qualquer momento pelo portal do cliente. O acesso permanece ativo até o fim do ciclo já pago; não há reembolso proporcional de períodos já iniciados, ressalvado o disposto abaixo.</li>
                <li><strong>Direito de arrependimento:</strong> nos termos do art. 49 do Código de Defesa do Consumidor, você pode desistir da contratação em até 7 dias corridos a contar da primeira cobrança, com devolução integral do valor pago.</li>
                <li>Falhas no pagamento podem resultar em suspensão do acesso aos recursos pagos até a regularização.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">5. Uso aceitável</h2>
              <p>Ao utilizar a plataforma, você concorda em <strong>NÃO</strong>:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Publicar ou gerar conteúdo ilegal, difamatório, discriminatório, de ódio, violento ou que incite violência.</li>
                <li>Utilizar a plataforma para proselitismo político-eleitoral, propaganda partidária ou apoio a candidatos.</li>
                <li>Violar direitos de terceiros (autorais, marcas, imagem, privacidade).</li>
                <li>Enviar spam, malware ou realizar ataques contra a plataforma ou seus usuários.</li>
                <li>Fazer engenharia reversa, tentar acessar código-fonte, contornar limites técnicos ou revender o serviço sem autorização expressa por escrito.</li>
                <li>Utilizar a plataforma para atividades fraudulentas ou que violem qualquer legislação aplicável.</li>
              </ul>
              <p className="mt-3">
                A violação destas regras pode resultar em suspensão ou encerramento imediato da conta, sem reembolso.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">6. Propriedade intelectual</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Seu conteúdo:</strong> você mantém todos os direitos sobre o material que envia (sermões, áudios, textos, imagens) e sobre o conteúdo gerado a partir dele. Concede ao Ide.On uma licença limitada, não exclusiva e mundial para armazenar, processar e exibir esse conteúdo exclusivamente para operar o serviço para você.</li>
                <li><strong>Nossa plataforma:</strong> o software, a marca "Ide.On", o design, os textos, os prompts e a arquitetura da plataforma são de propriedade exclusiva do Ide.On e protegidos por leis de propriedade intelectual.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">7. Conteúdo gerado por IA</h2>
              <p>
                O conteúdo produzido pela inteligência artificial é fornecido como sugestão criativa. Recomendamos fortemente a <strong>revisão humana</strong> antes da publicação, especialmente quanto à precisão teológica, referências bíblicas e alinhamento com a doutrina da sua igreja. Você é o único responsável pelo conteúdo que decide publicar.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">8. Disponibilidade e limitação de responsabilidade</h2>
              <p>
                Empenhamo-nos para manter o serviço disponível e funcional, mas ele é fornecido "no estado em que se encontra" ("as is"), sem garantias de disponibilidade ininterrupta. Podem ocorrer manutenções programadas, indisponibilidades pontuais ou falhas em serviços de terceiros (IA, pagamentos, e-mail).
              </p>
              <p className="mt-3">
                Nos limites permitidos pela legislação aplicável, o Ide.On não se responsabiliza por danos indiretos, lucros cessantes ou perda de dados decorrentes do uso ou impossibilidade de uso da plataforma. Nada nestes termos afasta direitos indisponíveis do consumidor previstos no CDC.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">9. Suspensão e encerramento</h2>
              <p>
                Podemos suspender ou encerrar sua conta em caso de violação destes termos, inadimplência, uso fraudulento ou ordem judicial. Você pode encerrar sua conta a qualquer momento em Perfil → Assinatura ou solicitando exclusão por e-mail.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">10. Alterações destes termos</h2>
              <p>
                Podemos atualizar estes termos periodicamente. Alterações relevantes serão comunicadas por e-mail ou aviso na plataforma com antecedência razoável. O uso continuado após a data de vigência representa concordância com a nova versão.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">11. Lei aplicável e foro</h2>
              <p>
                Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro do domicílio do contratante para dirimir quaisquer controvérsias, quando aplicável ao consumidor. Para relações não regidas pelo CDC, fica eleito o foro da comarca de residência do titular do Ide.On.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">12. Contato</h2>
              <p>
                Dúvidas sobre estes termos: <a href="mailto:contato@midias.app" className="text-primary hover:underline">contato@midias.app</a>.
              </p>
            </section>
          </article>
        </GlassCard>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
          {" · "}
          <Link to="/suporte" className="text-primary hover:underline">Suporte</Link>
        </div>
      </main>
    </div>
  );
};

export default Terms;
