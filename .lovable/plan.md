

# Incluir chamada_para_acao (CTA) no Texto do Slide

## Problema

Cada slide do carrossel tem 3 campos: `titulo`, `conteudo` e `chamada_para_acao`. Porem, quando voce clica "Gerar Imagem", o codigo passa apenas `titulo` e `conteudo` para o modal (linha 135 do CarrosselView). O campo `chamada_para_acao` (ex: "Deslize para descobrir como recomecar") e completamente ignorado -- nao aparece no campo de texto do modal e nao e enviado para o gerador de imagens.

## Correcao

### Arquivo: `src/components/content-views/CarrosselView.tsx`

**Mudanca 1** - Incluir `chamada_para_acao` no texto passado ao modal (linha 135):

```text
Antes:
  texto: slide.conteudo

Depois:
  texto: slide.chamada_para_acao 
    ? `${slide.conteudo}\n\n${slide.chamada_para_acao}` 
    : slide.conteudo
```

Isso garante que o CTA e concatenado ao texto do slide antes de ir para o modal, ficando visivel no campo "Texto do Slide" e sendo enviado ao gerador de imagem.

Nenhum outro arquivo precisa ser alterado -- o `ImageGenerationModal` e o `generate-post-image` ja processam o texto completo que recebem.

## Resultado Esperado

- O campo "Texto do Slide" no modal incluira o CTA (ex: "Deslize para descobrir como recomecar")
- A imagem gerada renderizara o titulo, o conteudo e o CTA do slide
- O botao "Copiar" de cada card tambem ja inclui o CTA (linhas 151-155 ja concatenam titulo + conteudo, mas o CTA tambem sera incluido via a mesma logica)

