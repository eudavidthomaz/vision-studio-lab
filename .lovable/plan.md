

# Confirmação de Escala via Link Publico (Sem Integracao Externa)

## Arquitetura

O sistema ja possui a infraestrutura de tokens e pagina publica. A solucao e completar o fluxo sem depender de e-mail ou qualquer servico externo:

```text
Lider gera escala
  -> Tokens criados automaticamente (1 por voluntario)
  -> UI exibe links de confirmacao
  -> Lider compartilha via WhatsApp / copia link
  -> Voluntario abre link publico (sem login)
  -> Confirma / Recusa / Pede substituto
  -> Status atualizado em tempo real na tela do lider
```

## O que ja existe (nao precisa mudar)

- Tabela `schedule_confirmation_tokens` com token hex, expiracao 7 dias
- Pagina `/confirmar/:token` (publica, sem autenticacao)
- Edge Function `confirm-schedule` que valida token, atualiza status, notifica lider

## O que precisa ser implementado

### 1. Auto-criar tokens ao gerar escalas

Nas Edge Functions `generate-volunteer-schedule` e `generate-smart-schedule`, apos inserir os registros em `volunteer_schedules`, inserir um token para cada escala criada na tabela `schedule_confirmation_tokens`.

### 2. Exibir links de confirmacao na UI de escalas

Na pagina `/escalas`, ao lado de cada voluntario com status "Aguardando", exibir botoes:

- **Copiar Link**: copia a URL `{origin}/confirmar/{token}` para a area de transferencia
- **Compartilhar via WhatsApp**: abre `https://wa.me/?text=...` com mensagem pre-formatada contendo nome do voluntario, data, funcao e link

Isso requer buscar os tokens da tabela `schedule_confirmation_tokens` junto com as escalas.

### 3. Painel de confirmacoes pendentes (melhoria na pagina de escalas)

Um card/secao mostrando resumo:
- X confirmados / Y aguardando / Z recusados
- Lista de pendentes com botao rapido de compartilhar link
- Indicador visual de quantos dias cada token esta pendente

## Detalhes Tecnicos

### Edge Functions (generate-volunteer-schedule e generate-smart-schedule)

Apos o `insert` em `volunteer_schedules`, iterar sobre os registros criados e inserir em `schedule_confirmation_tokens`:

```text
Para cada schedule inserido:
  INSERT INTO schedule_confirmation_tokens (schedule_id)
  VALUES (schedule.id)
  -- token e expires_at sao gerados automaticamente pelo DEFAULT da tabela
```

### Frontend - Componente de link de confirmacao

Novo componente `ScheduleShareLink` que recebe o token e renderiza:
- Botao "Copiar Link" usando `navigator.clipboard.writeText()`
- Botao "WhatsApp" que abre `https://wa.me/?text=` com mensagem formatada
- Toast de confirmacao ao copiar

### Frontend - Query de escalas com tokens

Atualizar a query em `useVolunteerSchedules` para incluir os tokens:

```text
volunteer_schedules (
  ...,
  schedule_confirmation_tokens (
    token,
    used_at,
    action_taken,
    expires_at
  )
)
```

### Frontend - Pagina de escalas

Na listagem de escalas, para cada voluntario com status `scheduled`:
- Exibir os botoes de compartilhar link ao lado do badge "Aguardando"
- Para voluntarios com status `confirmed`, exibir badge verde sem botoes

## Arquivos a Modificar

| Arquivo | Mudanca |
|---|---|
| `supabase/functions/generate-volunteer-schedule/index.ts` | Inserir tokens apos criar escalas |
| `supabase/functions/generate-smart-schedule/index.ts` | Inserir tokens apos criar escalas |
| `src/hooks/useVolunteerSchedules.tsx` | Incluir tokens na query de escalas |
| `src/components/schedules/ScheduleShareLink.tsx` | **Novo** - botoes copiar link e WhatsApp |
| `src/pages/Schedules.tsx` | Integrar ScheduleShareLink nos cards de escala |

## Vantagens desta abordagem

- Zero dependencia externa (sem Resend, sem SMTP, sem API de email)
- Voluntario nao precisa criar conta
- Lider tem controle total de como compartilha (WhatsApp, SMS, presencial)
- Tokens temporarios (7 dias) com uso unico garantem seguranca
- Pagina publica ja existe e funciona

