

# Fix: Background Geométrico Não Visível

## Causa Raiz

As páginas usam backgrounds opacos próprios (ex: Landing tem `bg-gradient-to-br from-gray-900 via-gray-800 to-black`) que cobrem completamente o `GeometricBackground` fixado atrás com `-z-10`.

Duas correções necessárias:

1. **Remover/tornar transparentes** os backgrounds opacos das páginas para que o background global seja visível
2. **Aumentar a intensidade** das formas geométricas (opacidades muito baixas como `0.03`-`0.06` são quase invisíveis)

## Arquivos a Modificar

| Arquivo | Mudança |
|---|---|
| `src/pages/Landing.tsx` | Remover `bg-gradient-to-br from-gray-900 via-gray-800 to-black` do container principal |
| `src/pages/Dashboard.tsx` | Verificar e remover bg opaco |
| `src/pages/Auth.tsx` | Verificar e remover bg opaco |
| `src/pages/ContentLibrary.tsx` | Verificar e remover bg opaco |
| `src/pages/Profile.tsx` | Verificar e remover bg opaco |
| `src/pages/Volunteers.tsx` | Verificar e remover bg opaco |
| `src/pages/Schedules.tsx` | Verificar e remover bg opaco |
| `src/pages/Pricing.tsx` | Verificar e remover bg opaco |
| `src/pages/Welcome.tsx` | Verificar e remover bg opaco |
| `src/components/GeometricBackground.tsx` | Remover o overlay opaco (`from-background via-background to-background`) e aumentar opacidades das formas (ex: `0.06` → `0.12`) |

## Resultado Esperado

Formas geométricas com blur visíveis em todas as páginas, flutuando suavemente atrás do conteúdo.

