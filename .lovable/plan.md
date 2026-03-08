

# Replace "Tudo que você precisa" with Radial Orbital Timeline

## What Changes

Replace the current grid-based features section (lines 186–250) with a new `RadialOrbitalTimeline` component adapted to the project's dark glass design system.

## New Component: `src/components/RadialOrbitalTimeline.tsx`

Create a self-contained radial orbital timeline adapted from the reference code, with these adjustments:

- **Dark theme alignment**: Replace black/white color scheme with the project's `hsl` tokens (`foreground`, `muted-foreground`, `primary`, `border`, `background`).
- **Glass styling**: Use `backdrop-blur`, `bg-white/5`, `border-white/10` for nodes and expanded cards — consistent with the GlassCard design language.
- **Glow accents**: Node rings and energy bars use `bg-primary` with glow shadows matching the existing palette.
- **Mobile fallback**: On screens < `md`, switch from orbital view to a vertical stacked list (the orbital layout requires ~500px minimum to be usable).
- **No external dependencies** beyond what's already installed (`lucide-react`, `framer-motion` for entrance animation of the section wrapper).

### Data mapping

The existing `features` array will be mapped to `TimelineItem[]`:

```tsx
const timelineData: TimelineItem[] = features.map((f, i) => ({
  id: i + 1,
  title: f.title,
  date: "",            // unused visually, kept for interface compat
  content: f.description,
  category: "feature",
  icon: f.icon,
  relatedIds: [],      // no cross-links needed for features
  status: "completed" as const,
  energy: 100,         // all features "fully available"
}));
```

### Simplified interface

Remove unused fields from the reference (`date`, `relatedIds`, `energy`, `status`) in the UI rendering — keep the data shape for the rotation/positioning logic but don't render cards with progress bars or connected-nodes sections. The expanded state shows only: icon, title, description.

## Landing.tsx Changes

- **Remove**: The features grid (lines 204–223) and the "Entregáveis Prontos" sub-section (lines 225–248).
- **Keep**: Section wrapper with `motion.section`, heading "Tudo que você precisa", subtitle.
- **Add**: `<RadialOrbitalTimeline timelineData={timelineData} />` below the subtitle.
- **Move "Entregáveis"** to its own small section below the orbital, keeping the existing `GlassCard` + `CheckCircle2` list.

## File Summary

| File | Action |
|---|---|
| `src/components/RadialOrbitalTimeline.tsx` | Create |
| `src/pages/Landing.tsx` | Edit section lines 186–250 |

