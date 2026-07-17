# Plano: Páginas Públicas de Suporte, Privacidade e Termos

Criar 3 páginas públicas simples, com textos completos em PT-BR, seguindo o design system existente (GlassCard, tipografia Gunterz/Brother, fundo 3D global, Helmet para SEO) e o padrão das páginas atuais (`Landing`, `Pricing`).

## Escopo

### 1. `/suporte` — Central de Suporte
Conteúdo:
- Cabeçalho (logo + botão "Voltar ao app").
- Hero: "Como podemos ajudar?" + subtítulo.
- Canais de contato:
  - **E-mail**: `contato@midias.app` (SLA de resposta em até 48h úteis).
  - **WhatsApp**: link `wa.me` (placeholder a confirmar com o usuário — ver seção "Dados a confirmar").
  - **Instagram**: `@ideon.app` (placeholder).
- Seção FAQ (Accordion shadcn) com 6–8 perguntas cobrindo: como gerar conteúdo a partir de sermão, quotas do plano gratuito, upgrade/cancelamento, transcrição de áudio, editor de vídeo (Klap), sites de igreja, exclusão de conta/dados.
- Bloco "Status do sistema" (texto estático apontando para `status.midias.app` — informativo).
- Footer padrão com links para `/privacidade` e `/termos`.

### 2. `/privacidade` — Política de Privacidade
Conteúdo LGPD-compliant, redigido como app-owner (Ide.On / Midias.app):
- Controlador dos dados, contato do encarregado (DPO) via e-mail de suporte.
- Dados coletados: cadastro (nome, e-mail), autenticação (Google OAuth opcional), conteúdo enviado pelo usuário (sermões, áudios, transcrições, imagens), dados de uso e telemetria, cookies essenciais.
- Finalidades: prestação do serviço, geração de conteúdo com IA, billing, comunicação.
- Bases legais (LGPD art. 7): execução de contrato, consentimento, legítimo interesse.
- Compartilhamento com subprocessadores (lista genérica, sem afirmar certificações): provedor de infra/banco, gateway de IA, provedor de pagamento (Stripe), transcrição de áudio, e-mail transacional.
- Retenção: enquanto a conta estiver ativa; exclusão em até 30 dias após solicitação.
- Direitos do titular (acesso, correção, exclusão, portabilidade, revogação de consentimento) e como exercê-los via `contato@midias.app`.
- Segurança: RLS, criptografia em trânsito, autenticação — descrito como práticas do app-owner, sem promessas absolutas.
- Cookies: apenas essenciais para sessão/autenticação.
- Menores: serviço não direcionado a menores de 13.
- Atualizações da política e data de vigência.

### 3. `/termos` — Termos de Serviço
- Aceitação dos termos ao criar conta.
- Descrição do serviço: plataforma SaaS de geração de conteúdo assistido por IA para igrejas (sermões → posts, stories, reels, carrosséis; sites de igreja; gestão de voluntários; editor de vídeo).
- Cadastro e responsabilidade da conta/senha.
- Planos, cobrança recorrente (Stripe), renovação automática, cancelamento a qualquer momento (acesso até fim do ciclo), reembolso conforme legislação (CDC — 7 dias para arrependimento em contratação à distância).
- Uso aceitável: proibição de conteúdo ilegal, discurso de ódio, proselitismo político-eleitoral (alinhado ao guard-rail já existente no backend), spam, engenharia reversa, revenda não autorizada.
- Propriedade intelectual: o usuário mantém direitos sobre o conteúdo enviado e gerado; concede licença limitada ao Ide.On para operar o serviço. Ide.On detém a plataforma, marca e código.
- Conteúdo gerado por IA: revisão humana recomendada; usuário é responsável pela publicação final.
- Limitação de responsabilidade e isenção de garantias (serviço "as is" nos limites do CDC).
- Suspensão/encerramento por violação.
- Alterações dos termos com aviso prévio.
- Lei aplicável (Brasil) e foro.
- Data de vigência.

## Implementação técnica

Arquivos a criar:
- `src/pages/Support.tsx`
- `src/pages/Privacy.tsx`
- `src/pages/Terms.tsx`

Arquivos a editar:
- `src/App.tsx`: registrar rotas `/suporte`, `/privacidade`, `/termos` (import estático, seguindo padrão atual).
- `src/pages/Landing.tsx`: adicionar links de rodapé para as 3 páginas.
- `public/sitemap.xml`: incluir as 3 novas URLs.

Padrões seguidos:
- `Helmet` com title/description/canonical/og próprios por página.
- Layout: header minimalista (logo + botão voltar), `GlassCard` para blocos de conteúdo, tipografia `font-gunterz` em H1/H2, `font-brother` no wordmark, prose com `text-muted-foreground` e `text-foreground`.
- Mobile-first, sem hardcode de cor (tokens semânticos).
- Sem lógica de negócio, sem chamadas de backend — 100% estático.

## Dados a confirmar com o usuário (antes de implementar)

Para evitar inventar informações sensíveis, preciso confirmar:

1. **E-mail de suporte oficial**: uso `contato@midias.app`? Ou outro?
2. **WhatsApp/Instagram**: incluir? Se sim, quais números/handles?
3. **Razão social / CNPJ** para os Termos e Política (se pessoa jurídica). Se preferir, uso apenas "Ide.On / Midias.app" sem CNPJ.
4. **Foro** (comarca) para os Termos.
5. **DPO / encarregado LGPD**: usar o mesmo e-mail de suporte?

Se preferir, sigo com placeholders razoáveis (e-mail `contato@midias.app`, sem WhatsApp/Instagram, sem CNPJ, foro "comarca do domicílio do contratante", DPO = e-mail de suporte) e você ajusta depois.
