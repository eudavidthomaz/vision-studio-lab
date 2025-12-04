# Visão geral do ReelView

O componente `ReelView` é responsável por exibir roteiros e materiais auxiliares
quando a IA gera um conteúdo no formato de reel. Ele foi estruturado para lidar
com diferentes formatos de resposta das APIs, priorizando sempre mostrar algo
útil para o usuário.

## Fallbacks e prioridades
- **Roteiro em cenas**: se a IA devolver um array `cenas` dentro de `roteiro` ou
  `estrutura_visual`, cada cena é renderizada com visual e áudio/voz, além de
  botão de cópia rápida.
- **Blocos estruturados**: na ausência de cenas, mas havendo `hook`,
  `desenvolvimento` ou `cta`, o componente exibe a versão resumida do roteiro
  com duração total, textos na tela e áudio sugerido quando disponíveis.
- **Roteiro textual simples**: se só houver um campo `roteiro` textual, ele é
  mostrado integralmente com opção de copiar.
- **Legendas e hashtags**: a legenda é mostrada quando existir. As hashtags são
  buscadas primeiro em `conteudo.hashtags`, depois em `dica_producao.hashtags`
  (incluindo `data.dica_producao.hashtags` para o formato do ContentViewer).

## Ações do usuário
- **Copiar blocos**: cada seção relevante possui botão para copiar o texto
  específico (cena, roteiro estruturado, roteiro textual, legenda ou hashtags).
- **Gerar capa**: o botão "Gerar Capa" abre o `ImageGenerationModal` já com um
  prompt que combina título, descrição visual da primeira cena e legenda para
  facilitar a criação rápida de uma imagem de capa.
