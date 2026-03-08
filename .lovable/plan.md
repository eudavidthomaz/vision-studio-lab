

# Redesign `/bio` — Tabbed Layout + Component Variety

## Strategy

Keep **Hero + Footer** as standalone sections. Everything in between goes into a **horizontal sticky tab bar** with 4 tabs, drastically reducing scroll length while keeping all content accessible.

Each tab uses **different visual components** to avoid repetition:

## Architecture

```text
┌─────────────────────────────────┐
│  HERO (ContainerScrollHero)     │  ← stays as-is
├─────────────────────────────────┤
│  STICKY TAB BAR                 │  ← Tabs component, sticky top
├─────────────────────────────────┤
│  TAB CONTENT (swaps on click)   │
├─────────────────────────────────┤
│  FOOTER                         │  ← stays as-is
└─────────────────────────────────┘
```

## Tab Breakdown + Component Variety

| Tab | Label | Sections | Visual Components |
|-----|-------|----------|-------------------|
| 1 | **Início** | First visit FAQ + Schedule/Address | **Accordion** for FAQ (not cards), **GlassCard** split for schedule+map |
| 2 | **Sobre** | Who we are + Ministries | **RadialOrbitalTimeline** for 3 values, **CardStack** fan for ministries |
| 3 | **Mídia** | Transmission + Upcoming events | YouTube embed + event cards with **date badges** |
| 4 | **Contato** | Prayer + Contact + Tithes/Offerings | **GlassCard with SparklesCore** (prayer), icon grid (contact), simple CTA (tithes) |

## Key Design Decisions

### Sticky Tab Bar
- Uses `Tabs` + `TabsList` + `TabsTrigger` from `@radix-ui/react-tabs`
- Sticky below hero with `sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/20`
- Tab labels: 🏠 Início · ✝️ Sobre · 📺 Mídia · 💬 Contato
- Mobile: full-width, scrollable horizontally

### Tab 1 — Início (varied layout)
- **Accordion** (expandable FAQ) replaces the 4 identical GlassCards — more compact, more interactive
- Schedule + Address: **two-column GlassCard** layout with different `glowColor` per card (primary + cyan)
- CTA buttons remain prominent

### Tab 2 — Sobre (most creative)
- **RadialOrbitalTimeline** for the 3 values (Nossa mensagem / Nossa cultura / Nosso desejo) — orbital animated nodes with content reveal on click
- **CardStack** fan component for ministries — users swipe through ministry cards instead of static grid
- Both components are already imported and unused on this page

### Tab 3 — Mídia
- YouTube embed in a `Card` (simple, clean)
- Event agenda as horizontal scrollable cards (`flex overflow-x-auto snap-x`) instead of grid — more dynamic on mobile

### Tab 4 — Contato
- Prayer section with **GlassCard + SparklesCore** (emotional, already proven pattern)
- Contact icons as large touch-friendly `Button` grid
- Tithes as minimal text + single CTA

## Animation
- Each `TabsContent` wraps content in `motion.div` with `fade-in` on mount via `AnimatePresence`
- `whileInView` animations inside each tab for staggered reveals

## File Changes

| File | Action |
|------|--------|
| `src/pages/Bio.tsx` | Full rewrite |

No new files, no routing changes.

