

# Corrigir vídeo YouTube na Hero — com ordem correta de checagem

## Arquivos alterados: 2

### 1. `src/lib/utils.ts` — adicionar função utilitária

Adicionar ao final do arquivo:

```typescript
export function normalizeYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    let videoId: string | null = null;

    if (u.hostname.includes('youtu.be')) {
      videoId = u.pathname.slice(1).split(/[/?]/)[0];
    } else if (u.hostname.includes('youtube-nocookie')) {
      return url; // já é embed nocookie
    } else if (u.hostname.includes('youtube')) {
      if (u.pathname.startsWith('/embed/')) return url;
      if (u.pathname.startsWith('/shorts/')) videoId = u.pathname.split('/')[2];
      else if (u.pathname.startsWith('/live/')) videoId = u.pathname.split('/')[2];
      else videoId = u.searchParams.get('v');
    }

    if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`;
  } catch { /* URL inválida */ }
  return null;
}
```

Ordem de checagem: `youtu.be` → `youtube-nocookie` → `youtube` (genérico) — conforme solicitado.

### 2. `src/components/church-site/sections/HeroSection.tsx`

**Import**: adicionar `normalizeYoutubeEmbedUrl` de `@/lib/utils` e `AlertCircle` de `lucide-react`.

**Bloco `mediaContent`** (~linha 119-140): antes de montar o conteúdo, computar:

```typescript
const embedUrl = config.media.youtubeEmbedUrl
  ? normalizeYoutubeEmbedUrl(config.media.youtubeEmbedUrl)
  : null;
```

Substituir o bloco ternário `mediaContent` por:
- Se `config.media.youtubeEmbedUrl` existe **e** `embedUrl` não é null → iframe com `src={embedUrl}`
- Se `config.media.youtubeEmbedUrl` existe **mas** `embedUrl` é null → fallback discreto com `AlertCircle` + "URL do vídeo inválida"
- Senão → lógica existente (imagem de capa ou placeholder)

Layout da Hero permanece inalterado. Sem mudanças no editor, no onChange, nem em outras seções.

