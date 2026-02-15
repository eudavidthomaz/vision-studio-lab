

# Correção: Adicionar handler para `invoice.payment_succeeded`

## Problema

O Stripe envia `invoice.payment_succeeded` a cada pagamento bem-sucedido (incluindo renovações). O webhook atual **ignora** esse evento completamente -- cai no `default` case e retorna `{"received": true}` sem executar nenhuma lógica.

O evento contém `metadata.user_id` dentro de `parent.subscription_details.metadata`, que e a forma mais confiavel de identificar o usuario (nao depende de email).

## Correção

### `supabase/functions/stripe-webhook/index.ts`

Adicionar um novo `case 'invoice.payment_succeeded'` antes do `case 'invoice.payment_failed'` com a seguinte logica:

1. Extrair o `subscriptionId` do invoice
2. Buscar `user_id` em 3 niveis (prioridade):
   - `invoice.parent?.subscription_details?.metadata?.user_id` (metadata direto do evento)
   - Tabela `subscriptions` via `stripe_subscription_id`
   - `invoice.subscription_details?.metadata?.user_id` (formato alternativo do Stripe)
3. Se encontrar o `user_id`:
   - Recuperar a subscription do Stripe para obter o `product_id`
   - Determinar a role via `PRODUCT_TO_ROLE`
   - Atualizar `user_roles` (delete + insert)
   - Atualizar tabela `subscriptions` com status `active` e timestamps
4. Se nao encontrar, logar aviso e continuar

```text
Fluxo:
invoice.payment_succeeded
  -> Extrair subscription_id
  -> Buscar user_id (metadata > DB > fallback metadata)
  -> Buscar subscription no Stripe (product_id -> role)
  -> UPDATE user_roles (delete old + insert new role)
  -> UPSERT subscriptions table
  -> Log sucesso
```

### Por que isso resolve

- `checkout.session.completed`: Ja tratado -- funciona na primeira compra
- `invoice.payment_succeeded`: **Agora sera tratado** -- funciona em renovacoes E como redundancia na primeira compra
- `customer.subscription.updated/deleted`: Ja tratados -- cobrem mudancas de plano e cancelamentos

A redundancia e intencional: se o `checkout.session.completed` falhar (ex: `user_id` nao veio no `client_reference_id`), o `invoice.payment_succeeded` serve como fallback usando o `user_id` do metadata da subscription.

## Arquivo Modificado

| Arquivo | Mudanca |
|---|---|
| `supabase/functions/stripe-webhook/index.ts` | Novo handler `invoice.payment_succeeded` com lookup de user_id via metadata e atualizacao de role |
