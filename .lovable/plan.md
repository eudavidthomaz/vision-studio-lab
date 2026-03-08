

# New Approach: Wheel-Driven Scroll Expand Hero

## What Changes

Replace the GSAP ScrollTrigger hero with a **state-driven scroll expansion** using wheel/touch events. No GSAP, no Lenis — just React state (`scrollProgress` 0→1) controlling the media box size via inline styles. The page scroll is locked until the media fully expands, then normal scrolling resumes.

## Architecture

```text
┌─────────────────────────────────────┐
│  LOCKED VIEWPORT (100dvh)           │
│                                     │
│  Background image fades out         │
│                                     │
│  ┌─────────┐  ← 300px start        │
│  │ YouTube  │  wheel/touch grows    │
│  │ iframe   │  to ~95vw / 85vh      │
│  └─────────┘                        │
│                                     │
│  "A câmera"  ←── slides left        │
│  "desliga."  ←── slides right       │
│                                     │
│  "scroll to expand" hint            │
│  "Beta Aberto" badge                │
├─────────────────────────────────────┤
│  Once progress=1, scroll unlocks    │
│  → Como Funciona, Recursos, etc.    │
└─────────────────────────────────────┘
```

## Changes

### 1. Rewrite `src/components/HeroScrollVideo.tsx`
- Drop GSAP/Lenis entirely — pure React + framer-motion (already installed)
- State: `scrollProgress` (0-1), `mediaFullyExpanded`, `showContent`, `isMobile`
- Wheel handler: `deltaY * 0.0009` increments progress, `preventDefault` until expanded
- Touch handler: same logic with `touchStartY` delta tracking
- Media box: `width = 300 + progress * (mobile ? 650 : 1250)`, `height = 400 + progress * (mobile ? 200 : 400)`
- Title splits into two `<h2>` lines that slide apart horizontally (`translateX`)
- YouTube iframe with autoplay params inside the expanding box
- Dark overlay on iframe fades as progress increases
- Background image slot (optional `bgImageSrc` prop) fades out with progress
- After `progress >= 1`: sets `mediaFullyExpanded`, unlocks native scroll, fades in children
- Keep Gunterz font on title

### 2. Update `src/pages/Landing.tsx`
- Pass the rest of the page (Como Funciona → Footer) as `children` of the new component
- Props: `mediaSrc={YOUTUBE_EMBED}`, `title="A câmera desliga. A missão continua."`, `bgImageSrc` (YouTube thumb or dark gradient)
- Remove old overlay props (caption, heading, paragraphs) — not used in this pattern
- The `children` content appears with fade after full expansion

### 3. Remove `gsap` dependency
- No longer needed. `lenis` also unused. Can be removed from package.json.

## Key Adaptations from Reference
- `next/image` → standard `<img>` tag
- YouTube iframe handling preserved from reference (autoplay, mute, loop, no controls)
- Framer-motion `motion.div` for opacity transitions (already in deps)
- Mobile detection via `window.innerWidth < 768`

