

# Plano de Execução — Auditoria P0 a P3

## P0 — Bugs Críticos

### 1. FooterSection: adicionar `isPreview`
**Arquivo:** `src/components/church-site/sections/FooterSection.tsx`
- Aceitar `isPreview?: boolean` na interface
- Quando `isPreview=true`: usar `StaticGridPattern` em vez de `AnimatedGridPattern`
- Quando `isPreview=false`: manter `AnimatedGridPattern` intacto

**Arquivo:** `src/components/church-site/ChurchSiteTemplate.tsx` L188
- Passar `isPreview={isPreview}` para `<FooterSection>`

### 2. Remover dead code
**Arquivo:** `src/pages/SiteEditor.tsx`
- L45: trocar import `Image` por `Share2` (será usado no P2 para o ícone de Redes Sociais)
- L108: remover `refetch` do destructuring de `useChurchSite()`
- L478: remover `siteId={site.id}` de `<MinistriesEditor>`
- L513: remover `siteId={site.id}` de `<EventsEditor>`

**Arquivo:** `src/components/church-site/editor/MinistriesEditor.tsx`
- L57: remover `siteId: string` da interface
- L64: remover `siteId` do destructuring

**Arquivo:** `src/components/church-site/editor/EventsEditor.tsx`
- L10: remover `siteId: string` da interface
- L16: remover `siteId` do destructuring

---

## P1 — Performance do Preview

### 3. GlassCard: modo estático
**Arquivo:** `src/components/ui/glass-card.tsx`
- Adicionar prop `isStatic?: boolean`
- Quando `isStatic=true`:
  - Renderizar `<div>` em vez de `<motion.div>` / `<motion.button>`
  - Não renderizar `SparklesCore`
  - Não registrar `onMouseMove` / `onMouseEnter` / `onMouseLeave`
  - Usar `bg-card` em vez de hardcoded `hsl(240 10% 5%)` (também corrige P2.8)
  - Manter os gradients de glow como divs estáticos (opacidade fixa 0.7 / 0.65)
  - Manter glass reflection como div estático
- Quando `isStatic=false` (default): zero alterações

### 4. Propagar `isPreview` para seções que usam GlassCard
**Arquivos afetados (cada um recebe `isPreview?: boolean` na interface e passa `isStatic={isPreview}` para GlassCard):**
- `FirstTimeSection.tsx` — 1 GlassCard
- `ScheduleSection.tsx` — 2 GlassCards
- `ContactSection.tsx` — até 4 GlassCards
- `GivingSection.tsx` — 1 GlassCard
- `PrayerSection.tsx` — 1 GlassCard + SparklesCore standalone (condicionar a `!isPreview`)

**Arquivo:** `src/components/church-site/ChurchSiteTemplate.tsx`
- Passar `isPreview={isPreview}` para: `FirstTimeSection`, `ScheduleSection`, `AboutSection`, `MinistriesSection`, `ContactSection`, `PrayerSection`, `GivingSection`

### 5. AboutSection: desligar RadialOrbitalTimeline no preview
**Arquivo:** `src/components/church-site/sections/AboutSection.tsx`
- Aceitar `isPreview?: boolean`
- Quando `isPreview=true`: renderizar valores como lista estática (cards simples com ícone + título + conteúdo) em vez de `RadialOrbitalTimeline`
- Quando `isPreview=false`: manter `RadialOrbitalTimeline` intacto

### 6. Seções com `motion.div whileInView`: bypass no preview
Para cada seção que recebe `isPreview`, quando `isPreview=true`:
- Substituir `initial="hidden" whileInView="visible"` por `initial="visible" animate="visible"` (renderiza imediatamente sem observer)
- Alternativa mais simples: usar `initial={false}` que desabilita animação de entrada

---

## P2 — UX

### 7. Confirmação de exclusão para ministérios
**Arquivo:** `src/components/church-site/editor/MinistriesEditor.tsx`
- Importar `AlertDialog` do shadcn
- Envolver botão de delete em `AlertDialog` com mensagem "Tem certeza que deseja excluir este ministério?"
- Chamar `handleDelete` apenas no `onAction` do AlertDialog

### 8. Confirmação de exclusão para eventos
**Arquivo:** `src/components/church-site/editor/EventsEditor.tsx`
- Mesma lógica do item 7

### 9. Ícone duplicado na sidebar
**Arquivo:** `src/pages/SiteEditor.tsx` L585
- Trocar `<Globe className="w-4 h-4 text-primary" />` por `<Share2 className="w-4 h-4 text-primary" />` na seção "Redes Sociais"

---

## P3 — Limpeza Arquitetural

### 10. updateMinistry: filtrar undefined
**Arquivo:** `src/hooks/useChurchSite.tsx` L317-332
- Construir objeto de update apenas com campos presentes (não `undefined`):
```tsx
const updatePayload: Record<string, unknown> = {};
if (updates.title !== undefined) updatePayload.title = updates.title;
if (updates.description !== undefined) updatePayload.description = updates.description;
if (updates.icon !== undefined) updatePayload.icon = updates.icon;
if (updates.sortOrder !== undefined) updatePayload.sort_order = updates.sortOrder;
```
- Mesma lógica para `updateEvent`

### 11. Mover MinistryGlowCard
- De `src/components/bio/MinistryGlowCard.tsx` para `src/components/church-site/MinistryGlowCard.tsx`
- Atualizar import em `MinistriesSection.tsx` (L4)
- Atualizar import em `Bio.tsx` (se referenciado)

### 12. updateSite: filtrar ministries/events antes de transformConfigToRow
**Arquivo:** `src/pages/SiteEditor.tsx` L150
- Antes de chamar `updateSite.mutateAsync`, criar cópia do config sem `ministries` e `events`:
```tsx
const { ministries, events, ...siteConfig } = currentConfig;
await updateSite.mutateAsync({ id: currentSite.id, updates: siteConfig });
```

---

## Arquivos Totais

| Arquivo | Fase |
|---------|------|
| `FooterSection.tsx` | P0 |
| `ChurchSiteTemplate.tsx` | P0 + P1 |
| `SiteEditor.tsx` | P0 + P2 + P3 |
| `MinistriesEditor.tsx` | P0 + P2 |
| `EventsEditor.tsx` | P0 + P2 |
| `glass-card.tsx` | P1 |
| `FirstTimeSection.tsx` | P1 |
| `ScheduleSection.tsx` | P1 |
| `ContactSection.tsx` | P1 |
| `GivingSection.tsx` | P1 |
| `PrayerSection.tsx` | P1 |
| `AboutSection.tsx` | P1 |
| `useChurchSite.tsx` | P3 |
| `MinistryGlowCard.tsx` | P3 (mover) |
| `MinistriesSection.tsx` | P3 (update import) |

## Garantias

- Zero alteração no site público (`isPreview=false` nunca muda)
- GlassCard `isStatic` mantém mesma hierarquia HTML e classes visuais — só remove SparklesCore, motion e mouse tracking
- AboutSection preview usa lista estática com mesmos dados — só remove RadialOrbitalTimeline
- Delete confirmations seguem padrão existente do projeto (AlertDialog em Sites.tsx)

