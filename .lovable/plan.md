

# Scroll-Animated Hero Expansion — GSAP + ScrollTrigger

## What's Missing
The current hero is static. The reference uses a **GSAP ScrollTrigger** animation where a small centered poster/thumbnail **expands to fullscreen on scroll**, with a headline that rolls away and an overlay that reveals content. This is the signature Apple/Stripe effect.

## Architecture

```text
┌──────────────────────────────────┐
│  FOLD 1: Headline (100vh)        │
│  font-gunterz title              │
│  subtitle + badge + CTA          │
│  ↓ rolls away on scroll ↓       │
├──────────────────────────────────┤
│  FOLD 2: Sticky Scroll (280vh)   │
│  ┌─────────┐                     │
│  │ poster  │ ← starts 360px box  │
│  └─────────┘                     │
│       ↓ scroll ↓                 │
│  ┌──────────────────────────┐    │
│  │     expands to 92vw      │    │
│  │  overlay reveals text    │    │
│  │  + play button → modal   │    │
│  └──────────────────────────┘    │
├──────────────────────────────────┤
│  REST OF PAGE (como funciona...) │
└──────────────────────────────────┘
```

## New Dependencies
- `gsap` — animation engine + ScrollTrigger plugin
- `lenis` — smooth scroll (optional, enhances feel)

## Changes

### 1. New Component: `src/components/HeroScrollVideo.tsx`
Adapted from the reference but simplified for this project:
- Uses GSAP ScrollTrigger for scroll-driven expansion
- Headline area with `font-gunterz` title, subtitle, badge, CTA — all roll away on scroll
- Poster starts as a centered ~360px box, expands to ~92vw/92vh on scroll
- Overlay with darkening + text reveal (caption, heading, paragraphs)
- Click on the expanded poster opens the YouTube modal
- Lenis smooth scroll integration
- Scoped CSS via `<style>` tag (matching reference pattern)
- Uses project's theme tokens where possible

### 2. `src/pages/Landing.tsx`
- Replace the static hero section (lines 104-188) with `<HeroScrollVideo>` component
- Pass Ide.On content as props: title, subtitle, meta, overlay text, poster image
- Keep the video modal Dialog below (YouTube nocookie)
- The `onClick` on the media container triggers `setVideoOpen(true)`
- Rest of the page (Como Funciona, Recursos, Testimonials, FAQ, Footer) stays unchanged

### Key Adaptations from Reference
- `mediaType="image"` with YouTube thumbnail as poster (no actual video in the scroll section — video plays in modal only)
- Overlay content: Ide.On value props (e.g., "Do Altar ao Feed", key benefits)
- Play button overlay on the expanded poster to invite click → modal
- Colors adapted to use CSS custom properties from the project's theme

