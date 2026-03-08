

# Fix: Restore Rebranded Sections in Landing Page

## Problem
The build error fix overwrote `Landing.tsx` with the old section designs. Only the hero (`ContainerScrollHero`) kept the new brand. All sections below — Como Funciona, Recursos, Testimonials, CTA, FAQ, Footer — are still using plain `Card` components with the old styling.

## What Changes

Rewrite all sections below the hero in `src/pages/Landing.tsx` to match the approved rebranding:

1. **Imports**: Add `GlassCard`, `motion` from framer-motion, remove `Card`/`Tabs` imports
2. **All headings**: Switch to `font-gunterz uppercase` styling
3. **Como Funciona (Steps)**: Replace `Card` with `GlassCard` (glowColor cycling: primary → blue → cyan). Add staggered `whileInView` fade-in animations.
4. **Recursos + Entregáveis**: Remove `Tabs` pattern. Single grid of `GlassCard` items for features. Deliverables listed below in a separate `GlassCard`.
5. **Testimonials**: `GlassCard` with alternating `glowColor` (primary, blue, cyan).
6. **CTA Final**: Full `GlassCard` with sparkle effect, `font-gunterz` heading.
7. **FAQ**: Wrap `Accordion` inside a `GlassCard`.
8. **Footer**: Add logo, keep minimal, use `font-gunterz` for brand name.

### Animation Pattern
```tsx
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0,0,0.2,1] } },
};
// Applied via: <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
```

### Scope
- **Single file**: `src/pages/Landing.tsx`
- **No new components** — uses existing `GlassCard`, `SparklesCore`

