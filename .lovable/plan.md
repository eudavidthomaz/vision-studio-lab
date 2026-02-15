
# Fix: Overlay Editor & Image Modal Mobile Responsiveness

## Root Cause Analysis

Three interconnected problems cause the broken experience:

1. **ImageOverlayEditor canvas overflows its container**: The preview container sets explicit pixel `width`/`height` via inline style (`dimensions.width * scale`), but `scale` is calculated from `containerWidth` which defaults to 400px on mount -- before the DOM measures the actual available space. On mobile, the modal content area is ~320-360px, so the 400px canvas causes horizontal scroll.

2. **EditableOverlay edit panel blows up on mobile**: The edit panel uses `transform: scale(${1/scale})` to counteract the canvas scaling. When `scale` is ~0.3 (on mobile), `1/0.3 = 3.33x`, making a 280px panel render at ~930px. This is the main cause of the "elements don't fit on screen" issue.

3. **Nested scroll containers**: The `ImageGenerationModal` (Dialog with `overflow-y-auto`) opens inside `MobileContentSheet` (which has its own scroll), creating nested scrollable areas. The overlay editor's controls area adds yet another scroll dimension.

## Fixes

### File 1: `src/components/ImageOverlayEditor.tsx`

- Replace `useState(400)` with `useState(0)` and use a `ResizeObserver` to get the real container width immediately
- Cap the preview container to `w-full` using CSS `max-width: 100%` instead of relying on calculated pixel width
- Add `overflow-hidden` to the outer container to prevent any child from causing horizontal scroll
- Ensure the scale factor uses actual measured width, not a hardcoded 400

### File 2: `src/components/EditableOverlay.tsx`

- Remove `transform: scale(${1/scale})` from edit panels entirely -- this is the main culprit making panels 3x their size on mobile
- On mobile, render the edit panel as a `fixed bottom-0 inset-x-0` sheet-like panel with `z-50`, without any transform
- On desktop, keep it `absolute` below the overlay element, but remove the inverse scale transform (the panel sits outside the scaled canvas context anyway since it's `fixed`)
- Constrain panel width to `max-w-[calc(100vw-1.5rem)]` to prevent any viewport overflow

### File 3: `src/components/ImageGenerationModal.tsx`

- Add `overflow-x-hidden` to the `DialogContent` to prevent any horizontal scroll from children
- Ensure the overlay tab content uses `min-w-0` to allow flex children to shrink below their content size
- Add `w-full min-w-0 overflow-hidden` wrapper around `ImageOverlayEditor` render

### File 4: `src/components/MobileContentSheet.tsx`

- Add `overflow-x-hidden` explicitly to the scrollable content area (already has `overflow-x-hidden` but verify it propagates)

## Technical Details

The `transform: scale(1/scale)` pattern was fundamentally flawed for mobile because:
- The canvas renders at 1080px and is scaled down to ~320px via `transform: scale(0.3)`
- Edit panels inside the canvas were counter-scaled by `scale(3.33)` to appear at "normal" size
- But this 3.33x scale makes a 280px-wide panel render as 930px -- far exceeding the viewport

The fix uses `fixed` positioning for edit panels, which takes them out of the scaled canvas context entirely, eliminating the need for counter-scaling.
