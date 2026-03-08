

# Add AnimatedGridPattern to All Tab Sections

## What
Add the `AnimatedGridPattern` as a subtle background to each of the 4 tab content areas (Início, Sobre, Mídia, Contato) and the footer.

## Changes

### File: `src/pages/Bio.tsx`

Wrap each `TabsContent`'s inner `motion.div` in a `relative` container and insert an `AnimatedGridPattern` instance with reduced intensity:

| Section | Config |
|---------|--------|
| Início (line ~293) | `numSquares={20}`, `maxOpacity={0.08}`, mask 500px |
| Sobre (line ~399) | `numSquares={20}`, `maxOpacity={0.08}`, mask 500px |
| Mídia (line ~464) | `numSquares={20}`, `maxOpacity={0.08}`, mask 500px |
| Contato (line ~563) | `numSquares={20}`, `maxOpacity={0.08}`, mask 500px |
| Footer (line ~673) | `numSquares={15}`, `maxOpacity={0.06}`, mask 400px |

Each pattern uses `fill-primary/10 stroke-primary/10` for subtlety, placed as an absolute layer behind the content. The `motion.div` gets `relative` added to its className so content stays above the pattern.

No new files or dependencies.

