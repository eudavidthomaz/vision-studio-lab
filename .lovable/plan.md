
# Corrigir Geração de Imagens para Slides de Carrossel

## Problemas Identificados

### Problema 1: Textos dos slides muito longos
Ha **instrucoes conflitantes** no backend. Em um lugar (linha 1161) diz "10-20 words MAX", mas em outro (linha 1436) diz "minimo 100 caracteres" com exemplos longos de 2-3 frases. A IA segue a instrucao mais detalhada (a longa), gerando textos enormes que nao cabem em uma imagem.

### Problema 2: Texto do slide nao e inserido na imagem
Quando voce clica "Gerar Imagem" em um card do carrossel, o fluxo e:

1. `CarrosselView` passa `titulo + conteudo` do slide para `ImageGenerationModal` via prop `copy`
2. O modal exibe isso em um campo chamado **"Texto do Post"** (deveria ser "Texto do Slide")
3. O `generate-post-image` recebe esse texto e no prompt usa apenas `truncatedCopy.split('\n')[0]` como titulo na imagem -- ou seja, so a primeira linha (o titulo) e renderizada, o conteudo do slide e ignorado
4. O prompt pede para a IA gerar uma imagem "editorial/cinematografica" e renderizar apenas o titulo, sem incluir o corpo do slide

Em resumo: a imagem gerada e um poster com o titulo, nao um slide de carrossel com o texto completo.

## Solucao

### 1. Unificar instrucoes do backend para textos curtos (Edge Function)
Remover a instrucao conflitante na linha 1436 que pede "minimo 100 caracteres" e substituir por instrucoes alinhadas com "10-20 palavras MAX". Atualizar os exemplos longos (linhas 1442-1458) para exemplos curtos e estrategicos.

**Arquivo:** `supabase/functions/generate-ai-content/index.ts`
- Linha 1436: trocar "minimo 100 caracteres" por "maximo 20 palavras - frase curta e impactante"
- Linhas 1442-1458: substituir exemplos longos por exemplos curtos alinhados com as instrucoes da linha 1170-1178

### 2. Adaptar o prompt de geracao de imagem para contexto de slide (Edge Function)
O `generate-post-image` precisa saber que esta gerando um **slide de carrossel** (nao um poster generico). Quando o texto vier com titulo + conteudo separados por `\n\n`, o prompt deve instruir a IA a renderizar **ambos** na imagem: o titulo em destaque e o texto do slide abaixo, como um card de carrossel real.

**Arquivo:** `supabase/functions/generate-post-image/index.ts`
- Detectar quando o texto tem formato de slide (titulo + corpo separados por `\n\n`)
- Ajustar o prompt para renderizar o texto completo do slide na imagem, nao so a primeira linha
- Usar layout de "slide de carrossel" em vez de "poster editorial"

### 3. Corrigir labels do modal para contexto de carrossel (Frontend)
O `ImageGenerationModal` recebe o texto do slide mas exibe "Texto do Post". Quando usado no contexto de carrossel, deveria exibir "Texto do Slide".

**Arquivo:** `src/components/ImageGenerationModal.tsx`
- Adicionar prop opcional `context?: 'post' | 'slide'` 
- Quando `context === 'slide'`, trocar "Texto do Post" por "Texto do Slide" e "Criar Imagem para Post" por "Criar Imagem para Slide"

**Arquivo:** `src/components/content-views/CarrosselView.tsx`
- Passar `context="slide"` para o `ImageGenerationModal`

## Detalhes Tecnicos

### generate-ai-content/index.ts - Remover conflito de instrucoes

Linha 1436, substituir:
```text
Antes: "Cada slide deve ter: titulo_slide, conteudo (minimo 100 caracteres), imagem_sugerida, chamada_para_acao"
Depois: "Cada slide deve ter: titulo_slide, conteudo (frase curta de 10-20 palavras MAX), imagem_sugerida, chamada_para_acao"
```

Linhas 1442-1458, substituir exemplos por versoes curtas:
```text
Exemplo Slide 1:
{
  "numero_slide": 1,
  "titulo_slide": "Voce se sente invisivel?",
  "conteudo": "Deus te ve. Ele te escolheu antes de voce nascer.",
  "chamada_para_acao": "Deslize para descobrir"
}
```

### generate-post-image/index.ts - Prompt adaptado para slides

Na construcao do prompt (linhas 136-168), detectar formato de slide e ajustar:

```text
Se o texto contem "\n\n" (titulo + corpo):
  - Title line = primeira parte
  - Body text = segunda parte
  - Prompt: "Generate a carousel SLIDE card with:
    * Title: [titulo] (bold, top area)
    * Body: [corpo] (clean readable text, center)
    * Clean background, card-style layout
    * No photo - focus on typography and readability"
```

### ImageGenerationModal.tsx - Label contextual

Adicionar prop `context` e usar condicionalmente:

```text
- DialogTitle: context === 'slide' ? "Criar Imagem para Slide" : "Criar Imagem para Post"
- Label do textarea: context === 'slide' ? "Texto do Slide" : "Texto do Post"  
- Dica: context === 'slide' ? "A IA vai criar um card visual com este texto" : "A IA vai criar uma imagem baseada neste texto"
```

### CarrosselView.tsx - Passar contexto

Na renderizacao do `ImageGenerationModal` (linha 286), adicionar `context="slide"`.

## Arquivos a Modificar

| Arquivo | Mudanca |
|---|---|
| `supabase/functions/generate-ai-content/index.ts` | Remover instrucao conflitante de "minimo 100 caracteres", alinhar exemplos |
| `supabase/functions/generate-post-image/index.ts` | Detectar contexto de slide e adaptar prompt para renderizar titulo + texto |
| `src/components/ImageGenerationModal.tsx` | Adicionar prop `context` e labels contextuais |
| `src/components/content-views/CarrosselView.tsx` | Passar `context="slide"` ao modal |

## Resultado Esperado
- Novos carrosseis terao textos curtos e estrategicos (10-20 palavras por slide)
- A imagem gerada para cada slide incluira tanto o titulo quanto o texto do slide
- O modal exibira labels corretos ("Texto do Slide" em vez de "Texto do Post")
- O texto editado no modal sera respeitado na geracao da imagem
