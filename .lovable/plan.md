

# Plano: Liberar Acesso Premium para Conta de Desenvolvedor

## Contexto

A conta `eudavidthomaz@gmail.com` é usada para desenvolvimento e testes dentro do Lovable. Atualmente está com `role = 'free'`, bloqueando o acesso à geração de imagens e outros recursos premium.

---

## Solução

Atualizar o role do usuário para `team` (acesso máximo) na tabela `user_roles`.

---

## Alteração no Banco de Dados

```sql
-- Atualizar role para 'team' (acesso completo)
UPDATE public.user_roles 
SET role = 'team' 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'eudavidthomaz@gmail.com'
);
```

---

## Resultado Esperado

| Antes | Depois |
|-------|--------|
| `role = 'free'` | `role = 'team'` |
| Bloqueado para gerar imagens | Acesso liberado |
| Limite de 10 imagens/mês | Limite de 200 imagens/mês |
| Sem live capture | 20 sessões de live capture |

---

## Observação

Esta é uma atualização manual para conta de desenvolvedor. O sistema de sincronização automática com Stripe (que implementamos anteriormente) continuará funcionando normalmente para usuários pagantes reais.

