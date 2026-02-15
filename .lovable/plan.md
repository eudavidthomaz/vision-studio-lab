

# Extrair Legenda/Transcrição de Vídeo do YouTube via IA

## Resumo

Criar uma nova funcionalidade que permite ao usuario colar um link do YouTube, extrair o conteudo do video usando Gemini (via Lovable AI Gateway), e transformar em conteudo para a biblioteca. A funcionalidade compartilha os mesmos limites de quota da "captacao ao vivo" (`live_captures`) e esta disponivel apenas para usuarios Pro e Team.

## Arquitetura

```text
[Dashboard] --> YouTubeCard (visivel para todos, badge PRO para free)
    |
    v
[Click] --> Free? --> UpgradeModal
    |
    v
[Pro/Team] --> YouTubeTranscriptModal (input de URL)
    |
    v
[Submit] --> Edge Function: extract-youtube-content
    |
    v
[Gemini 3 Flash] --> Extrai conteudo do video via URL
    |
    v
[Salva na content_library] --> Redireciona para visualizacao
```

## O que sera criado

### 1. Edge Function: `extract-youtube-content`

- Recebe a URL do YouTube e o prompt do usuario
- Valida autenticacao e quota (`live_captures`)
- Usa o Lovable AI Gateway com modelo `google/gemini-3-flash-preview` para analisar o conteudo do video a partir da URL
- O Gemini recebe a URL do YouTube e extrai o conteudo/transcricao do video
- Incrementa `live_captures_used` na tabela `usage_quotas`
- Salva o resultado na `content_library` com `source_type: 'youtube'`
- Retorna o `content_id` para o frontend

### 2. Componente: `YouTubeCreatorCard.tsx`

- Card visual no dashboard com icone do YouTube e estilo atrativo
- Badge "PRO" visivel para todos os usuarios
- Usuarios Free: ao clicar, abre o `UpgradeModal` com `feature: 'live_captures'`
- Usuarios Pro/Team: ao clicar, abre o modal de input

### 3. Componente: `YouTubeTranscriptModal.tsx`

- Modal com campo de input para a URL do YouTube
- Validacao de URL (aceita formatos youtube.com/watch?v= e youtu.be/)
- Campo opcional de instrucoes adicionais (ex: "foque nos pontos sobre graca")
- Estado de loading com feedback visual
- Ao concluir, redireciona para `/biblioteca/{content_id}`

### 4. Integracao no Dashboard

- Adicionar o `YouTubeCreatorCard` na pagina `Dashboard.tsx` entre o `AICreatorCard` e o `RecentContentSection`
- Conectar com o sistema de quota existente (`useQuota`)

### 5. Atualizacao do `UpgradeModal`

- Adicionar label para YouTube na lista de features do modal
- Atualizar `FEATURE_LABELS` para incluir referencia ao YouTube em `live_captures`

## Detalhes Tecnicos

### Edge Function (`supabase/functions/extract-youtube-content/index.ts`)
- Usa `LOVABLE_API_KEY` (ja configurado) para chamar o Lovable AI Gateway
- Modelo: `google/gemini-3-flash-preview`
- Prompt de sistema orienta o Gemini a extrair e estruturar o conteudo do video
- Valida quota de `live_captures` antes de processar
- Incrementa uso apos sucesso
- Salva com `content_type` detectado e `source_type: 'youtube'`

### Controle de Acesso
- Free: 0 captacoes (bloqueado)
- Pro: 5/mes (compartilhado com captacao ao vivo)
- Team: 20/mes (compartilhado com captacao ao vivo)

### config.toml
- Adicionar entrada `[functions.extract-youtube-content]` com `verify_jwt = true`

## Arquivos Modificados/Criados

| Arquivo | Acao |
|---|---|
| `supabase/functions/extract-youtube-content/index.ts` | Criar |
| `src/components/YouTubeCreatorCard.tsx` | Criar |
| `src/components/YouTubeTranscriptModal.tsx` | Criar |
| `src/pages/Dashboard.tsx` | Modificar (adicionar card) |
| `src/components/UpgradeModal.tsx` | Modificar (label YouTube) |

