
# Perícia: Upgrades de assinantes nas últimas 48h

## 1. Resultado direto

**10 novos assinantes nas últimas 48h. Todos os 10 estão com role `pro` ativa no banco.** Zero órfãos, zero pagantes sem upgrade.

```text
email                                  status   role  promovido_em (UTC)
─────────────────────────────────────  ───────  ────  ───────────────────
ricardo.barbosa.lima@gmail.com         active   pro   2026-05-26 04:06
helenraquelcosta1@gmail.com            active   pro   2026-05-26 01:23
jp_anf@hotmail.com                     active   pro   2026-05-25 18:28
contato@ipdauniversal.com.br           active   pro   2026-05-26 03:32
chamaviva.samuelsylva903@gmail.com     active   pro   2026-05-25 19:36
igrejabatistamaranata.oficial@gmail    active   pro   2026-05-25 13:01
felipe.ludwig.schimid@gmail.com        active   pro   2026-05-26 01:20
videirabarradobugres@gmail.com         active   pro   2026-05-24 22:51
amaliafreitas@me.com                   active   pro   2026-05-24 18:08
midiaquadrangular.ap@gmail.com         active   pro   2026-05-24 15:00
```

100% dos assinantes recentes têm `subscriptions.status='active'` + `user_roles.role='pro'`. Coerência total Stripe ↔ DB.

## 2. Achado importante (não bloqueante, mas relevante)

**Todos os 10 upgrades foram disparados pela camada 2 (`check-subscription`), nenhum pela camada 1 (`stripe-webhook`).**

Evidência no `security_audit_log`:
```text
reason em 100% dos role_promoted: "check-subscription:active"
reason esperado se webhook funcionasse: "checkout.completed:active"
```

Implicações:
- O upgrade **só acontece quando o usuário abre o app** (no login o `useSubscription` chama `check-subscription`). 
- Se o usuário pagar e **não abrir o app**, ele fica `free` no banco até abrir.
- Casos observados: `ricardo.barbosa.lima` pagou às 03:14, virou pro às 04:06 → **52 min de atraso**.
- O webhook do Stripe provavelmente está: (a) não configurado para esses eventos, (b) com endpoint/secret errado, ou (c) falhando silenciosamente.

Sintoma adicional: `current_period_start` e `current_period_end` estão **NULL em todas as 10 linhas** — o webhook persistiria esses campos a partir do payload do Stripe; o `check-subscription` também persiste, mas a coluna ficou NULL, sugerindo que a versão da API Stripe (`2025-08-27.basil`) não está retornando esses campos no `subscriptions.list` no mesmo nível esperado (ficaram em `items[].current_period_*` no novo schema).

## 3. Risco prático

- **Upgrade não-instantâneo**: usuário paga e pode ver tela "free" até dar refresh / logar de novo.
- **Sem `current_period_end`**: não conseguimos aplicar grace period nem mostrar "sua próxima cobrança em X".
- **Downgrade futuro**: se Stripe mandar `invoice.payment_failed` por webhook e o webhook estiver quebrado, o usuário inadimplente **continua com pro até o cron das 03:00 UTC** rodar.

## 4. Plano de correção (próximo passo, se aprovado)

1. **Diagnosticar webhook**: ler logs de `stripe-webhook` das últimas 48h para confirmar se eventos `checkout.session.completed` chegaram (e falharam) ou nem chegaram (endpoint desalinhado no Stripe Dashboard).
2. **Corrigir leitura de `current_period_start/end`** em `check-subscription` e `stripe-webhook` para a API Stripe `2025-08-27.basil` (ler de `subscription.items.data[0].current_period_*` como fallback).
3. **Backfill** dos 10 registros atuais via reconcile manual após o fix.
4. **Reduzir cron** para 1h (de 24h) enquanto webhook não estiver 100% — janela máxima de inconsistência cai para 1h.
5. **Realtime em `user_roles`** para o frontend rebaixar/promover instantaneamente sem refresh.

Diga "implementar" para eu seguir com o passo 1 (diagnóstico de logs do webhook) e os fixes daí em diante.
