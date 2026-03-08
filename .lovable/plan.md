

# Adicionar fonte Robin-Alts e aplicar na frase do Hero

## Mudanças

### 1. Copiar o font file
`user-uploads://Robin-Alts.otf` → `src/assets/fonts/Robin-Alts.otf`

### 2. `src/index.css` — registrar @font-face
Adicionar no topo (após os `@tailwind`):
```css
@font-face {
  font-family: 'Robin Alts';
  src: url('./assets/fonts/Robin-Alts.otf') format('opentype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

### 3. `tailwind.config.ts` — adicionar font family
Na seção `fontFamily`, adicionar:
```ts
'robin': ['"Robin Alts"', 'sans-serif'],
```

### 4. `src/components/HeroHeader.tsx` — aplicar na frase
Adicionar `font-robin` nos dois `<span>` da frase "Ide por todo o mundo" e "inclusive no digital" (linhas 84-89).

