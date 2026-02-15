

# Corrigir Dessincronizacao do Modal e Quantidade de Slides

## Problema 1: Modal mostra dados do slide errado

**Causa raiz:** O `ImageGenerationModal` usa `useState(copy)` (linha 43) para inicializar `editedCopy`. Essa inicializacao so roda **uma vez** quando o componente monta. Quando voce clica "Gerar Imagem" no Card 2 depois de ter clicado no Card 1, o `copy` prop muda mas `editedCopy` mantem o texto do Card 1.

O componente nunca desmonta entre cliques porque a condicao `selectedCard &&` (linha 285) permanece verdadeira -- `selectedCard` muda de um objeto para outro, mas nunca volta a `null` entre cliques.

**Correcao:** Adicionar um `useEffect` no `ImageGenerationModal.tsx` para sincronizar `editedCopy` quando a prop `copy` mudar:

```text
useEffect(() => {
  setEditedCopy(copy);
}, [copy]);
```

Isso garante que ao trocar de slide, o texto no modal atualiza imediatamente.

## Problema 2: Carrossel de 10 slides em vez de 4

**Causa raiz:** A validacao no backend (linha 1619-1622) diz: "se o usuario NAO especificou quantidade, exigir minimo 8 slides". O problema e que a extracao de `specs.quantidade` pode falhar no backend se o formato do prompt processado nao contiver exatamente `QUANTIDADE_OBRIGATORIA: 4`.

Alem disso, mesmo quando `specs.quantidade = 4` e detectada corretamente, a IA pode gerar 10 slides e a validacao rejeita (retorna false no `hasCorrectStructure`), disparando retry. No retry, a IA pode gerar novamente um numero errado, e apos 2 retries o sistema aceita o que vier -- que pode ser 10 slides.

**Correcao:**
- No backend, apos a validacao falhar e os retries se esgotarem, **truncar** o array de slides para a quantidade solicitada em vez de aceitar todos
- Reforcar no prompt do carrossel a instrucao de quantidade exata quando `specs.quantidade` existir
- Adicionar log explicito quando a quantidade nao for detectada no backend

## Detalhes Tecnicos

### Arquivo: `src/components/ImageGenerationModal.tsx`

Adicionar `useEffect` apos a linha 43 (`const [editedCopy, setEditedCopy] = useState(copy)`):

```text
useEffect(() => {
  setEditedCopy(copy);
}, [copy]);
```

Importar `useEffect` do React (adicionar ao import existente na linha 1).

### Arquivo: `supabase/functions/generate-ai-content/index.ts`

1. **Apos validacao/retries** (onde `parsedContent` e aceito mesmo com estrutura incorreta): se `specs.quantidade` existe e o numero de slides e maior, truncar:

```text
if (specs.quantidade && slides.length > specs.quantidade) {
  content.estrutura_visual.slides = slides.slice(0, specs.quantidade);
  console.log(`✂️ Truncado de ${slides.length} para ${specs.quantidade} slides`);
}
```

2. **No prompt do carrossel**: quando `specs.quantidade` existir, adicionar instrucao explicita como "GERE EXATAMENTE {N} SLIDES. NEM MAIS NEM MENOS."

3. **Na validacao padrao** (linha 1619-1622): reduzir o minimo padrao de 8 para um valor mais razoavel (ex: 4), ja que o usuario pode pedir carrosseis curtos

### Arquivo: `src/components/content-views/CarrosselView.tsx`

Nenhuma mudanca necessaria -- o problema nao esta na view.

## Arquivos a Modificar

| Arquivo | Mudanca |
|---|---|
| `src/components/ImageGenerationModal.tsx` | Adicionar `useEffect` para sincronizar `editedCopy` com `copy` prop |
| `supabase/functions/generate-ai-content/index.ts` | Truncar slides excedentes, reforcar instrucao de quantidade no prompt, ajustar minimo padrao |

## Resultado Esperado

- Ao clicar "Gerar Imagem" em qualquer slide apos navegar no carrossel, o modal mostrara o texto correto daquele slide
- Carrosseis gerados respeitarao a quantidade solicitada (ex: 4 paginas = 4 slides, nunca 10)
- Se a IA insistir em gerar mais slides do que o pedido, o sistema truncara automaticamente
