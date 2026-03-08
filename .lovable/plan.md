

# Replace Neon Effect with Sparkles Particles

## Summary
Replace the CSS gradient neon hover effect (buttons) and glow borders (GlassCard) with a sparkles particle effect using `@tsparticles/react` + `@tsparticles/slim`.

## What Changes

### 1. Install Dependencies
- `@tsparticles/react`
- `@tsparticles/slim`

### 2. Create `src/components/ui/sparkles.tsx`
- Adapted `SparklesCore` component from the reference code
- Props: `className`, `background` (default transparent), `particleColor`, `particleDensity`, `minSize`, `maxSize`, `speed`
- Uses `loadSlim` engine, fades in via framer-motion on load
- `fullScreen: false` so it stays contained within its parent

### 3. Modify `src/components/ui/button.tsx`
- Remove the two `<span>` neon gradient lines (top + bottom)
- Remove `neon` prop, `NEON_DISABLED_VARIANTS`, `resolvedNeon` logic
- Add a sparkles layer that appears on hover: a small `SparklesCore` absolutely positioned inside the button with low density (~40), small particles (1-2px), primary color, and `opacity-0 group-hover:opacity-100` transition
- Variants `destructive`, `secondary`, `link` skip the sparkles (same exclusion logic)

### 4. Modify `src/components/ui/glass-card.tsx`
- Replace the bottom/left/right border glow `<motion.div>` elements with a `SparklesCore` layer at the bottom of the card
- Keep the radial glow spots and glass reflection as-is (they complement sparkles)
- The sparkles layer sits at the bottom ~30% of the card, low density, using the card's `glowColor`

### 5. Files Unchanged
- All consumers (`AICreatorCard`, `YouTubeCreatorCard`, `ScheduleCreatorCard`, `EmptyState`) remain untouched — they use `GlassCard` which gets the effect automatically

## Performance Considerations
- Buttons: particles only render while hovered (conditional mount), keeping idle cost at zero
- GlassCard: always-on but low density (~30-50 particles) with `fpsLimit: 60`
- Engine initialized once globally via `initParticlesEngine`

