

# Preview Responsivo — Breakpoints no Editor

## Escopo
Arquivo único: `src/pages/SiteEditor.tsx`. Zero mudanças no site público.

## Mudanças

### 1. Import (L26)
Adicionar `Tablet` de `lucide-react`.

### 2. Constante de breakpoints (antes do componente, ~L60)
```ts
const PREVIEW_BREAKPOINTS = [
  { label: "Fluid",          width: 0,    icon: Monitor },
  { label: "Desktop · 1280", width: 1280, icon: Monitor },
  { label: "Laptop · 1024",  width: 1024, icon: Monitor },
  { label: "Tablet · 768",   width: 768,  icon: Tablet },
  { label: "Mobile · 640",   width: 640,  icon: Smartphone },
  { label: "Mobile · 375",   width: 375,  icon: Smartphone },
] as const;
```

### 3. Estado (L92)
Trocar `previewMode` por `previewWidth` (number, default `0`).

### 4. Barra de breakpoints (L240-259)
Substituir os 2 botões por `.map()` sobre `PREVIEW_BREAKPOINTS`. Cada botão mostra `Icon` + label. Estado ativo com `variant="solid"` + ring visual (`ring-2 ring-primary/50`). Botões inativos com `variant="ghost"`.

### 5. Container do preview (L755-767)
```tsx
<div className="h-full bg-muted/30 flex items-start justify-center p-4 overflow-auto">
  <div
    className="bg-background rounded-lg shadow-2xl overflow-hidden transition-all duration-300 mx-auto"
    style={{
      width: previewWidth === 0 ? '100%' : `${previewWidth}px`,
      maxWidth: '100%',
      height: previewWidth === 0 ? '100%' : '85vh',
    }}
  >
    <div className="h-full overflow-auto">
      {previewConfig && <ChurchSiteTemplate config={previewConfig} isPreview />}
    </div>
  </div>
</div>
```

Garantias UX:
- `mx-auto` centraliza o preview em todas as larguras.
- `maxWidth: '100%'` impede quebra de layout quando o painel é menor que o breakpoint.
- `transition-all duration-300` mantém transição suave.
- `variant="solid"` + `ring-2` no botão ativo deixa o estado selecionado inequívoco.
- Larguras fixas usam `85vh` de altura para manter proporção realista sem overflow.

