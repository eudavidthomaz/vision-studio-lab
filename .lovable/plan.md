

# Corrigir renderização da fonte Robin Alts

## Diagnóstico
O `<h2>` pai tem `font-bold` (weight 700). A fonte Robin Alts só possui weight normal (400). O navegador aplica um "faux bold" que distorce os glifos, fazendo a fonte parecer diferente do arquivo original.

## Mudança

### `src/components/HeroHeader.tsx`
- Remover `font-bold` do `<h2>` (linha 83)
- Adicionar `font-normal` nos spans com `font-robin` para garantir weight correto

