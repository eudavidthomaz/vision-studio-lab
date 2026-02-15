

# Corrigir Extração de Conteúdo do YouTube

## Problema Identificado

A função `extract-youtube-content` tem uma falha fundamental: **o modelo Gemini não consegue acessar URLs do YouTube**. Ele recebe apenas o texto da URL e **inventa/alucina** o conteúdo, gerando transcrições falsas com pregadores errados. Isso explica porque apareceu conteúdo de outra pessoa.

Além disso, o conteúdo extraído é salvo na tabela `content_library` em vez da tabela `sermons`, onde as transcrições de áudio já ficam armazenadas.

## Solução

Reescrever a função em duas etapas:

### Etapa 1: Extrair transcrição REAL do YouTube

Usar a **Innertube API do YouTube** (API interna do YouTube) diretamente no Edge Function para buscar as legendas/captions reais do vídeo. Isso funciona sem API key externa e suporta:
- Legendas automáticas (auto-generated)
- Legendas manuais
- Lives gravadas (que geralmente têm legendas automáticas)
- Múltiplos idiomas (prioridade: pt, en)

O fluxo sera:
1. Extrair o `videoId` da URL
2. Chamar a Innertube API (`/youtubei/v1/player`) para obter metadata e URLs de caption tracks
3. Baixar o XML de legendas da track encontrada
4. Converter XML em texto puro (transcrição)

### Etapa 2: Salvar na tabela `sermons` (mesmo lugar dos áudios)

Em vez de salvar em `content_library`, salvar na tabela `sermons` que já tem os campos:
- `transcript` (text) - para a transcrição completa
- `summary` (text) - para um resumo gerado pela IA
- `status` (text) - completed/failed
- `user_id`, `created_at`, etc.

### Etapa 3: Usar IA apenas para ESTRUTURAR (não transcrever)

Após ter a transcrição real, usar o Gemini apenas para:
- Gerar resumo estruturado
- Identificar pontos principais e versículos
- Criar o resumo para `content_library`

Isso garante que a transcrição é fiel ao vídeo e a IA só analisa dados reais.

## Detalhes Técnicos

### Arquivo: `supabase/functions/extract-youtube-content/index.ts`

Reescrever completamente com o seguinte fluxo:

```text
URL do YouTube
     |
     v
Extrair videoId
     |
     v
Innertube API (/youtubei/v1/player)
     |
     v
Obter caption track URL (pt > en > qualquer)
     |
     v
Baixar XML de legendas
     |
     v
Converter para texto puro
     |
     v
Salvar transcrição na tabela "sermons"
     |
     v
Enviar transcrição real ao Gemini para análise
     |
     v
Salvar resumo estruturado em "content_library"
     |
     v
Retornar sermon_id + content_id
```

Funções auxiliares:
- `extractVideoId(url)` - extrai ID de youtube.com/watch, youtu.be, youtube.com/live, youtube.com/shorts
- `fetchYouTubeTranscript(videoId)` - usa Innertube API para buscar legendas reais
- `parseTranscriptXml(xml)` - converte XML de legendas em texto

### Arquivo: `src/components/YouTubeTranscriptModal.tsx`

Ajustar o texto da UI para refletir que o conteúdo sera salvo junto com os sermões, e adicionar suporte para URLs de lives (`youtube.com/live/`).

### Arquivo: Frontend (hook/dashboard)

Atualizar o callback de sucesso para navegar ao sermão salvo na seção correta.

## Impacto

| Antes | Depois |
|---|---|
| IA inventa transcrição | Transcrição real das legendas do YouTube |
| Salva em content_library | Salva em sermons (mesmo lugar dos áudios) |
| Não suporta lives | Suporta lives gravadas com legendas |
| Pregador errado | Dados fiéis ao vídeo original |
| Sem reuso | Transcrição disponível para gerar conteúdos depois |

## Arquivos Modificados

| Arquivo | Ação |
|---|---|
| `supabase/functions/extract-youtube-content/index.ts` | Reescrever com Innertube API + salvar em sermons |
| `src/components/YouTubeTranscriptModal.tsx` | Ajustar UI e suporte a URLs de live |
| Frontend (dashboard/hooks) | Ajustar callback de sucesso |

## Limitações conhecidas

- Alguns vídeos podem não ter legendas disponíveis (nem manuais nem automáticas). Nesses casos, a função retornará erro claro informando que o vídeo não possui legendas.
- A qualidade das legendas automáticas varia conforme o áudio do vídeo.

