

# Correção: "Invalid time value" no stripe-webhook

## Problema

O webhook está **recebendo eventos corretamente** do Stripe (a configuração está 100% OK), mas falha ao processar `checkout.session.completed` com erro `"Invalid time value"`.

**Causa**: `new Date(subscription.current_period_start * 1000).toISOString()` lança exceção quando `current_period_start` é `null` ou `undefined`. Isso pode ocorrer em eventos de teste do Stripe ou em edge cases de assinaturas recém-criadas.

## Correção

### `supabase/functions/stripe-webhook/index.ts`

Adicionar função helper para converter timestamps Unix do Stripe de forma segura:

```text
function safeTimestamp(unix: number | null | undefined): string | null {
  if (!unix || typeof unix !== 'number') return null;
  return new Date(unix * 1000).toISOString();
}
```

Substituir todas as ocorrencias de `new Date(subscription.current_period_start * 1000).toISOString()` e `current_period_end` por chamadas a `safeTimestamp()` nos 3 handlers:

- `checkout.session.completed` (linhas 83-84)
- `customer.subscription.updated` (linhas 110-111 e 130-131)
- `customer.subscription.deleted` (nenhum timestamp, OK)

Isso garante que o upsert/update no banco não falhe mesmo com dados incompletos do Stripe.

## Arquivos Modificados

| Arquivo | Mudança |
|---|---|
| `supabase/functions/stripe-webhook/index.ts` | Adicionar `safeTimestamp()` helper e usar em todos os handlers |

