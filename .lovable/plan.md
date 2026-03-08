

# Fix: Remover `bg-background` opaco das páginas

## Causa Raiz

`bg-background` resolve para `hsl(240 10% 3.9%)` — um fundo quase preto **100% opaco**. Todas as páginas que usam essa classe cobrem completamente o `GeometricBackground` posicionado com `-z-10`.

## Plano

Remover `bg-background` de todos os containers principais das páginas, mantendo apenas classes de layout (`min-h-screen`, `flex`, etc.). O `body`/`html` já tem o fundo escuro via CSS base — não precisamos repeti-lo nos containers das páginas.

### Arquivos a modificar

| Arquivo | Classe atual | Substituição |
|---|---|---|
| `src/pages/Dashboard.tsx` (linha 330) | `min-h-screen bg-background` | `min-h-screen` |
| `src/pages/Profile.tsx` (linhas 87, 94) | `bg-background` | remover |
| `src/pages/Schedules.tsx` (linha 164) | `min-h-screen bg-background` | `min-h-screen` |
| `src/pages/Pricing.tsx` (linha 125) | `min-h-screen bg-background` | `min-h-screen` |
| `src/pages/Install.tsx` (linhas 57, 79) | `bg-background` | remover |
| `src/pages/Metrics.tsx` (linhas 155, 172) | `bg-background` | remover |
| `src/pages/SecurityDashboard.tsx` (linha 154) | `bg-background` | remover |
| `src/pages/ConfirmSchedule.tsx` (linhas 72, 80, 102, 116, 129) | `bg-background` | remover |
| `src/pages/VolunteerReports.tsx` (linha 98) | `bg-background` | remover |
| `src/pages/Volunteers.tsx` | verificar e remover `bg-background` |
| `src/pages/ContentLibrary.tsx` (linha 310) | `bg-background/98` no header sticky | manter `backdrop-blur-xl` mas trocar para `bg-background/80` para transparência parcial |
| `src/pages/Auth.tsx` | verificar e remover `bg-background` |

### Também verificar

- `src/pages/UsageDashboard.tsx` — remover `bg-background` se presente
- Headers sticky com `bg-background/50` ou similar podem ser mantidos (já são semi-transparentes)

### Resultado

As formas geométricas animadas com `framer-motion` ficarão visíveis atrás do conteúdo em todas as páginas da aplicação.

