

# Corrigir Role Sendo Sobrescrita pelo check-subscription

## Problema Raiz
A Edge Function `check-subscription` e chamada automaticamente a cada 60 segundos. Ela consulta o Stripe e, ao nao encontrar assinatura ativa, **deleta a role atual e insere 'free'**. Isso sobrescreve qualquer role definida manualmente (como 'admin').

## Solucao
Modificar a Edge Function `check-subscription` para **preservar a role 'admin'**. Se o usuario ja tem role 'admin' no banco, a funcao deve respeitar e retornar essa role sem sobrescrever.

## Detalhes Tecnicos

### Arquivo: `supabase/functions/check-subscription/index.ts`

Adicionar uma verificacao no inicio da funcao, logo apos autenticar o usuario:

```typescript
// Check if user has admin role - admins bypass Stripe check
const { data: currentRole } = await supabaseClient
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .single();

if (currentRole?.role === 'admin') {
  logStep("User is admin, bypassing Stripe check");
  return new Response(JSON.stringify({
    subscribed: true,
    role: 'admin',
    product_id: null,
    subscription_end: null
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}
```

Isso sera inserido apos a linha 45 (depois da autenticacao do usuario), garantindo que admins nunca tenham sua role sobrescrita pelo fluxo Stripe.

### Impacto
- Admins terao acesso permanente sem depender do Stripe
- Usuarios normais (free/pro/team) continuam sincronizando via Stripe normalmente
- Nenhuma outra Edge Function precisa ser alterada pois todas consultam a tabela `user_roles` diretamente

## Arquivos Modificados

| Arquivo | Acao |
|---|---|
| `supabase/functions/check-subscription/index.ts` | Adicionar bypass para role admin |

