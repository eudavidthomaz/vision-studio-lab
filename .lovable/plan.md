

# Background Geométrico Global

## Problema

O código de referência usa `framer-motion` (não instalado). Adicionar essa dependência (~30KB gzipped) só para animações de background é desnecessário — CSS animations reproduzem o mesmo efeito com zero overhead.

## Abordagem

Criar um componente `GeometricBackground` com formas geométricas animadas via CSS puro (keyframes para float, rotate, fade-in). O componente será posicionado como `fixed inset-0 -z-10` e inserido uma única vez no `App.tsx`, aplicando-se globalmente a todas as páginas.

### Estrutura Visual

```text
┌──────────────────────────────────┐
│  ╱╲  (shape 1, top-left)        │
│     ╲  rotated, white/[0.08]    │
│                                  │
│            ◇ (shape 2, center)   │
│                                  │
│   ╱╲  (shape 3, bottom-right)   │
│  ╱  ╲  rotated, primary/[0.05]  │
│                                  │
│        ◇ (shape 4, top-right)    │
└──────────────────────────────────┘
  All shapes: blur-3xl, slow float animation, staggered delays
```

### Detalhes

- 4-5 formas geométricas (`div` com `rounded-full` ou `rounded-3xl`) posicionadas absolutamente
- Gradientes usando cores do tema (`from-white/[0.08]`, `from-primary/[0.05]`, `from-accent/[0.03]`)
- CSS keyframes: `float` (translateY ±20px), `spin-slow` (360° em 30s+), fade-in com delay staggered
- `pointer-events-none` para não interferir com interações
- Overlay sutil de noise/grain via pseudo-elemento (opcional)

## Arquivos

| Arquivo | Mudança |
|---|---|
| `src/components/GeometricBackground.tsx` | **Novo** — formas geométricas com animações CSS |
| `src/App.tsx` | Importar e renderizar `<GeometricBackground />` antes do `<BrowserRouter>` |
| `tailwind.config.ts` | Adicionar keyframes `float` e `spin-slow` |

Zero dependências externas adicionadas.

