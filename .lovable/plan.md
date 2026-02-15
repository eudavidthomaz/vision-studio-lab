
# Custom Scrollbar Styling

## Problem
The app uses the browser's default white/light scrollbars, which clash with the dark theme aesthetic. This affects all scrollable areas: page body, modals, dialogs, sheets, scroll areas, textareas, and any `overflow-y: auto` container.

## Solution
Add global custom scrollbar CSS rules in `src/index.css` targeting both WebKit-based browsers (Chrome, Safari, Edge) and Firefox. The scrollbar will use the app's existing design tokens (`--muted`, `--border`, `--primary`) to blend seamlessly with the dark UI.

## File: `src/index.css`

Add a scrollbar styling block inside `@layer base` (after the existing `html, body` rule) with:

**WebKit (Chrome, Safari, Edge):**
- `*::-webkit-scrollbar` -- thin track (6px width, 6px height for horizontal)
- `*::-webkit-scrollbar-track` -- transparent background
- `*::-webkit-scrollbar-thumb` -- `hsl(var(--border))` with full rounding, transitions to `hsl(var(--muted-foreground))` on hover
- `*::-webkit-scrollbar-corner` -- transparent

**Firefox:**
- `*` -- `scrollbar-width: thin; scrollbar-color: hsl(var(--border)) transparent;`

This covers every scrollable element globally -- page body, modals (`overflow-y-auto`), Radix `ScrollArea` native fallbacks, textareas, select dropdowns, and code blocks.

No other files need modification. The Radix `ScrollArea` component already renders a custom thumb (`bg-border`), so it will remain visually consistent.
