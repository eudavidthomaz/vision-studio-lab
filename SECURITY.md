# Segurança - Ide.On Vision Studio

## Visão Geral

Este documento descreve as medidas de segurança implementadas no Ide.On Vision Studio para proteger dados dos usuários e garantir uso responsável da plataforma.

## 🔒 Medidas de Segurança Implementadas

### 1. Autenticação e Autorização

- ✅ **Row Level Security (RLS)** ativado em todas as tabelas
- ✅ **Políticas RLS** granulares por tabela e operação
- ✅ **Auto-confirmação de email** habilitada para fluxo simplificado
- ✅ **JWT verificação** em todas as edge functions
- ✅ **Sistema de roles** com segurança definer functions

### 2. Rate Limiting

Limites de requisições por hora implementados para cada endpoint:

| Endpoint | Limite | Janela |
|----------|--------|--------|
| `transcribe-sermon` | 10 req | 1 hora |
| `generate-week-pack` | 20 req | 1 hora |
| `generate-ideon-challenge` | 30 req | 1 hora |
| `generate-content-idea` | 50 req | 1 hora |
| `generate-post-image` | 30 req | 1 hora |

**Implementação:**
- Tracking automático via tabela `rate_limits`
- Função `check_rate_limit()` no PostgreSQL
- Respostas HTTP 429 com header `Retry-After`
- UI mostra uso atual vs. limite

### 3. Validação de Entrada

**Validação no Backend (Edge Functions):**
```typescript
validateInput('campo', {
  value: valor,
  type: 'string',
  required: true,
  minLength: 3,
  maxLength: 1000,
  allowedValues: ['opcao1', 'opcao2']
});
```

**Proteções:**
- ✅ Tipo de dados
- ✅ Comprimento mínimo/máximo
- ✅ Valores permitidos (whitelist)
- ✅ Campos obrigatórios
- ✅ Patterns regex quando necessário

### 4. Sanitização de Dados

**Anti-XSS:**
```typescript
const sanitizedText = sanitizeText(userInput, maxLength);
```

**Proteções:**
- Remove tags `<script>`
- Remove `javascript:` URLs
- Remove event handlers (`onclick`, etc.)
- Limita tamanho do texto

### 5. Audit Logs

Todos os eventos de segurança são registrados:

```sql
CREATE TABLE security_audit_log (
  user_id UUID,
  event_type TEXT,
  endpoint TEXT,
  success BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMP
);
```

**Eventos rastreados:**
- Tentativas de acesso
- Erros de validação
- Rate limit excedido
- Sucessos/falhas de operações

### 6. Tratamento de Erros

**Códigos HTTP padronizados:**
- `400` - Validation Error (dados inválidos)
- `401` - Unauthorized (não autenticado)
- `429` - Rate Limit Exceeded (limite excedido)
- `500` - Internal Server Error

**Respostas estruturadas:**
```json
{
  "error": "Mensagem de erro clara",
  "type": "validation_error|rate_limit_error",
  "retry_after": 60
}
```

## 🛡️ Melhores Práticas

### Para Desenvolvedores

1. **Sempre use o hook `useSecureApi`:**
```typescript
const { invokeFunction, isLoading } = useSecureApi();
const result = await invokeFunction('endpoint', { data });
```

2. **Nunca pule validação:**
- Valide TODOS os inputs do usuário
- Use tipos TypeScript corretos
- Defina limites razoáveis

3. **Trate erros de forma amigável:**
```typescript
if (!result) {
  // Hook já mostrou erro ao usuário
  return;
}
```

### Para Usuários

1. **Monitore seu uso:**
   - Componente `<RateLimitIndicator />` mostra uso em tempo real
   - Planeje operações em lote para otimizar limites

2. **Proteja suas credenciais:**
   - Nunca compartilhe senhas
   - Use senhas fortes
   - Faça logout em computadores compartilhados

3. **Reporte problemas:**
   - Comportamento suspeito
   - Erros inesperados
   - Possíveis vulnerabilidades

## 📊 Monitoramento

### Métricas de Segurança

Acesse o dashboard de segurança para ver:
- Tentativas de acesso bloqueadas
- Rate limits atingidos
- Erros de validação frequentes
- Padrões de uso anormais

### Logs

Todos os eventos são registrados com:
- Timestamp preciso
- User ID (quando disponível)
- Tipo de evento
- Sucesso/falha
- Mensagem de erro (se houver)

## 🚨 Resposta a Incidentes

Se você suspeitar de uma vulnerabilidade:

1. **NÃO divulgue publicamente**
2. Entre em contato via DM com detalhes
3. Inclua:
   - Descrição do problema
   - Passos para reproduzir
   - Impacto potencial

## 🔄 Atualizações de Segurança

Este documento é atualizado regularmente. Última atualização: **2025-10-08**

---

## Checklist de Segurança para Deploy

- [x] RLS ativado em todas as tabelas
- [x] Políticas RLS testadas
- [x] Rate limiting configurado
- [x] Validação de inputs implementada
- [x] Sanitização anti-XSS ativa
- [x] Audit logs funcionando
- [x] Tratamento de erros padronizado
- [x] Secrets protegidos
- [x] CORS configurado corretamente
- [x] Auth configurado (auto-confirm habilitado)

## Contato

Para questões de segurança: [Criar issue confidencial no repositório]
