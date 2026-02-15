

# Correção: Fluxo Automático de Ativação de Assinatura

## Problema Raiz

O usuário completou o checkout no Stripe, mas a role permaneceu `free` porque:

1. **Race condition no Dashboard.tsx**: O `useEffect` de checkout dispara ANTES da sessão de auth estar pronta (linhas 52-126). A chamada `handle-checkout-success` requer JWT válido (`verify_jwt = true` no config.toml), então o gateway rejeita com 401 antes mesmo da function executar -- zero logs, falha silenciosa.
2. **Sem retry**: Se a chamada falha, o erro é engolido no `console.error` e nada mais acontece.
3. **Webhook potencialmente com secret errado**: O `STRIPE_WEBHOOK_SECRET` no projeto pode não coincidir com `whsec_bFff6IWJWSjU1UQkTy2jjEyfSMPzN3TQ` do Stripe Dashboard.

---

## Correções

### 1. `supabase/config.toml` -- Desabilitar verify_jwt para handle-checkout-success

Mudar `verify_jwt = true` para `verify_jwt = false` na seção `[functions.handle-checkout-success]`. A validação JWT já é feita dentro do código da function (via `supabaseClient.auth.getUser(token)`), então a segurança é mantida, mas agora falhas de auth produzem logs para debug.

### 2. `src/pages/Dashboard.tsx` -- Corrigir race condition + retry + fallback

Reescrever o `useEffect` de checkout success (linhas 52-126):

- **Aguardar sessão de auth**: Só chamar `handle-checkout-success` quando `session` estiver disponível (já existe no state)
- **Retry com backoff exponencial**: 3 tentativas com delays de 1s, 2s, 4s
- **Fallback**: Se `handle-checkout-success` falhar após retries, chamar `check-subscription` diretamente (que também sincroniza a role)
- **Sempre invalidar cache**: Chamar `invalidateSubscription()` no final independente do resultado

```text
Fluxo corrigido:
1. Detecta ?checkout=success&session_id=xxx
2. Limpa query params da URL
3. Mostra confetti + toast imediatamente (UX)
4. Aguarda session de auth estar disponível
5. Chama handle-checkout-success (até 3 retries)
6. Se falhar, chama check-subscription como fallback
7. Invalida cache de subscription
```

### 3. `src/pages/Pricing.tsx` -- Botão "Atualizar Status"

Adicionar um botão discreto abaixo dos cards de plano que permite ao usuário forçar a sincronização chamando `check-subscription` manualmente. Serve como fallback de último recurso.

### 4. Atualizar o secret `STRIPE_WEBHOOK_SECRET`

Usar a ferramenta `add_secret` para atualizar o valor para `whsec_bFff6IWJWSjU1UQkTy2jjEyfSMPzN3TQ` conforme informado pelo Stripe Dashboard.

### 5. Corrigir manualmente o usuário afetado

Inserir o registro correto na tabela `subscriptions` e atualizar a role para `pro` via SQL para o user_id `afb4298a-4d93-40aa-ac8d-f83e5efd3f30`.

---

## Arquivos Modificados

| Arquivo | Mudança |
|---|---|
| `supabase/config.toml` | `handle-checkout-success` verify_jwt = false |
| `src/pages/Dashboard.tsx` | Reescrever useEffect de checkout com wait + retry + fallback |
| `src/pages/Pricing.tsx` | Adicionar botão "Atualizar Status da Assinatura" |

## Ação Manual Necessária

- Confirmar atualização do `STRIPE_WEBHOOK_SECRET` para o valor correto
- Correção manual do usuário `afb4298a` no banco de dados
