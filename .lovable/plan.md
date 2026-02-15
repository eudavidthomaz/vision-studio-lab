

# Plano: Criar Webhook do Stripe para Sincronizacao Automatica

## Problema Atual

O projeto nao possui um webhook do Stripe. A sincronizacao depende exclusivamente de:
1. O frontend chamar `handle-checkout-success` apos o redirect (falha se usuario fechar o navegador)
2. `check-subscription` rodando a cada minuto (atraso de ate 1 minuto, e faz chamadas desnecessarias ao Stripe)

Eventos criticos como cancelamento, renovacao e falha de pagamento nao sao capturados.

---

## Solucao

Criar uma Edge Function `stripe-webhook` que:
- Recebe eventos diretamente do Stripe
- Verifica a assinatura criptografica (`stripe-signature`)
- Atualiza automaticamente `user_roles` e `subscriptions` em tempo real

---

## Eventos Processados

| Evento Stripe | Acao |
|--------------|------|
| `checkout.session.completed` | Vincula customer_id ao usuario, ativa role |
| `customer.subscription.updated` | Atualiza datas e status |
| `customer.subscription.deleted` | Reverte role para `free` |
| `invoice.payment_failed` | Marca status como `past_due` |

---

## Alteracoes Tecnicas

### 1. Nova Edge Function: `supabase/functions/stripe-webhook/index.ts`

```typescript
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const PRODUCT_TO_ROLE = {
  'prod_TYdDZJuSPTQgsn': 'pro',
  'prod_TYdDnWDdVthKIs': 'team',
};

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2025-08-27.basil",
  });

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body, signature, webhookSecret
    );
  } catch (err) {
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  // Processar eventos...
  // checkout.session.completed -> vincular customer, ativar role
  // customer.subscription.updated -> atualizar status/datas
  // customer.subscription.deleted -> reverter para free
  // invoice.payment_failed -> marcar past_due

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
```

### 2. Novo Secret: `STRIPE_WEBHOOK_SECRET`

Sera necessario configurar o webhook no Stripe Dashboard e salvar o signing secret como variavel de ambiente.

### 3. Atualizar `supabase/config.toml`

Adicionar a nova funcao e marcar como `verify_jwt = false` (webhooks do Stripe nao enviam JWT).

```toml
[functions.stripe-webhook]
verify_jwt = false
```

---

## Configuracao no Stripe

Apos a funcao ser deployada, voce precisara:

1. Acessar o Stripe Dashboard > Developers > Webhooks
2. Adicionar endpoint: `https://imitktxtunqovyqsmplb.supabase.co/functions/v1/stripe-webhook`
3. Selecionar eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copiar o **Signing Secret** (comeca com `whsec_...`)
5. Informar o secret aqui no Lovable para ser salvo como `STRIPE_WEBHOOK_SECRET`

---

## Fluxo Atualizado

```text
Usuario paga no Stripe
        |
        v
Stripe envia evento via webhook
        |
        v
stripe-webhook verifica assinatura
        |
        v
Identifica usuario via client_reference_id ou metadata
        |
        v
Atualiza user_roles + subscriptions
        |
        v
Frontend detecta mudanca na proxima verificacao
```

---

## Compatibilidade

- O `handle-checkout-success` e `check-subscription` continuam funcionando como fallback
- O webhook adiciona uma camada de confiabilidade que nao depende do frontend
- Cancelamentos e falhas de pagamento passam a ser tratados automaticamente

---

## Resumo de Arquivos

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/stripe-webhook/index.ts` | Nova funcao - processa eventos do Stripe |
| `supabase/config.toml` | Adicionar configuracao com `verify_jwt = false` |
| Secret `STRIPE_WEBHOOK_SECRET` | Novo secret a ser configurado |

