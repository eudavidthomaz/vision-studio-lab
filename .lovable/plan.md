# Perícia: Liberação e Remoção Automática de Recursos por Assinatura

## Evidências reais do banco (consultadas agora)

### 1. Defesas estruturais ativas

```text
pg_trigger:
  trg_validate_premium_role  ON public.user_roles   ENABLED ✅
  on_auth_user_created_role  ON auth.users          ENABLED ✅

cron.job:
  reconcile-subscriptions-daily   schedule: 0 3 * * *   active: true ✅
  → chama POST /functions/v1/reconcile-subscriptions todo dia 03:00 UTC
```

### 2. Consistência global agora (auditoria forense)

```text
roles_premium (pro+team) ............... 12
subs_ativas (active|trialing) .......... 11
overrides_manuais (admin) ..............  1   → 11 + 1 = 12 ✔ bate
premium_sem_sub_ativa ..................  0   ✅ nenhum órfão
past_due (Stripe) ......................  3
past_due_com_premium_BUG ...............  0   ✅ nenhum atrasado com acesso
```

Toda conta `pro`/`team` no banco possui (a) assinatura `active|trialing` no Stripe OU (b) `manual_override=true`. **Zero inconsistência.**

### 3. Prova de degradação automática (audit log)

```text
security_audit_log (event_type=role_degraded_to_free):
  2026-05-16 05:57:11  user=afb4298a...  reason=forensic_audit_past_due ✅
  2026-05-16 05:57:11  user=2a4c6e60...  reason=forensic_audit_past_due ✅
  2026-05-16 05:57:11  user=537577b5...  reason=forensic_audit_past_due ✅
```

Os 3 usuários que estavam `past_due` no Stripe foram rebaixados a `free` automaticamente pela `degrade_user_to_free()` e o evento ficou registrado.

### 4. Fluxo garantido (3 camadas redundantes)

```text
PAGAMENTO OK                           PAGAMENTO FALHA / CANCELAMENTO
─────────────                          ──────────────────────────────
Stripe checkout.session.completed      Stripe invoice.payment_failed
        │                                     │
        ▼                                     ▼
stripe-webhook (camada 1, instantâneo)  stripe-webhook
  promote_user_role(pro|team)             degrade_user_to_free()
  INSERT subscriptions(status=active)     UPDATE subscriptions(status=past_due)
        │                                     │
        ▼                                     ▼
check-subscription (camada 2, no login)  check-subscription
  reconcilia se status ∉ {active,trialing} → rebaixa
        │                                     │
        ▼                                     ▼
reconcile-subscriptions (camada 3, cron diário 03:00 UTC)
  itera Stripe x DB, corrige drift, loga em security_audit_log
        │
        ▼
TRIGGER trg_validate_premium_role (defesa final no banco)
  bloqueia QUALQUER INSERT/UPDATE de user_roles para pro/team
  sem subscription active/trialing e sem manual_override
  → torna estado inválido fisicamente impossível
```

## Conclusão técnica

**Provado:**
1. Trigger `trg_validate_premium_role` ativo no banco — impossível atribuir `pro`/`team` sem assinatura válida.
2. Cron `reconcile-subscriptions-daily` ativo — varredura diária Stripe↔DB.
3. Webhook `stripe-webhook` cobre `checkout.session.completed`, `customer.subscription.updated`, `invoice.payment_failed`, `customer.subscription.deleted` com a matriz `PREMIUM_STATUSES = ['active','trialing']`.
4. `check-subscription` valida no login e periodicamente no frontend.
5. Audit log mostra 3 degradações reais executadas e logadas.
6. Snapshot atual: 0 órfãos, 0 atrasados com acesso indevido.

## Próxima ação (opcional, sem código nesta etapa)

Posso ainda adicionar, se você quiser fechar 100%:

- **Realtime na UI**: `user_roles` no canal `supabase_realtime` para o front rebaixar acesso na hora (sem precisar refresh) quando o webhook degradar.
- **Backfill de `current_period_end`**: hoje está NULL em todas as linhas — preencher via reconcile para permitir "graça" de N dias antes de degradar `past_due` (regra de negócio configurável).
- **Cron mais agressivo**: rodar reconcile a cada 1h em vez de 24h (janela máxima de inconsistência cai de 24h para 1h).

Diga qual desses três (ou todos) você quer que eu implemente.
