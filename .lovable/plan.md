

# Replace Tab Bar with LimelightNav Component

## What
Replace the current Radix `TabsList`/`TabsTrigger` sticky tab bar on `/bio` with the provided `LimelightNav` component — a sleek bottom-glow navigation with adaptive-width highlight effect.

## Changes

### 1. Create `src/components/ui/limelight-nav.tsx`
- The provided component adapted to the project (remove `"use client"`, use project's lucide icons)
- Export `LimelightNav` and `NavItem` type

### 2. Edit `src/pages/Bio.tsx`

**Replace the sticky tab bar** (lines 254-288) with `LimelightNav`:
- Map the 4 tabs (Início, Sobre, Mídia, Contato) to `NavItem[]` using the same lucide icons (`ChurchIcon`, `BookOpen`, `Play`, `MessageCircle`)
- Use `onTabChange` callback to call `setActiveTab` with the correct tab value
- Keep the same sticky positioning (`sticky top-0 z-50 backdrop-blur-xl`)
- Center the nav using `flex justify-center`

**Keep `TabsContent` working**: Continue using Radix `Tabs` as the wrapper with `value={activeTab}` and `onValueChange={setActiveTab}`, but hide the `TabsList` and control the active tab programmatically via `LimelightNav`'s `onTabChange`

### Visual Result
```text
┌─────────────────────────────────────┐
│  sticky bar: backdrop-blur          │
│     ┌─────────────────────┐         │
│     │ 🏠  📖  ▶  💬      │         │
│     │  ▔▔▔  (glow)        │         │
│     └─────────────────────┘         │
└─────────────────────────────────────┘
```

| File | Action |
|------|--------|
| `src/components/ui/limelight-nav.tsx` | Create |
| `src/pages/Bio.tsx` | Edit — replace TabsList with LimelightNav |

