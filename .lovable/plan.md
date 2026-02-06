

# Plano: Corrigir Sincronizacao Automatica de Assinaturas

## Problema Identificado

**Causa Raiz**: O email do cliente no Stripe nao corresponde ao email do usuario no Supabase. A funcao `check-subscription` busca clientes pelo email, e quando nao encontra, retorna `role: 'free'`.

**Evidencia**: Logs mostram "No customer found" para emails de usuarios pagantes, indicando que o Stripe registrou esses clientes com emails diferentes.

---

## Solucao Proposta

### 1. Salvar o Customer ID do Stripe Durante o Checkout

**Problema Atual**: O `create-checkout` passa os metadados, mas nao ha como recuperar o `customer_id` apos o checkout ser concluido sem um webhook.

**Solucao**: Usar o parametro `client_reference_id` do Stripe Checkout para armazenar o `user_id` do Supabase.

### 2. Modificar `check-subscription` para Buscar por Multiplos Metodos

Implementar fallback de busca:
1. Primeiro: Buscar cliente por email (metodo atual)
2. Segundo: Verificar na tabela `subscriptions` se ja existe um `stripe_customer_id` salvo
3. Terceiro: Listar todas assinaturas ativas e verificar pelo `metadata.user_id`

---

## Alteracoes Tecnicas

### Arquivo 1: `supabase/functions/create-checkout/index.ts`

Adicionar `client_reference_id` com o `user_id`:

```typescript
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  customer_email: customerId ? undefined : user.email,
  client_reference_id: user.id,  // ADICIONAR
  line_items: [
    {
      price: priceId,
      quantity: 1,
    },
  ],
  mode: "subscription",
  success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/pricing?checkout=canceled`,
  metadata: {
    user_id: user.id,
  },
  subscription_data: {
    metadata: {
      user_id: user.id,  // ADICIONAR - Salva no objeto subscription
    },
  },
});
```

### Arquivo 2: `supabase/functions/check-subscription/index.ts`

Modificar para usar fallback de busca:

```typescript
// Passo 1: Verificar se ja temos o customer_id salvo
const { data: existingSub } = await supabaseClient
  .from('subscriptions')
  .select('stripe_customer_id')
  .eq('user_id', user.id)
  .single();

let customerId: string | null = null;

if (existingSub?.stripe_customer_id) {
  // Usar customer ID ja salvo
  customerId = existingSub.stripe_customer_id;
  logStep("Using saved customer ID", { customerId });
} else {
  // Fallback: buscar por email
  const customers = await stripe.customers.list({ email: user.email, limit: 1 });
  if (customers.data.length > 0) {
    customerId = customers.data[0].id;
    logStep("Found customer by email", { customerId });
  }
}

// Passo 2: Se ainda nao encontrou, buscar por metadata nas subscriptions
if (!customerId) {
  const allSubs = await stripe.subscriptions.search({
    query: `metadata['user_id']:'${user.id}'`,
    limit: 1,
  });
  
  if (allSubs.data.length > 0) {
    customerId = allSubs.data[0].customer as string;
    logStep("Found customer by subscription metadata", { customerId });
  }
}
```

### Arquivo 3: Nova Edge Function `handle-checkout-success`

Criar endpoint para processar o sucesso do checkout:

```typescript
// Quando usuario retorna com ?session_id=...
// Buscar a session no Stripe e atualizar tabelas

const session = await stripe.checkout.sessions.retrieve(sessionId, {
  expand: ['subscription', 'customer'],
});

if (session.status === 'complete') {
  const userId = session.client_reference_id;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  
  // Atualizar tabelas com os dados corretos
  await supabaseClient
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      // ...
    });
}
```

---

## Fluxo Corrigido

```text
Usuario clica em "Assinar"
         |
         v
create-checkout (com client_reference_id = user_id)
         |
         v
Stripe Checkout (usuario pode alterar email)
         |
         v
Redireciona para /dashboard?checkout=success&session_id=xxx
         |
         v
Frontend chama handle-checkout-success com session_id
         |
         v
Edge function busca session no Stripe
         |
         v
Atualiza tabelas com stripe_customer_id correto
         |
         v
Proximas chamadas de check-subscription encontram cliente
```

---

## Correcao Imediata para Usuarios Atuais

Alem das correcoes de codigo, precisamos vincular manualmente os clientes atuais. Opcoes:

### Opcao A: Atualizar tabela subscriptions com customer IDs corretos

Execute a funcao `sync-subscription-roles` para sincronizar usuarios existentes.

### Opcao B: Atualizar metadata no Stripe

Adicionar o `user_id` nos metadados das subscriptions existentes no dashboard do Stripe.

---

## Resumo de Arquivos

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/create-checkout/index.ts` | Adicionar `client_reference_id` e `subscription_data.metadata` |
| `supabase/functions/check-subscription/index.ts` | Adicionar fallback de busca por `subscriptions` table e metadata |
| `src/pages/Dashboard.tsx` | Passar `session_id` para verificacao apos checkout |
| (Opcional) Nova edge function | `handle-checkout-success` para processar session |

---

## Beneficios

1. **Resiliencia**: Mesmo que usuario mude email no checkout, o vinculo e mantido via `client_reference_id`
2. **Cache Local**: Uma vez vinculado, o `stripe_customer_id` fica salvo na tabela `subscriptions`
3. **Retrocompatibilidade**: Mantem busca por email como fallback

