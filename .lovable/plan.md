

# Correção: MinistriesEditor — Rebuild Completo

## Problemas Identificados

| # | Bug | Gravidade |
|---|-----|-----------|
| 1 | Seletor de ícones usa **emojis genéricos** (❤️ 👥  🎵) em vez dos Lucide icons reais que renderizam no site | Alta |
| 2 | Set de ícones do editor (10) **desalinhado** com o set da MinistriesSection (13) — faltam Church, Star, Globe, Handshake | Media |
| 3 | Campo de descrição pede "uma linha por parágrafo" — UX confusa, split por `\n` é frágil | Media |
| 4 | MinistryGlowCard usa `bg-primary/10`, `text-primary` **hardcoded** em vez das CSS variables `church-primary` | Alta — ignora cor customizada |
| 5 | `HandHeart` no MinistriesSection mapeado como fallback para `Heart` — ícone incorreto | Baixa |

## Plano de Correção

### 1. `src/components/church-site/editor/MinistriesEditor.tsx` — Rebuild do seletor

- Substituir `MINISTRY_ICONS` de emojis por **grid visual** renderizando os próprios Lucide icons
- Usar `Popover` com grid de ícones clicáveis (3 colunas) mostrando o ícone real + label
- Alinhar set de ícones com `MinistriesSection.tsx` (13 ícones)
- Trocar `Textarea` de descrição por um `Input` simples (campo único de texto descritivo)
- Melhorar UX geral: preview inline do ícone selecionado

### 2. `src/components/bio/MinistryGlowCard.tsx` — Usar CSS variables

- `bg-primary/10` → `bg-church-primary/10`
- `text-primary` → `text-church-primary`
- `bg-primary/15` → opacity equivalente com church-primary
- `bg-primary/40`, `/25`, `/15` (dots decorativos) → church-primary variants
- Adicionar classes CSS faltantes no `index.css` se necessário

### 3. `src/components/church-site/sections/MinistriesSection.tsx`

- Importar `HandHeart` de lucide-react e mapear corretamente (não como fallback para Heart)

### 4. `src/index.css` — Adicionar classes faltantes

- `.bg-church-primary\/15` e `.bg-church-primary\/20` para o glow do card
- `.bg-church-primary\/25`, `.bg-church-primary\/40` para dots decorativos
- `.border-church-primary\/20` para borda do ícone

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/church-site/editor/MinistriesEditor.tsx` | Rebuild seletor de ícones com Lucide icons reais + Popover grid |
| `src/components/bio/MinistryGlowCard.tsx` | Substituir `primary` por `church-primary` CSS vars |
| `src/components/church-site/sections/MinistriesSection.tsx` | Fix HandHeart mapping |
| `src/index.css` | Adicionar classes church-primary faltantes |

