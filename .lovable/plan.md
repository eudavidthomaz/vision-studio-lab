
# Corrigir Exibicao dos Slides do Carrossel

## Problema

Os 5 slides do carrossel **estao salvos corretamente** no banco de dados, dentro de `content.conteudo.estrutura_visual.slides`. Porem, a funcao `detectRealContentType` nao consegue encontra-los porque falta um caminho de busca na extracao dos slides.

O que acontece hoje:

```text
content = {
  conteudo: {
    estrutura_visual: {
      slides: [ ... 5 slides ... ]  <-- OS DADOS ESTAO AQUI
    }
  }
}
```

A funcao de detecao entra no bloco correto (linha 1207 detecta `data.conteudo.estrutura_visual` como truthy), mas na extracao dos slides (linha 1208) verifica apenas:
- `data.estrutura_visual.slides` (falta o prefixo `conteudo`)
- `data.carrossel.slides`
- `data.slides`
- `Array.isArray(data.conteudo.estrutura_visual)` (e um objeto, nao array)

Nenhum desses caminhos bate. Resultado: `slides = null`, a detecao falha, o sistema exibe a view generica sem os cards do carrossel.

## Correcao

### Arquivo: `src/lib/normalizeContentData.ts`

Adicionar o caminho `data?.conteudo?.estrutura_visual?.slides` na extracao dos slides dentro de `detectRealContentType` (linha 1208):

```text
Antes:
  data?.estrutura_visual?.slides || data?.carrossel?.slides || data?.slides || Array.isArray(...)

Depois:
  data?.conteudo?.estrutura_visual?.slides || data?.estrutura_visual?.slides || data?.carrossel?.slides || data?.slides || Array.isArray(...)
```

Isso e uma correcao de uma unica linha. Os slides ja existem no banco e o componente `CarrosselView` ja sabe renderiza-los (o normalizador `normalizeCarrosselData` ja tem esse caminho na linha 165). O problema e exclusivamente na **detecao de tipo**.

## Resultado Esperado

- O carrossel mais recente (e todos os anteriores com mesma estrutura) passara a exibir os 5 cards com titulo, texto e botao de gerar imagem
- Nenhum outro tipo de conteudo sera afetado
