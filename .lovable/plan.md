

# Reescrever GeometricBackground com framer-motion

## Problema

A abordagem CSS puro não está funcionando — as formas continuam invisíveis. O código de referência usa `framer-motion` com animações de `initial`/`animate` e transições spring. Vamos adotar a mesma abordagem.

## Plano

### 1. Instalar `framer-motion`

Adicionar `framer-motion` como dependência.

### 2. Reescrever `src/components/GeometricBackground.tsx`

Recriar o componente `ElegantShape` usando `motion.div` com:
- `initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}`
- `animate={{ opacity: 1, y: 0, rotate }}`
- Transição spring com delay staggered por forma
- Animação infinita de float via `animate={{ y: [0, 15, 0] }}` com `repeat: Infinity`
- Estrutura visual: div externo com `backdrop-blur-sm`, div interno com gradiente e borda translúcida
- 5 formas posicionadas como no código de referência (top-left, center-right, bottom-left, top-right, bottom-center)

### 3. Manter integração no `App.tsx`

Já está integrado — sem mudanças necessárias.

### Arquivos

| Arquivo | Mudança |
|---|---|
| `package.json` | Adicionar `framer-motion` |
| `src/components/GeometricBackground.tsx` | Reescrever com `motion.div` e animações spring |

