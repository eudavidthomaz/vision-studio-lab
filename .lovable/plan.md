

# Aplicar normalização de YouTube na MediaSection

Mesmo fix cirúrgico já aplicado na HeroSection — usar `normalizeYoutubeEmbedUrl` no iframe da MediaSection e adicionar fallback discreto para URL inválida.

## Alteração: `src/components/church-site/sections/MediaSection.tsx`

1. **Import**: adicionar `normalizeYoutubeEmbedUrl` de `@/lib/utils` e `AlertCircle` de `lucide-react`
2. **Normalizar antes do render** (dentro do componente, antes do return):
   ```typescript
   const embedUrl = media.youtubeEmbedUrl
     ? normalizeYoutubeEmbedUrl(media.youtubeEmbedUrl)
     : null;
   ```
3. **Substituir bloco do iframe** (linhas 48-63): usar `embedUrl` no `src` do iframe quando válido; mostrar fallback discreto com `AlertCircle` + "URL do vídeo inválida" quando `media.youtubeEmbedUrl` existe mas `embedUrl` é null
4. Layout e botões permanecem inalterados

**1 arquivo alterado. Sem mudanças em outros componentes.**

