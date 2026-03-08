

# Fix Button Component After Sparkles Integration

## Problem
The sparkles integration broke all buttons by:
1. Wrapping all children in `<span className="relative z-[1]">` — breaks icon-only buttons, buttons with SVGs, and complex child layouts
2. Adding `overflow-hidden` to every button — clips borders, shadows, and focus rings
3. Adding `useState` + mouse handlers to every button instance — unnecessary overhead for variants that don't use sparkles

## Fix

### `src/components/ui/button.tsx`
- Remove the `<span>` wrapper around `{children}` — render children directly
- Remove `overflow-hidden` from the button class
- Move `overflow-hidden` only to the sparkles `<div>` container (so particles don't bleed out)
- Remove `useState`/`onMouseEnter`/`onMouseLeave` — use pure CSS `group-hover:opacity-100` on the sparkles container instead of conditional rendering
- Keep sparkles only for `default`, `solid`, `outline`, `ghost` variants
- Sparkles container: `absolute inset-0 overflow-hidden rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0`
- Children get `relative z-[1]` only via a `<span>` if sparkles are active — actually, simpler: just ensure children render inline with no wrapper, and the sparkles sit behind via `z-0`

Final structure for non-asChild buttons:
```tsx
<button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props}>
  {showSparkles && (
    <div className="absolute inset-0 overflow-hidden rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0">
      <SparklesCore ... />
    </div>
  )}
  {children}
</button>
```

No `useState`, no extra `<span>`, no `overflow-hidden` on the button itself.

