## Objetivo
Provar via banco que o webhook Stripe agora está sendo chamado e está reconciliando `subscriptions` + `user_roles` corretamente em tempo real (sem depender do `check-subscription`).

## Passos da perícia (somente leitura no banco + logs)

### 1. Confirmar entrega de eventos do Stripe
- `supabase--edge_function_logs(function_name="stripe-webhook")` — verificar últimos eventos recebidos: `[STRIPE-WEBHOOK] Event received`, tipo (`checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`) e ausência de `Signature verification failed`.
- `supabase--analytics_query` em `function_edge_logs` filtrando `function_id` do stripe-webhook nas últimas 2h — contar status 200 vs 4xx/5xx.

### 2. Provar reconciliação em tempo real
Query em `security_audit_log` (últimas 2h):
```sql
SELECT created_at, user_id, event_type, metadata->>'reason' AS reason
FROM security_audit_log
WHERE event_type IN ('role_promoted','role_degraded_to_free')
  AND created_at > now() - interval '2 hours'
ORDER BY created_at DESC;
```
- **Prova de sucesso**: `reason` começando com `checkout.completed:`, `customer.subscription.*:`, `invoice.paid:` ou `invoice.payment_failed:` (não mais só `check-subscription:`).

### 3. Coerência Stripe ↔ DB nos últimos 7 dias
```sql
SELECT s.user_id, s.status, s.current_period_end, s.cancel_at_period_end,
       ur.role, s.updated_at
FROM subscriptions s
LEFT JOIN user_roles ur ON ur.user_id = s.user_id
WHERE s.updated_at > now() - interval '7 days'
ORDER BY s.updated_at DESC;
```
Validar:
- `status='active'` → `role IN ('pro','team')`
- `status IN ('past_due','canceled','unpaid')` → `role='free'`
- `current_period_end` preenchido (não NULL)

### 4. Teste ativo (live fire) via Stripe API
Usando `stripe--stripe_api_execute`:
- a) **Listar** as 3 subscriptions mais recentes (`GetSubscriptions`) e pegar uma de teste.
- b) **Disparar evento real**: fazer um `update` trivial na subscription (ex.: `metadata.test_ping=now`) via `PostSubscriptionsSubscription`. Isso força o Stripe a emitir `customer.subscription.updated` → o webhook deve receber.
- c) Aguardar ~5s, reler `security_audit_log` filtrando pelo `user_id` correspondente — deve aparecer linha nova com `reason='customer.subscription.updated:active'` e `created_at` posterior ao ping.
- d) Reler `subscriptions.updated_at` desse user — deve refletir o instante do webhook.

### 5. Teste de degradação (opcional, não destrutivo)
Pegar um customer de teste em sandbox e simular `invoice.payment_failed` via dashboard ou — se preferir não tocar produção — apenas validar via logs históricos se algum `past_due` já foi capturado.

## Entregável
Relatório no chat com:
- Contagem de eventos recebidos pelo webhook nas últimas 2h
- Linhas do `security_audit_log` provando promotions/degradations via webhook
- Resultado do "live ping" (timestamp do disparo vs timestamp do audit log) — esta é a prova cirúrgica de que o webhook está vivo
- Tabela de coerência `subscriptions.status` ↔ `user_roles.role`

Sem alterações de código nem schema. Apenas leitura + 1 update inócuo de metadata no Stripe.