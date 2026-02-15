

# Corrigir Falha na Inserção de Conteúdo do YouTube

## O que aconteceu

As duas tentativas de extração do vídeo "Culto Matutino 08/02 - Neemias e Esdra (Recomeçar)" seguiram este caminho:

1. Transcrição extraída com sucesso via Gemini (9716 e 11939 caracteres)
2. Transcrição salva na tabela de sermões com sucesso
3. Chamada à IA para gerar análise estruturada
4. A IA retornou resposta sem conteúdo utilizável (`parsedContent` ficou `null`)
5. Tentativa de inserir `content: null` na tabela `content_library` falhou (coluna não aceita nulo)
6. A função retornou status 200 com `content_id: null`, mas o frontend não mostrou erro

## Causa raiz

Há uma falha lógica no código: quando a resposta da IA não contém conteúdo válido (`choices[0].message.content` é `null` ou `undefined`), a variável `parsedContent` nunca é atribuída e permanece `null`. O fallback existente só cobre dois cenários (IA retorna texto não-JSON, e IA retorna erro HTTP), mas não cobre o caso de resposta vazia.

## Correções

### 1. Edge Function (`supabase/functions/extract-youtube-content/index.ts`)

- Adicionar verificação explícita: se `parsedContent` for `null` após todo o processamento da IA, criar um objeto de fallback com os dados que já temos (título, tema extraído do YouTube)
- Garantir que `content` nunca será `null` na inserção
- Melhorar o log para identificar exatamente por que a IA retornou vazio

### 2. Frontend - Tratamento do caso `content_id: null`

- No callback de sucesso da extração do YouTube (Dashboard.tsx ou YouTubeTranscriptModal.tsx), verificar se `content_id` é `null`
- Se for `null`, mostrar mensagem informando que a transcrição foi salva mas a análise falhou, com opção de tentar novamente
- Nunca fechar o modal silenciosamente sem feedback

## Detalhes técnicos

### Edge Function - Garantir fallback final

Após toda a lógica de análise da IA (linha ~510), adicionar verificação:

```text
Se parsedContent ainda for null:
  parsedContent = {
    titulo: videoTitle,
    introducao: "Análise automática não disponível. Transcrição salva com sucesso.",
    pontos_principais: [],
    conclusao: "",
    aplicacao_pratica: "",
    fundamento_biblico: { versiculos: [], contexto: "", principio: "" },
    frases_impactantes: [],
    tema_central: "Extraído do YouTube"
  }
```

Isso garante que a inserção na `content_library` nunca receberá `null`.

### Frontend - Feedback ao usuário

No callback de sucesso, verificar `content_id`:
- Se presente: navegar para o conteúdo normalmente
- Se `null`: exibir toast informando "Transcrição salva, mas a análise precisa ser refeita" e navegar para a lista de sermões

## Arquivos a modificar

| Arquivo | Mudança |
|---|---|
| `supabase/functions/extract-youtube-content/index.ts` | Adicionar fallback final para `parsedContent` null antes da inserção |
| `src/components/YouTubeTranscriptModal.tsx` ou `src/pages/Dashboard.tsx` | Tratar resposta com `content_id: null` mostrando feedback ao usuário |

