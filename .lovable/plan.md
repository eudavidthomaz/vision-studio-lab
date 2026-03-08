

# Replace Ministry CardStack with Glowing Grid Cards

## What
Replace the `CardStack` fan carousel in the "Início" tab (ministries section) with a responsive grid of premium glowing cards based on the provided reference design — featuring grid-line decorations, radial glow effects, and clean icon/title/description layout.

## Changes

### 1. Create `src/components/bio/MinistryGlowCard.tsx`
- Implement the reference card design: outer card with `overflow-hidden`, inner decorative grid lines (absolute SVG/divs), radial glow behind the icon, title, and multi-line description
- Accept props: `title`, `description` (string[]), `icon` (ReactNode)
- Use the project's `Card` component as the base
- Decorative elements: horizontal/vertical grid lines with `border-dashed`, radial gradient glow circle behind icon, corner dots

### 2. Edit `src/pages/Bio.tsx` (lines ~427-465)
- Replace the `CardStack` + `MinistryCard` with a responsive CSS grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) of `MinistryGlowCard` components
- Update `CHURCH.ministries` data shape to include `description` as `string[]` (split current single string into lines)
- Remove the `CardStack` import if no longer used elsewhere
- Keep the section header ("Há um lugar para você aqui") and CTA button unchanged

### Visual Result
```text
┌──────────────────────────────────────────────┐
│        "Há um lugar para você aqui"          │
│                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │ ✦ glow  │ │ ✦ glow  │ │ ✦ glow  │        │
│  │ Infantil│ │ Jovens  │ │ Casais  │        │
│  │ desc... │ │ desc... │ │ desc... │        │
│  └─────────┘ └─────────┘ └─────────┘        │
│       ┌─────────┐ ┌─────────┐                │
│       │ P.Grupos│ │ Louvor  │                │
│       └─────────┘ └─────────┘                │
│                                              │
│          [ Quero saber mais → ]               │
└──────────────────────────────────────────────┘
```

| File | Action |
|------|--------|
| `src/components/bio/MinistryGlowCard.tsx` | Create |
| `src/pages/Bio.tsx` | Edit — replace CardStack section with grid of glow cards |

