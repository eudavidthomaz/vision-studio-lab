

# Redirecionar Conteudo Gerado para o Modal da Biblioteca

## Problema Atual

Quando um novo conteudo e gerado, o sistema navega para `/biblioteca/{id}`, que renderiza a pagina `ContentLibraryDetail`. Essa pagina:

1. Mostra um spinner de loading em tela cheia
2. Faz uma query separada ao banco de dados para buscar o conteudo
3. Renderiza o `UnifiedContentModal` sobre um fundo vazio (sem a biblioteca atras)
4. Ao fechar, redireciona para `/biblioteca`

Isso cria uma experiencia desconectada -- o usuario ve uma tela em branco com um modal flutuante, em vez de ver o conteudo aberto sobre a biblioteca.

## Solucao

Substituir a navegacao para `/biblioteca/{id}` por `/biblioteca?content_id={id}`. A pagina `ContentLibrary` ja tem toda a logica de modal (`selectedContent` + `UnifiedContentModal`). Basta ela ler o parametro `content_id` da URL e abrir o modal automaticamente.

## Mudancas

### 1. `src/pages/ContentLibrary.tsx`
- Ler o parametro `content_id` dos searchParams (ja usa `useSearchParams`)
- No `useEffect` inicial, se `content_id` existir, buscar o item e chamar `setSelectedContent(item)`
- Ao fechar o modal, limpar o parametro `content_id` da URL

### 2. `src/pages/Dashboard.tsx`
- Trocar `navigate(/biblioteca/${contentId})` por `navigate(/biblioteca?content_id=${contentId})`
- Trocar `navigate(/biblioteca/${data.content_id})` (YouTube) pelo mesmo padrao

### 3. `src/pages/ContentLibraryDetail.tsx`
- Simplificar para apenas redirecionar: `Navigate to="/biblioteca?content_id={id}"`
- Manter a rota `/biblioteca/:id` funcionando como redirect para nao quebrar links antigos

### 4. `src/components/content-feed/ContentFeedModal.tsx`
- Trocar `navigate(/conteudo/${uuid})` por `navigate(/biblioteca?content_id=${uuid})`

## Resultado Esperado

- Conteudo gerado abre diretamente no modal da biblioteca, com a lista de conteudos visivel atras
- Sem tela em branco, sem loading separado, sem query duplicada ao banco
- Links antigos (`/biblioteca/{id}`) continuam funcionando via redirect
- Ao fechar o modal, o usuario ja esta na biblioteca pronto para continuar

