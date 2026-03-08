

# Rebranding: Botões com Efeito Neon

## Contexto

O botão atual usa o padrão shadcn/ui (retangular, `rounded-md`). O novo design é rounded-full com efeito neon (gradiente luminoso no hover). O projeto usa 84+ arquivos com o Button -- a migração precisa ser retrocompatível.

## Estratégia

Adaptar o componente `button.tsx` para o novo design, mantendo `asChild` (usado por shadcn) e mapeando os 6 variants existentes para o novo estilo. As cores usarão CSS variables do tema (`primary` = roxo 263°) ao invés do `blue-500` hardcoded da referência.

### Mapeamento de Variants

| Atual | Novo (equivalente) | Neon |
|---|---|---|
| `default` | `default` (bg primary/5, border primary/20) | Sim |
| `solid` (novo) | — adicionado como variant extra | Sim |
| `destructive` | bg destructive, border transparent | Não |
| `outline` | border-input, bg transparent, hover bg-white/10 | Sim |
| `secondary` | bg secondary, border secondary | Não |
| `ghost` | border transparent, hover border + bg white/10 | Sim |
| `link` | sem mudança visual significativa | Não |

### Prop `neon`

Adicionada ao ButtonProps (default `true`). Controla visibilidade dos spans de gradiente luminoso (top e bottom glow lines). Desabilitado automaticamente para `destructive`, `secondary`, `link`.

### Prop `asChild`

Mantida. Quando `asChild=true`, renderiza `<Slot>` sem os spans neon (incompatível com Slot).

## Arquivo Modificado

| Arquivo | Mudança |
|---|---|
| `src/components/ui/button.tsx` | Reescrita completa: rounded-full, neon spans, novo variant `solid`, prop `neon`, mapeamento de cores para CSS vars |

## Impacto

- Todos os 84+ arquivos que importam `Button` recebem o novo visual automaticamente
- `size="icon"` mantém aspect ratio quadrado com rounded-full
- Nenhum arquivo consumidor precisa ser alterado (API retrocompatível)

