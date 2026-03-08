

# Upgrade Mobile View for RadialOrbitalTimeline

## Problem
The current mobile fallback (lines 189–212) is a plain static list — no interactivity, no expand/collapse, no animations. It doesn't match the premium feel of the desktop orbital.

## Plan

Rewrite the mobile section (`md:hidden`) in `src/components/RadialOrbitalTimeline.tsx` with:

1. **Interactive accordion cards**: Tap a card to expand and reveal description with smooth `framer-motion` height animation (`AnimatePresence` + `layout`).
2. **Visual timeline spine**: A vertical line (`absolute left-5 border-l border-primary/30`) connecting all nodes, with glowing dots at each node position.
3. **Staggered entrance**: Cards fade-in with `whileInView` + stagger delay using `motion.div`.
4. **Active state glow**: Active card gets `border-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.2)]` — matching desktop glass styling.
5. **Consistent glass look**: Keep `backdrop-blur-md bg-white/5 border-white/10` base, upgrade active state.

### Scope
- **Single file**: `src/components/RadialOrbitalTimeline.tsx` (lines 189–212 replaced)
- No new files or dependencies

