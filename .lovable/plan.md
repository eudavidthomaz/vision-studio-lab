

# Migrar Google Fonts para Arquivos Locais

## Objetivo
Eliminar a dependência do CDN do Google Fonts, hospedar todas as 5 fontes localmente como `.woff2`, e corrigir o FOUT da Robin Alts. Isso melhora performance (sem DNS lookup externo), confiabilidade (funciona offline/PWA) e elimina flashes de fonte.

## Fontes a migrar
| Fonte | Pesos usados | Uso no projeto |
|---|---|---|
| Bebas Neue | 400 | `font-overlay-impact` |
| Playfair Display | 400, 700, 900 | `font-overlay-elegant` |
| Montserrat | 400, 500, 600, 700, 800 | `font-overlay-modern` |
| Dancing Script | 400, 700 | `font-overlay-handwritten` |
| Inter | 400, 500, 600, 700 | `font-overlay-clean` |

## Mudanças

### 1. Adicionar arquivos de fonte
Criar `src/assets/fonts/` com os `.woff2` baixados do Google Fonts (um arquivo por peso). ~15 arquivos totais.

### 2. `src/index.css` — Declarar `@font-face` para cada fonte/peso
Adicionar as declarações logo após a `@font-face` da Robin Alts existente. Todas com `font-display: block` para evitar FOUT.

```css
/* Exemplo para Bebas Neue */
@font-face {
  font-family: 'Bebas Neue';
  src: url('./assets/fonts/BebasNeue-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: block;
}
```

Também alterar a Robin Alts existente de `font-display: swap` para `font-display: block`.

### 3. `index.html` — Remover Google Fonts
Remover as 3 linhas:
- `<link rel="preconnect" href="https://fonts.googleapis.com" />`
- `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`
- `<link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet" />`

### 4. `tailwind.config.ts` — Sem mudanças
As `fontFamily` já referenciam os nomes corretos das fontes. Continuarão funcionando.

### 5. `vite.config.ts` — Sem mudanças
O Vite já processa assets em `src/assets/` automaticamente.

### Não alterado
- Nenhum componente é modificado
- `overlayPositions.ts`, `EditableOverlay.tsx` continuam iguais
- Funcionalidade de overlay, export com html2canvas — tudo intacto

