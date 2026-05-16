## Perícia Técnica — Controle de Acesso de Pagantes

### 🔬 Evidências coletadas do banco (provas conclusivas)

**Query 1 — Distribuição de papéis vs assinaturas:**
- 15 usuários com role premium (`pro`/`team`)
- 11 subscriptions `active`, 3 `past_due`, 5 `canceled`

**Query 2 — Inconsistências críticas detectadas:**

| user_id | role atual | status Stripe | current_period_end | Diagnóstico |
|---|---|---|---|---|
| afb4298a… | **pro** | **past_due** | NULL | 🚨 Inadimplente com acesso |
| 2a4c6e60… | **pro** | **past_due** | NULL | 🚨 Inadimplente com acesso |
| 537577b5… | **pro** | **past_due** | NULL | 🚨 Inadimplente com acesso |
| fb8cd204… | **team** | (sem subscription) | NULL | ⚠️ Manual, sem rastreio |

**Query 3 — Coluna `current_period_end` está 100% NULL em TODAS as linhas** (active, past_due, canceled). O sistema não tem como tomar decisão temporal sem essa data.

---

### 🎯 Causa raiz (3 falhas combinadas)

**Falha #1 — `stripe-webhook` em `invoice.payment_failed` (linha 266-283):**
```ts
await supabase.from('subscriptions').update({ status: 'past_due' })
  .eq('stripe_subscription_id', subscriptionId);
// ❌ NÃO degrada user_roles
```
Quando uma fatura falha, marca subscription como past_due mas **mantém role pro/team**. Esta é a causa direta dos 3 usuários inadimplentes com acesso.

**Falha #2 — `stripe-webhook` em `customer.subscription.updated` (linhas 159-165):**
```ts
if (status === 'active') { …promote… }
else if (status === 'canceled' || status === 'unpaid') { …degrade… }
// ❌ past_due, incomplete_expired, paused: nenhuma ação
```
Estados intermediários nunca degradam o role.

**Falha #3 — `check-subscription` (frontend) só roda no login:**
- Lista `status: "active"` apenas — past_due seria detectado como sem assinatura ativa e degradaria role pro→free.
- **MAS** só executa quando o usuário abre o app. Se o inadimplente parar de logar, role nunca degrada.
- Não há job/cron que valide periodicamente.

**Falha #4 (corolário) — `current_period_end` nunca persistida em estados não-ativos:**
Webhook só popula a data quando `active`. Em past_due/canceled fica NULL, impedindo qualquer regra do tipo "se period_end < now() então free".

---

### 🛠️ Solução cirúrgica e definitiva

**1. Corrigir `stripe-webhook/index.ts` (raiz da regressão):**

a) `invoice.payment_failed`: degradar role para `free` e popular `current_period_end` a partir do `invoice.lines.data[0].period.end` (ou retrieve da subscription).

b) `customer.subscription.updated`: cobrir TODOS os estados não-ativos com matriz explícita:
```ts
const PREMIUM_STATUSES = ['active', 'trialing'];
if (PREMIUM_STATUSES.includes(status)) {
  // promote to role mapped from product
} else {
  // ['past_due','unpaid','canceled','incomplete','incomplete_expired','paused']
  // degrade to free
}
```

c) `customer.subscription.deleted`: já correto, manter.

d) Sempre persistir `current_period_end` e `status` em qualquer evento, independente do resultado.

**2. Endurecer `check-subscription/index.ts`:**

a) Trocar `status: "active"` por buscar a subscription mais recente do customer (qualquer status) e decidir role pelo status + `current_period_end > now()`.

b) Remover o "preserve manual role" silencioso (linha 116-128) — quando não há customer no Stripe, NÃO promover. Roles manuais devem ser tratados com flag explícita (ex.: coluna `manual_override boolean` em `user_roles`) e não como side-effect.

**3. Job/Edge Function de reconciliação periódica (`reconcile-subscriptions`):**

- Executa diariamente (cron job no Supabase ou GitHub Actions chamando a function).
- Itera por todos os `user_roles` com role ∈ {pro, team, admin←skip}.
- Para cada um, busca subscription no Stripe (por user_id em `subscriptions.stripe_customer_id`).
- Se não houver subscription `active|trialing` → degrada para `free`.
- Loga em `security_audit_log` toda degradação para auditoria.
- Esta é a rede de segurança caso o webhook falhe.

**4. Migração de correção imediata (one-shot):**

- Rebaixar os 3 usuários past_due para `free` agora.
- Decisão pendente: o usuário `fb8cd204` (team manual, sem sub) — manter como override admin ou degradar? Pergunto antes de executar.

**5. Constraint de integridade no DB:**

Trigger `validate_role_subscription`: ao INSERT/UPDATE em `user_roles` com role ∈ {pro,team}, exigir que exista linha em `subscriptions` com `status IN ('active','trialing')` OU flag `manual_override=true`. Bloqueia regressões futuras na origem.

---

### 📋 Ordem de execução proposta

1. Corrigir `stripe-webhook` (cobre todos os estados + persiste period_end).
2. Endurecer `check-subscription` (decisão por status + data, não só "active").
3. Migração: adicionar `manual_override` em `user_roles` + trigger de validação.
4. Migração one-shot: degradar os 3 past_due, marcar `fb8cd204` como override (se confirmado).
5. Criar `reconcile-subscriptions` edge function + agendar cron diário.

### ❓ Decisões necessárias antes de implementar

1. O usuário `fb8cd204-ec84-43af-8651-a5e6b05330a9` (team sem subscription) é um override administrativo legítimo (cortesia/staff) ou deve ser degradado?
2. Posso assumir que `trialing` também concede acesso premium? (padrão sim)
3. Período de carência para `past_due`: degradar imediatamente no `invoice.payment_failed` ou aguardar X dias? (Stripe normalmente faz 3–4 tentativas em ~3 semanas antes de virar `canceled`/`unpaid`)
