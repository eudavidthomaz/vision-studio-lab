

# Build Complete `/bio` Church Landing Page

## Overview

Rebuild `src/pages/Bio.tsx` as a full 11-section church landing page. Mobile-first, premium dark glass aesthetic, reusing existing components (`GlassCard`, `Button`, `Badge`, `ContainerScrollHero`, `SparklesCore`, framer-motion animations). All text content stored in a config object at the top of the file for easy future editing.

## Architecture

Single file `src/pages/Bio.tsx` — no new components needed. All sections use the same animation pattern from Landing.tsx (`sectionVariants` with `whileInView`).

## Section Breakdown

| # | Section | Key Components Used |
|---|---------|-------------------|
| 1 | Hero (existing ContainerScrollHero + YouTube) | `ContainerScrollHero`, `Button`, `Badge` |
| 2 | "Primeira vez aqui?" | `GlassCard` (4 FAQ cards), `Button` |
| 3 | Horários e Endereço | `Card`, icons from `lucide-react` |
| 4 | Quem Somos | 3x `GlassCard` with glow colors |
| 5 | Ministérios | 5x glass cards in responsive grid |
| 6 | Transmissão / Mensagens | `Button` links, YouTube embed |
| 7 | Próximos Encontros | Event cards with date badges |
| 8 | Pedido de Oração | `GlassCard` with WhatsApp CTA |
| 9 | Contato | 4 icon buttons in grid |
| 10 | Dízimos e Ofertas | Simple CTA section |
| 11 | Footer | Minimal dark footer |

## Technical Details

- **Config object**: `CHURCH_CONFIG` at top with all texts, links, schedule, address — single source of truth
- **Animation**: `motion.section` with `whileInView` viewport trigger, staggered children via `itemVariants`
- **Buttons**: Use existing `Button` component with `variant="solid"` for primary CTAs, `variant="outline"` for secondary
- **Cards**: `GlassCard` for highlight cards (FAQ, ministries, values), standard `Card` for info blocks
- **Icons**: `lucide-react` — MapPin, Clock, Phone, Heart, Users, Music, BookOpen, Church, ExternalLink, Instagram, Youtube, Mail, MessageCircle
- **Mobile-first**: All grids use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, buttons are `w-full sm:w-auto`, generous touch targets (`min-h-[48px]`)
- **SparklesCore**: Used in hero section and prayer section for emotional accent
- **Scroll-to-section**: Hero CTAs use `document.getElementById().scrollIntoView()` for "Quero visitar" → scrolls to "primeira-vez" section
- **WhatsApp links**: `https://wa.me/5511999999999` pattern (placeholder number in config)
- **Maps link**: `https://maps.google.com/?q=...` pattern
- **YouTube**: Embed for transmissão section, channel link button

## Files

| File | Action |
|------|--------|
| `src/pages/Bio.tsx` | Rewrite completely |

No routing changes needed — `/bio` route already exists.

