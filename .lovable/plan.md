

# Refactor: YouTube iframe autoplay inside scroll-expanding container

## What Changes

### `src/components/HeroScrollVideo.tsx`
- Remove `poster` and `onMediaClick` props
- Add YouTube iframe support: new prop `iframeSrc?: string` for embedding YouTube directly inside the expanding media box
- The iframe renders with `autoplay=1&mute=1&controls=0&modestbranding=1&showinfo=0&rel=0&loop=1` — autoplaying silently inside the expanding container
- Keep the full GSAP ScrollTrigger expansion logic (headline roll-away → sticky box expands from 360px to fullscreen → overlay reveals)
- The iframe fills the `.hsv-media` container with `position: absolute; inset: 0; width: 100%; height: 100%`

### `src/pages/Landing.tsx`
- Remove the `videoOpen` state and the `Dialog` modal entirely — no more click-to-open pattern
- Pass `iframeSrc={YOUTUBE_NOCOOKIE_MUTED}` to `HeroScrollVideo` instead of `poster`
- Update `YOUTUBE_NOCOOKIE` to use `mute=1` (required for autoplay) instead of `mute=0`
- Remove `onMediaClick` prop usage
- Keep overlay content (caption, heading, paragraphs) but remove the play button from `extra`

### Flow
```text
Page loads → Headline visible (100vh)
  ↓ scroll
Headline rolls away → YouTube iframe box (360px, muted autoplay) expands to 92vw/92vh
  ↓ continue scroll
Overlay reveals with text content over the video
  ↓ scroll past
Rest of page (Como Funciona, etc.)
```

No new dependencies. No modal. No thumbnail click. Direct autoplay embed.

