

# Add AnimatedGridPattern to Bio Hero Section

## What
Create the `AnimatedGridPattern` component and layer it behind the hero section (first fold) of the `/bio` page. The grid provides an animated, professional background with randomly illuminating squares.

## Changes

### 1. Create `src/components/ui/animated-grid-pattern.tsx`
- The exact component provided by the user, using `framer-motion` + SVG pattern grid
- Already uses the project's `cn` utility — no new dependencies needed

### 2. Edit `src/pages/Bio.tsx`
- Import `AnimatedGridPattern`
- Wrap the `ContainerScrollHero` in a `relative` container
- Place `AnimatedGridPattern` as an absolute layer behind the hero content with a gradient mask (`[mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]`) and low opacity for subtlety
- Use `fill-primary/20 stroke-primary/20` to match the site's accent color

```text
┌──────────────────────────────┐
│  <div className="relative">  │
│    <AnimatedGridPattern />   │  ← absolute, behind hero
│    <ContainerScrollHero />   │  ← existing hero
│  </div>                      │
└──────────────────────────────┘
```

No other files affected.

