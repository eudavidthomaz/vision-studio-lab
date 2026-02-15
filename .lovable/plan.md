
# Atualizar Role do Usuário para Admin

## Problema
A role do usuario `contato@ligadafotografia.com.br` continua como `free` no banco de dados. As tentativas anteriores de UPDATE nao persistiram porque o tool de query disponivel e somente leitura (read-only).

## Solucao
Executar uma migration SQL para atualizar a role de `free` para `admin` na tabela `user_roles`. Isso desbloqueia todas as funcionalidades sem limite.

## Detalhes Tecnicos

### Migration SQL
```sql
UPDATE public.user_roles 
SET role = 'admin', updated_at = NOW() 
WHERE user_id = '353c92c3-e868-4c63-8e7a-c0966031d0a7';
```

### Apos a migration
- O usuario tera role `admin` com limites de 9999 para todas as features
- A Edge Function `extract-youtube-content` passara a aceitar as requisicoes
- Sera necessario fazer logout/login ou aguardar ~60s para o cache do frontend atualizar

## Arquivos Modificados

| Arquivo | Acao |
|---|---|
| Nova migration SQL | Criar (UPDATE user_roles) |
