

# Implementação: CSS Variables Inline para Cores Customizadas

## Estratégia

Injetar `primaryColor` e `secondaryColor` do branding como CSS custom properties no wrapper do template. Criar classes utilitárias que referenciam essas variáveis. Substituir as classes Tailwind estáticas (`text-primary`, `bg-primary`) nos componentes do church-site pelas novas classes.

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/church-site/ChurchSiteTemplate.tsx` | Injetar `--church-primary` e `--church-secondary` via `style` no wrapper |
| `src/index.css` | Adicionar classes utilitárias `.church-primary-*` |
| `src/components/church-site/sections/HeroSection.tsx` | `text-primary` → `text-church-primary` (ícones Clock, MapPin) |
| `src/components/church-site/sections/ScheduleSection.tsx` | `text-primary`, `bg-primary/10` → classes church |
| `src/components/church-site/sections/EventsSection.tsx` | `text-primary`, `bg-primary/10` → classes church |
| `src/components/church-site/sections/ContactSection.tsx` | `text-primary`, `bg-primary/10` → classes church |
| `src/components/church-site/sections/PrayerSection.tsx` | `text-primary`, `bg-primary/10` → classes church |
| `src/components/church-site/sections/GivingSection.tsx` | `text-primary`, `bg-primary/10` → classes church |
| `src/components/church-site/sections/FirstTimeSection.tsx` | `hover:text-primary` → hover church |
| `src/components/church-site/sections/FooterSection.tsx` | `hover:border-primary`, `hover:bg-primary` → classes church |

## Implementação

### 1. ChurchSiteTemplate.tsx — Injetar variáveis

```tsx
<div
  style={{
    '--church-primary': config.branding.primaryColor || 'hsl(263 70% 50%)',
    '--church-secondary': config.branding.secondaryColor || 'hsl(188 95% 40%)',
  } as React.CSSProperties}
  className={cn(...)}
>
```

### 2. index.css — Classes utilitárias

```css
/* Church site custom color utilities */
.text-church-primary { color: var(--church-primary); }
.bg-church-primary { background-color: var(--church-primary); }
.bg-church-primary\/5 { background-color: color-mix(in srgb, var(--church-primary) 5%, transparent); }
.bg-church-primary\/10 { background-color: color-mix(in srgb, var(--church-primary) 10%, transparent); }
.border-church-primary\/30 { border-color: color-mix(in srgb, var(--church-primary) 30%, transparent); }
.text-church-primary\/70 { color: color-mix(in srgb, var(--church-primary) 70%, transparent); }
.hover\:text-church-primary:hover { color: var(--church-primary); }
.hover\:border-church-primary\/30:hover { border-color: color-mix(in srgb, var(--church-primary) 30%, transparent); }
.hover\:bg-church-primary\/5:hover { background-color: color-mix(in srgb, var(--church-primary) 5%, transparent); }
.fill-church-primary\/10 { fill: color-mix(in srgb, var(--church-primary) 10%, transparent); }
.stroke-church-primary\/10 { stroke: color-mix(in srgb, var(--church-primary) 10%, transparent); }
```

### 3. Seções — Substituir classes

Todas as 64 ocorrências de `text-primary`, `bg-primary/10`, `border-primary/30`, `fill-primary/10`, `stroke-primary/10` nos arquivos de seção serão substituídas pelas equivalentes `church-primary`.

O `AnimatedGridPattern` no template também receberá `fill-church-primary/10 stroke-church-primary/10`.

## Resultado

- Usuário muda cor no editor → CSS variable atualiza → preview reflete em tempo real
- Todas as seções herdam a cor customizada automaticamente
- Tema global da app (`--primary`) não é afetado

