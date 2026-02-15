

# Corrigir Extração de Legendas do YouTube (Innertube API Bloqueando)

## Problema
A chamada para a Innertube API (`/youtubei/v1/player`) esta retornando sem caption tracks porque falta o header `User-Agent` obrigatorio. O YouTube bloqueia requisicoes de servidores que nao se identificam como navegadores.

Dois videos foram testados (`M2O3tlgRUQ0` e `cKtlmd2LVZk`) e ambos retornaram "Este video nao possui legendas disponiveis", mesmo tendo legendas automaticas.

## Solucao

Usar uma abordagem em duas camadas (fallback):

### Camada 1: Scraping da pagina do YouTube (mais confiavel)
Buscar o HTML da pagina `youtube.com/watch?v=VIDEO_ID` com headers de navegador e extrair o objeto `ytInitialPlayerResponse` que contem os caption tracks. Este metodo e mais confiavel porque e exatamente como o navegador obtem os dados.

### Camada 2: Innertube API com headers corretos (fallback)
Se o scraping falhar, tentar a Innertube API com `User-Agent` de navegador adicionado.

## Detalhes Tecnicos

### Arquivo: `supabase/functions/extract-youtube-content/index.ts`

Reescrever a funcao `fetchYouTubeTranscript` com o seguinte fluxo:

```text
1. Fetch HTML de youtube.com/watch?v=ID (com User-Agent de navegador)
2. Extrair ytInitialPlayerResponse do HTML via regex
3. Obter captionTracks do JSON extraido
4. Se falhar -> Tentar Innertube API com User-Agent correto
5. Selecionar melhor track (pt > en > qualquer)
6. Baixar XML de legendas
7. Converter para texto puro
```

Mudancas especificas:
- Adicionar `User-Agent` header em todas as requisicoes ao YouTube
- Novo metodo `fetchFromWatchPage(videoId)` que faz scraping do HTML
- Manter `fetchFromInnertubeApi(videoId)` como fallback com headers corrigidos
- Adicionar logging detalhado para diagnostico

### Headers necessarios
```typescript
const browserHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
};
```

### Extracao do HTML
```typescript
// Buscar pagina do video
const html = await fetch(`https://www.youtube.com/watch?v=${videoId}`, { headers: browserHeaders });

// Extrair ytInitialPlayerResponse
const match = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/s);
const playerData = JSON.parse(match[1]);
const captionTracks = playerData.captions.playerCaptionsTracklistRenderer.captionTracks;
```

## Arquivos Modificados

| Arquivo | Acao |
|---|---|
| `supabase/functions/extract-youtube-content/index.ts` | Reescrever fetchYouTubeTranscript com scraping + headers corretos |

## Resultado Esperado
- Videos com legendas automaticas serao extraidos corretamente
- Lives gravadas com legendas tambem funcionarao
- Logging detalhado permitira diagnosticar falhas futuras

