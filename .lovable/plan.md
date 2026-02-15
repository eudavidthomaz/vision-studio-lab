

# Remover "Assinatura" do Prompt de Geracao de Imagem

## Problema

No arquivo `supabase/functions/generate-post-image/index.ts`, linha 122, o estilo **tipografico** inclui a instrucao `assinatura manuscrita no cantinho` no prompt enviado ao modelo de geracao de imagem. O modelo interpreta isso literalmente e renderiza a palavra "Assinatura" na imagem gerada.

## Correcao

### Arquivo: `supabase/functions/generate-post-image/index.ts`

Remover a parte `assinatura manuscrita no cantinho.` da descricao do estilo tipografico (linha 122).

**Antes:**
```text
'tipografico': 'sem foto. Fundo solido/texturizado (papel). Titulo branco em grotesk bold/condensed; use um realce de caneta (sublinhar ou oval) em 1-2 palavras-chave; assinatura manuscrita no cantinho.'
```

**Depois:**
```text
'tipografico': 'sem foto. Fundo solido/texturizado (papel). Titulo branco em grotesk bold/condensed; use um realce de caneta (sublinhar ou oval) em 1-2 palavras-chave.'
```

Apenas uma linha precisa ser editada. A edge function sera re-deployada automaticamente.

## Resultado Esperado

Imagens geradas no estilo tipografico nao terao mais o texto "Assinatura" renderizado.

