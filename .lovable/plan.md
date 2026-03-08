

# Create `/bio` — Public Church Landing Page

## Overview

New standalone page at `/bio` — a premium public landing page for "Igreja Presbiteriana Bethaville". The first fold uses the `ContainerScroll` pattern (already exists as `ContainerScrollHero`) with a YouTube video embed inside the 3D rotating card.

## Files

| File | Action |
|------|--------|
| `src/pages/Bio.tsx` | Create |
| `src/App.tsx` | Add route `/bio` |

## `src/pages/Bio.tsx`

### First Fold — ContainerScroll Hero
- Reuse the existing `ContainerScrollHero` component
- **Title component** (passed as `titleComponent` prop):
  - Small text: `"Bem-vindo"` — `text-sm text-muted-foreground tracking-widest uppercase`
  - Large heading: `"Igreja Presbiteriana Bethaville"` — `text-4xl md:text-6xl font-bold` with gradient text
  - Badge pill below: `"🔴 última transmissão"` — small rounded badge with `bg-white/10 border-white/10 backdrop-blur`
- **Children** (inside the 3D card):
  - YouTube `<iframe>` embed: `https://www.youtube-nocookie.com/embed/ed8EzWU056M` — `w-full h-full rounded-2xl`
  - No modal needed — the video plays directly inside the rotating card

### Page Structure
- Full-screen dark page with `min-h-screen bg-background`
- The `GeometricBackground` is already global in `App.tsx`, so it inherits the ambient styling
- Single-section MVP focused on the hero fold

## `src/App.tsx`
- Import `Bio` page
- Add `<Route path="/bio" element={<Bio />} />`

