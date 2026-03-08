

# Hero Rewrite: ContainerScroll Strategy

## Summary

Replace the current `HeroScrollVideo` component (custom wheel/touch hijacking approach) with a new `ContainerScroll`-based hero that uses Framer Motion's native `useScroll` + `useTransform` for a 3D perspective card rotation effect. The video card starts rotated ~20° on X-axis and flattens to 0° as the user scrolls — no scroll hijacking, no `preventDefault`.

## What Changes

### 1. New Component: `src/components/ContainerScrollHero.tsx`
Adapted from the reference code, customized for our stack:
- Uses `useScroll({ target: containerRef })` + `useTransform` for `rotateX`, `scale`, `translateY`
- Mobile: scale `[0.7, 0.9]`, Desktop: `[1.05, 1]`
- `rotateX` transforms from `20` → `0` as user scrolls
- Title section translates up with scroll via `translateY`
- Card wrapper: dark rounded container (`bg-[#222222]`, `border-[#6C6C6C]`, `rounded-[30px]`) with heavy box-shadow
- YouTube iframe lives inside the card as `children`
- `titleComponent` prop receives the title + subtitle + CTA markup
- Container height: `h-[60rem] md:h-[80rem]` to create the scroll runway

### 2. Update `src/pages/Landing.tsx`
- Replace `HeroScrollVideo` import with `ContainerScrollHero`
- Pass title/subtitle/meta/CTA as `titleComponent`
- Pass YouTube iframe as `children`
- Remove `HeroScrollVideo` wrapper — the sections below now flow naturally (no more `showContent` gating)

### 3. Delete `src/components/HeroScrollVideo.tsx`
No longer needed.

## Technical Details

```text
┌──────────────────────────────────┐
│  ContainerScroll (h-[80rem])     │
│  ┌────────────────────────────┐  │
│  │ Header (translateY)        │  │
│  │  Title + Subtitle + CTA   │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ Card (rotateX + scale)     │  │
│  │  ┌──────────────────────┐  │  │
│  │  │ YouTube iframe       │  │  │
│  │  └──────────────────────┘  │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
│  ... rest of Landing sections    │
```

Key difference: Native scroll — no wheel/touch event hijacking. The tall container creates a natural scroll region that drives the animation via `scrollYProgress`.

