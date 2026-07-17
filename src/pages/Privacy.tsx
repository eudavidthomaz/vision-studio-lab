import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import logoIdeon from "@/assets/logo-ideon.png";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Política de Privacidade — Midias.app</title>
        <meta name="description" content="Como o Ide.On (Midias.app) coleta, usa, armazena e protege seus dados, em conformidade com a LGPD." />
        <link rel="canonical" href="https://midias.app/privacidade" />
        <meta property="og:title" content="Política de Privacidade — Midias.app" />
        <meta property="og:description" content="Política de privacidade e tratamento de dados do Ide.On." />
        <meta property="og:url" content="https://midias.app/privacidade" />
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
          <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl md:text-5xl font-gunterz uppercase text-foreground mb-3">Política de Privacidade</h1>
          <p className="text-sm text-muted-foreground">Última atualização: 17 de julho de 2026</p>
        </div>

        <GlassCard glowColor="primary">
          <article className="p-6 md:p-10 space-y-8 text-foreground/90 text-sm md:text-base leading-relaxed">
            <section>
              <p>
                Esta Política de Privacidade descreve como o <strong>Ide.On</strong> (operado sob a marca Midias.app, doravante "nós", "nosso" ou "plataforma") coleta, utiliza, armazena e protege as informações dos usuários ("você") ao acessar e utilizar nossos serviços, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — "LGPD").
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">1. Controlador dos dados</h2>
              <p>
                O controlador dos dados pessoais tratados nesta plataforma é o Ide.On / Midias.app. Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato pelo e-mail <a href="mailto:contato@midias.app" className="text-primary hover:underline">contato@midias.app</a>, que também atende como canal do Encarregado de Proteção de Dados (DPO).
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">2. Dados que coletamos</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cadastro:</strong> nome, e-mail e, opcionalmente, informações da igreja ou ministério.</li>
                <li><strong>Autenticação:</strong> credenciais de acesso e, se você optar, dados básicos de perfil do Google (via OAuth).</li>
                <li><strong>Conteúdo enviado:</strong> áudios, vídeos, links, transcrições, imagens, textos de sermões e demais materiais que você submete à plataforma para processamento.</li>
                <li><strong>Conteúdo gerado:</strong> posts, roteiros, carrosséis, imagens e demais artefatos produzidos pela IA a partir do seu material.</li>
                <li><strong>Dados de pagamento:</strong> processados diretamente pela Stripe. Não armazenamos números de cartão em nossos servidores.</li>
                <li><strong>Dados de uso e telemetria:</strong> logs técnicos, endereço IP, tipo de dispositivo, navegador, páginas acessadas e ações realizadas, para fins de segurança e melhoria do serviço.</li>
                <li><strong>Cookies essenciais:</strong> apenas os necessários para autenticação e funcionamento da sessão.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">3. Finalidades do tratamento</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Prestar os serviços contratados (geração de conteúdo com IA, sites de igreja, gestão de voluntários, editor de vídeo).</li>
                <li>Autenticar e proteger sua conta.</li>
                <li>Processar cobranças, renovações e reembolsos.</li>
                <li>Enviar comunicações operacionais (confirmações, avisos de fatura, alertas de segurança).</li>
                <li>Melhorar a plataforma, corrigir erros e prevenir fraudes.</li>
                <li>Cumprir obrigações legais e regulatórias.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">4. Bases legais</h2>
              <p>Tratamos seus dados com base em uma ou mais das hipóteses do art. 7º da LGPD:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Execução de contrato (prestação dos serviços contratados).</li>
                <li>Cumprimento de obrigação legal ou regulatória.</li>
                <li>Legítimo interesse (segurança, prevenção a fraude e melhoria do serviço).</li>
                <li>Consentimento (para comunicações opcionais de marketing).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">5. Compartilhamento com terceiros (subprocessadores)</h2>
              <p>
                Contratamos fornecedores especializados para operar partes da plataforma. Cada um recebe apenas o dado estritamente necessário para executar sua função:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Provedor de infraestrutura, banco de dados e autenticação:</strong> hospedagem, armazenamento e login.</li>
                <li><strong>Gateway de IA:</strong> processamento de texto, imagens e áudio para geração de conteúdo.</li>
                <li><strong>Stripe:</strong> processamento seguro de pagamentos.</li>
                <li><strong>Serviço de transcrição de áudio:</strong> conversão de fala em texto.</li>
                <li><strong>Provedor de e-mail transacional:</strong> envio de confirmações e notificações.</li>
                <li><strong>Editor de vídeo (Klap):</strong> geração e edição de cortes verticais quando você utiliza o módulo de vídeo.</li>
              </ul>
              <p className="mt-3">
                Não vendemos seus dados. Compartilhamento com autoridades ocorre apenas mediante ordem judicial ou obrigação legal.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">6. Retenção e exclusão</h2>
              <p>
                Mantemos seus dados enquanto sua conta estiver ativa ou pelo tempo necessário para cumprir as finalidades descritas. Após a solicitação de exclusão, removemos seus dados pessoais em até <strong>30 dias</strong>, ressalvadas as hipóteses de guarda obrigatória por lei (ex.: registros fiscais).
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">7. Seus direitos como titular</h2>
              <p>Nos termos da LGPD, você pode a qualquer momento:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Confirmar a existência de tratamento e acessar seus dados.</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
                <li>Solicitar anonimização, bloqueio ou eliminação.</li>
                <li>Solicitar portabilidade.</li>
                <li>Revogar o consentimento.</li>
                <li>Peticionar perante a Autoridade Nacional de Proteção de Dados (ANPD).</li>
              </ul>
              <p className="mt-3">
                Para exercer qualquer desses direitos, escreva para <a href="mailto:contato@midias.app" className="text-primary hover:underline">contato@midias.app</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">8. Segurança</h2>
              <p>
                Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia em trânsito (HTTPS/TLS), isolamento por usuário via Row-Level Security no banco de dados, autenticação robusta e controle de acesso. Nenhum sistema é 100% imune, e você também é responsável por manter suas credenciais em segurança.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">9. Cookies</h2>
              <p>
                Utilizamos apenas cookies essenciais para autenticação e manutenção da sessão. Não usamos cookies de rastreamento publicitário de terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">10. Crianças e adolescentes</h2>
              <p>
                O Ide.On não é direcionado a menores de 13 anos e não coleta intencionalmente dados dessa faixa etária. Menores entre 13 e 18 anos devem utilizar a plataforma com autorização e supervisão de responsáveis.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">11. Alterações desta política</h2>
              <p>
                Podemos atualizar esta política periodicamente. Mudanças relevantes serão comunicadas por e-mail ou aviso destacado na plataforma. A data de "última atualização" no topo indica a versão vigente.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">12. Contato</h2>
              <p>
                Dúvidas, solicitações ou reclamações relacionadas a esta política: <a href="mailto:contato@midias.app" className="text-primary hover:underline">contato@midias.app</a>.
              </p>
            </section>
          </article>
        </GlassCard>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <Link to="/termos" className="text-primary hover:underline">Termos de Serviço</Link>
          {" · "}
          <Link to="/suporte" className="text-primary hover:underline">Suporte</Link>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
