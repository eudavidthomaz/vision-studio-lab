

# Diagnóstico Técnico Completo — Edge Functions

## Dados coletados via banco e logs

### 1. `generate-post-image` — FALHA CONFIRMADA (6 erros em 48h, 2 usuários)

**Evidência no banco (`security_audit_log`)**:
- `fb8cd204` (contato@makingof360.com.br): 2 erros em 15/mar — `"copy must be at most 2000 characters"`
- `09cc9748` (outro usuário): 4 erros em 13/mar — mesmo erro

**Causa raiz**: A validação na linha 68-74 do `generate-post-image/index.ts` rejeita `copy` > 2000 chars ANTES do truncamento na linha 130 (`sanitizedCopy.substring(0, 200)`). O `editedCopy` vindo do frontend (`ImageGenerationModal.tsx` linha 149) contém o texto completo do slide/carrossel que facilmente excede 2000 chars.

**CORS**: Headers incompletos na linha 14-17 (faltam `x-supabase-client-*`). Porém, os logs do audit mostram que a chamada CHEGA ao backend (o erro é logado), então o CORS **não está bloqueando** para esses usuários. O SDK atual pode não enviar esses headers extras. Ainda assim, é uma correção preventiva válida.

### 2. `extract-youtube-content` — FUNCIONA

**Evidência no banco**:
- 2 registros de `resumo_pregacao` criados para `fb8cd204` nas últimas 24h (01:42 e 01:38)
- Sermons correspondentes com `status: completed`
- CORS headers já estão corretos nessa function (inclui `x-supabase-client-*`)
- Sem erros no `security_audit_log` para esse endpoint

**Conclusão**: A extração do YouTube **funcionou** para este usuário. Se houve erro anterior, foi resolvido ou intermitente.

### 3. `transcribe-sermon` — FUNCIONA

**Evidência no banco**:
- 3 transcrições bem-sucedidas para `fb8cd204` nas últimas 24h
- Última: `1468cea6` em 01:57, 2250ms, 0.35MB — `transcription_completed`
- Edge function logs confirmam sucesso completo (download → Groq → save → cleanup)
- Sem erros registrados

### 4. `generate-image-overlay` — SEM DADOS DE ERRO

Nenhum registro de erro ou sucesso no `security_audit_log` para este endpoint (a function não usa `logSecurityEvent`). Sem logs recentes disponíveis. CORS incompleto, mesma situação do `generate-post-image`.

---

## Resumo do diagnóstico

| Function | Status | Problema Real |
|---|---|---|
| `generate-post-image` | **FALHA** | Validação `maxLength: 2000` rejeita textos longos antes do truncamento |
| `extract-youtube-content` | OK | Funcionando normalmente |
| `transcribe-sermon` | OK | Funcionando normalmente |
| `generate-image-overlay` | Inconclusivo | Sem dados de erro, mas CORS preventivo recomendado |

## Plano de correção revisado

Apenas **1 correção crítica confirmada** + 2 preventivas:

### Correção 1 (CRÍTICA): `generate-post-image/index.ts`
- Remover `maxLength: 2000` da validação do campo `copy` (linhas 68-74)
- O texto já é sanitizado e truncado a 500 chars (linha 96) e depois a 200 chars (linha 130)
- A validação é redundante e destrutiva

### Correção 2 (PREVENTIVA): CORS em `generate-post-image/index.ts`
- Adicionar headers `x-supabase-client-*` ao `corsHeaders` (linha 14-17)

### Correção 3 (PREVENTIVA): CORS em `generate-image-overlay/index.ts`
- Mesma adição de headers

**Não alterar**: `extract-youtube-content` (já correto), `transcribe-sermon` (funcionando).

