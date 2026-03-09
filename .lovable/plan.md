

# Safe Area (Dynamic Island / Notch) — Correção Global

## Problema
O `viewport-fit=cover` já está no `index.html`, mas nenhuma página aplica `padding-top: env(safe-area-inset-top)`, fazendo o conteúdo ficar debaixo do Dynamic Island/notch em iPhones.

## Solução
Aplicar safe-area insets **globalmente** no `html` e `body` via CSS, em vez de alterar cada página individualmente. Isso garante cobertura total (Landing, Dashboard, Auth, etc.) sem risco de esquecer alguma rota.

## Mudança

### Arquivo: `src/index.css` (bloco `@layer base`, onde `html, body` já é estilizado ~L417)

Adicionar ao seletor `html, body` existente:
```css
html, body {
  @apply bg-background text-foreground;
  overflow-x: hidden;
  overscroll-behavior-x: none;
  /* Safe area — Dynamic Island / Notch */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### Elementos `sticky top-0` / `fixed top-0`
Headers sticky (Landing, ContentLibrary, Sites, etc.) precisam de `top: env(safe-area-inset-top)` para não ficarem sob o notch quando o body já tem o padding. Vou adicionar uma utility class e aplicar nos headers:

```css
.sticky-safe-top {
  top: env(safe-area-inset-top);
}
```

Porém, como o body já terá `padding-top`, os sticky headers com `top-0` ficam naturalmente corretos — o padding do body empurra todo o conteúdo. Headers `fixed` (raro neste projeto) precisariam do ajuste, mas a maioria usa `sticky`.

## Escopo final
- **1 arquivo editado**: `src/index.css`
- **Zero alterações** em componentes/páginas individuais
- Funciona para todas as rotas automaticamente

