

# Fix: Instalar `three` e remover código morto

## Causa Raiz
`three` **não existe** no `package.json` — apenas `@types/three` (tipos). O `import * as THREE from 'three'` falha silenciosamente, o canvas nunca é criado.

## Mudanças

### 1. `package.json`
Adicionar `"three": "^0.170.0"` nas dependencies (ao lado de `@types/three`).

### 2. `src/index.css`
Remover keyframes mortos `geo-float` e `geo-fade-in` (linhas 14-30) — não são usados pelo componente Three.js atual.

### Nenhuma outra mudança necessária
O `GeometricBackground.tsx` já está correto. Falta apenas a dependência runtime.

