

# Separar vídeo da Hero e da MediaSection

## Problema

Ambas as seções (`HeroSection` e `MediaSection`) leem de `media.youtubeEmbedUrl`. Existe apenas um campo no tipo `ChurchSiteMedia` e um input no editor. Resultado: mesmo vídeo nos dois lugares.

## Solução

Adicionar um segundo campo `mediaVideoUrl` ao schema para a seção "Assista e conheça mais", mantendo `youtubeEmbedUrl` para a Hero.

### 1. `src/types/churchSite.ts` — novo campo no tipo

```typescript
export interface ChurchSiteMedia {
  youtubeEmbedUrl?: string | null;   // Hero
  mediaVideoUrl?: string | null;     // Seção "Assista e conheça mais"
}
```

Atualizar `DEFAULT_MEDIA` com `mediaVideoUrl: null`.

### 2. Migração de banco — adicionar campo ao JSONB

Não é necessária migração SQL — o campo `media` é JSONB e aceita propriedades novas sem alteração de schema.

### 3. `src/pages/SiteEditor.tsx` — novo input

Adicionar um segundo campo de input na seção de mídia do editor:
- Label: "Vídeo da seção Mídia"
- Placeholder: `https://youtube.com/watch?v=...`
- Bind: `localConfig.media.mediaVideoUrl`

### 4. `src/components/church-site/sections/MediaSection.tsx` — usar novo campo

- Trocar `media.youtubeEmbedUrl` → `media.mediaVideoUrl` em todas as referências
- Condição de exibição: `if (!media.mediaVideoUrl && !socialLinks.youtube) return null;`
- Normalização: `normalizeYoutubeEmbedUrl(media.mediaVideoUrl)`

### 5. `src/components/church-site/sections/HeroSection.tsx` — sem alteração

Continua usando `media.youtubeEmbedUrl`.

**Resultado**: dois campos independentes, dois inputs no editor, dois vídeos distintos nas seções.

