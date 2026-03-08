

# Refactor "Como Funciona?" with Centralized SVG Diagram

## Overview

Replace the current 3-column GlassCard grid with a custom SVG-based visual component inspired by the `DatabaseWithRestApi` reference. The diagram will be a centralized visual showing the Ide.On "engine" at the center with the 3 steps radiating outward — depicting the flow from audio input → AI processing → content output.

## New Component: `src/components/HowItWorksEngine.tsx`

A self-contained SVG + HTML hybrid component with:

### Visual Structure
```text
         ┌─────────────┐
         │  🎤 Áudio   │  ← Step 1 badge (top)
         └──────┬──────┘
                │ animated path
        ┌───────▼────────┐
        │   IDE.ON AI    │  ← Central glowing box
        │  (logo + ring) │
        └───┬────────┬───┘
  path ↙              ↘ path
┌──────────┐    ┌──────────┐
│ ✨ Pack  │    │ 📅 Planner│  ← Step 2 & 3 badges
└──────────┘    └──────────┘
```

### Technical Details
- **Central element**: Glass-styled box with logo, pulsing ring, and title "Motor de IA Bíblica"
- **3 orbiting badges**: Rounded pill badges for each step, connected by animated SVG paths with gradient strokes
- **Animated light dots**: Small circles traveling along the paths (SVG `animateMotion`) — same pattern as the reference component
- **Glass styling**: `backdrop-blur`, `bg-white/5`, `border-white/10` consistent with project
- **Glow effects**: Primary-colored radial gradients behind the center box
- **Mobile**: Stack vertically with simplified connecting lines (no complex SVG paths on small screens)

### Updated Copy (Strategic & Simplified)

| Step | Title | Description |
|------|-------|-------------|
| 1 | Envie sua pregação | Grave ao vivo ou faça upload. A IA transcreve e mapeia versículos, temas e aplicações. |
| 2 | Receba o pack completo | Em minutos: posts, stories, carrosséis, roteiros de vídeo, estudo bíblico e mais — tudo fiel à Palavra. |
| 3 | Organize e publique | Ajuste o tom, escolha os dias e exporte. Sua equipe de mídia começa a semana pronta. |

## Landing.tsx Changes

- Replace the "Como Funciona" section (lines 143–186) with `<HowItWorksEngine />`
- Update the `steps` array with the new simplified copy
- Remove unused `GlassCard` grid for steps

## Files

| File | Action |
|------|--------|
| `src/components/HowItWorksEngine.tsx` | Create |
| `src/pages/Landing.tsx` | Edit lines 143–186 |

