

# Rebranding: Seções Abaixo do Vídeo (Landing Page)

## What Changes

Replace the current post-video sections in `Landing.tsx` with a premium, visually cohesive design inspired by the reference `ImageCarouselHero` component. The reference uses rotating image cards, glass-style feature cards, and a bold CTA — we'll adapt this to the church content context.

### Sections to Redesign

1. **"Como Funciona" → Animated Steps Section**
   - Replace plain `Card` components with `GlassCard` components (already in project)
   - Add numbered step indicators with gradient backgrounds
   - Staggered fade-in animations on scroll using `react-intersection-observer` (already installed)

2. **"Tudo que você precisa" (Recursos + Entregáveis) → Features Grid**
   - Replace `Tabs` approach with a single visual grid inspired by the reference's `features` section
   - Each feature gets a `GlassCard` with icon, title, description
   - Subtle hover tilt effect (already built into `GlassCard`)

3. **Testimonials → Premium Glass Cards**
   - Swap `Card` for `GlassCard` with `glowColor` variants (primary, blue, cyan)
   - Better avatar styling

4. **CTA Final → Full-width Gradient Section**
   - Use `GlassCard` with sparkle effects
   - Larger, bolder typography matching the `font-gunterz` brand style

5. **FAQ → Cleaner Accordion**
   - Keep existing `Accordion` but wrap in `GlassCard` for visual consistency

6. **Footer → Minimal Rebrand**
   - Add logo, keep minimal

### Technical Approach

- **Single file change**: `src/pages/Landing.tsx`
- **No new components needed** — uses existing `GlassCard`, `SparklesCore`, `useInView` from `react-intersection-observer`
- **Scroll-triggered animations** via `useInView` + Framer Motion `motion.div` with `whileInView`
- All sections wrapped in `motion.section` with `initial={{ opacity: 0, y: 40 }}` and `whileInView={{ opacity: 1, y: 0 }}`

### Visual Style
- Dark glass aesthetic consistent with the hero
- `font-gunterz` for headings (uppercase, bold)
- Gradient accents with `hsl(var(--primary))` 
- Sparkle/glow effects on key cards
- Smooth scroll reveal animations

