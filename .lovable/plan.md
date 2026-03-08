

# Rebranding de Cards — Glassmorphism Premium

## Estratégia

Com 73 arquivos usando `Card`, a abordagem mais segura e eficiente é uma **estratégia em 2 camadas**:

### Camada 1 — Base Card Upgrade (automático em todo projeto)
Atualizar `src/components/ui/card.tsx` para adicionar efeitos sutis de glassmorphism a TODOS os cards do projeto sem tocar nos 73 arquivos consumidores:

- Background: `bg-white/[0.03] backdrop-blur-sm` (glass sutil)
- Border: `border-white/[0.08]` com glow sutil no hover
- Hover: elevação suave + borda iluminada
- Noise texture overlay via pseudo-elemento CSS
- Transição suave em hover

### Camada 2 — GlassCard Premium (para cards hero/destaque)
Criar um novo componente `src/components/ui/glass-card.tsx` com o efeito 3D completo da referência:

- 3D tilt via `framer-motion` (rotateX/rotateY no mouse move)
- Glow spots animados (roxo/cyan na base do card)
- Border glow lines nas laterais e bottom
- Noise texture
- Glass reflection overlay
- Aplicar nos cards de destaque: `AICreatorCard`, `YouTubeCreatorCard`, `ScheduleCreatorCard`, `EmptyState`

```text
Camada 1 (automática):                Camada 2 (manual):
┌─────────────────────┐               ┌─────────────────────┐
│  Card base sutil    │               │  GlassCard premium  │
│  glass + hover glow │               │  3D tilt + glow     │
│  73 arquivos        │               │  4-5 cards hero     │
│  Zero mudanças      │               │  Import individual  │
└─────────────────────┘               └─────────────────────┘
```

## Arquivos modificados

### 1. `src/components/ui/card.tsx`
Atualizar classes base do Card:
- `rounded-lg border bg-card` → `rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm`
- Adicionar `hover:border-white/[0.15] hover:shadow-[0_8px_32px_rgba(139,92,246,0.08)] transition-all duration-300`
- Adicionar `relative overflow-hidden` + pseudo-elemento para noise texture via CSS class

### 2. `src/components/ui/glass-card.tsx` (novo)
Componente premium com:
- Props: `children`, `className`, `glowColor?` (customizar cor do glow)
- `motion.div` com 3D tilt effect (±5° rotação, spring animation)
- Layers internas: background escuro, noise, glow spots (bottom), border glow lines, glass reflection
- Exporta `GlassCard` como wrapper — conteúdo vai dentro via `children`

### 3. `src/index.css`
Adicionar:
- `.card-noise::before` — pseudo-elemento com noise texture SVG para o card base
- `.glass-card-glow` — animação de pulsação sutil do glow

### 4. `src/components/AICreatorCard.tsx`
Substituir o wrapper div externo pelo `GlassCard`, removendo o gradient border manual atual (que já faz algo similar mas de forma diferente). Manter conteúdo interno intacto.

### 5. `src/components/YouTubeCreatorCard.tsx`
Envolver com `GlassCard` (glowColor vermelho/red para manter identidade YouTube). Manter lógica intacta.

### 6. `src/components/ScheduleCreatorCard.tsx`
Envolver com `GlassCard` (glowColor azul). Manter stats e lógica intacta.

### 7. `src/components/EmptyState.tsx`
Substituir `Card` por `GlassCard` para estados vazios premium.

## Não alterado
- Nenhum dos 73 arquivos consumidores de `Card` precisa de mudança manual (herdam o novo estilo via Camada 1)
- Toda lógica, handlers, data fetching — intactos
- Componentes de content-views, schedules, pages — recebem upgrade automático

