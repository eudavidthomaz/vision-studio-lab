

# Fix Mobile Cropping on "Como Funciona?" CardStack

## Root Cause

The `CardStack` is rendered with fixed `cardWidth={560}` and `cardHeight={340}`. On mobile screens (~375px wide), the 560px card overflows and gets clipped by `overflow-x: hidden` on the body.

## Solution

Make `HowItWorksSection.tsx` responsive by using `useIsMobile()` to pass smaller card dimensions and adjusted fan parameters on mobile:

### `src/components/HowItWorksSection.tsx`

- Import `useIsMobile` hook
- On mobile: `cardWidth={300}`, `cardHeight={200}`, `spreadDeg={20}`, `overlap={0.5}`, `depthPx={60}`, `activeLiftPx={10}`
- On desktop: keep current values
- Adjust section container height accordingly via the `cardHeight` change (the component already computes height from `cardHeight + 80`)

### `src/components/ui/card-stack.tsx`

- Add `overflow-hidden` to the outer stage container (line 130) to prevent any residual bleed
- No other changes needed — the component already works with any `cardWidth`/`cardHeight` passed as props

| File | Change |
|------|--------|
| `src/components/HowItWorksSection.tsx` | Add responsive card dimensions |
| `src/components/ui/card-stack.tsx` | Add `overflow-hidden` to stage |

