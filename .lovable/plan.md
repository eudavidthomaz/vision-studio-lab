
# Corrigir Exibicao do Conteudo Extraido do YouTube

## Problema
A extracao do YouTube **funcionou corretamente** (status 200, conteudo salvo no banco). O problema e que a estrutura JSON retornada pela IA nao corresponde ao formato esperado pela view `ResumoPregacaoView`.

### Dados salvos (formato atual da IA)
```text
{
  "titulo": "...",
  "resumo": "texto corrido...",
  "pontos_principais": ["string1", "string2", ...],
  "versiculos_citados": ["Salmos 121"],
  "aplicacoes_praticas": ["aplicacao1", "aplicacao2"],
  "tema_central": "..."
}
```

### Formato esperado pela view
```text
{
  "titulo": "...",
  "introducao": "...",
  "pontos_principais": [
    { "numero": 1, "titulo": "Titulo", "conteudo": "Texto" }
  ],
  "conclusao": "...",
  "aplicacao_pratica": "...",
  "fundamento_biblico": {
    "versiculos": ["..."],
    "contexto": "...",
    "principio": "..."
  }
}
```

A view renderiza cards vazios porque tenta acessar `ponto.titulo` e `ponto.conteudo` em strings simples, resultando em conteudo invisivel.

## Solucao (duas frentes)

### 1. Corrigir o prompt da IA no Edge Function
Atualizar o prompt do sistema em `extract-youtube-content/index.ts` para que a IA retorne o JSON no formato exato que a view espera, com `pontos_principais` como objetos estruturados, `fundamento_biblico`, `introducao`, `conclusao`, etc.

### 2. Adicionar normalizacao de fallback na view
Atualizar `ResumoPregacaoView` para detectar e normalizar o formato simplificado (strings em `pontos_principais`, `aplicacoes_praticas` como array em vez de string, `versiculos_citados` para `fundamento_biblico.versiculos`). Isso garante compatibilidade com conteudos ja salvos no banco e com possiveis variacoes futuras da IA.

## Detalhes Tecnicos

### Arquivo 1: `supabase/functions/extract-youtube-content/index.ts`
Alterar o prompt do sistema (Step 3 - AI analysis) para solicitar a estrutura completa:
- `introducao` em vez de `resumo`
- `pontos_principais` como array de objetos `{numero, titulo, conteudo}`
- `fundamento_biblico` com `{versiculos, contexto, principio}`
- `conclusao` e `aplicacao_pratica` como strings
- `frases_impactantes` como array de strings

### Arquivo 2: `src/components/content-views/ResumoPregacaoView.tsx`
Adicionar normalizacao robusta no inicio do componente para lidar com ambos os formatos:
- Se `pontos_principais` contem strings, converter cada uma para `{numero: idx+1, titulo: "", conteudo: string}`
- Se `versiculos_citados` existe mas `fundamento_biblico` nao, mapear automaticamente
- Se `aplicacoes_praticas` (array) existe mas `aplicacao_pratica` (string) nao, concatenar
- Se `resumo` (string) existe mas `introducao` nao, usar `resumo` como `introducao`

## Arquivos Modificados

| Arquivo | Acao |
|---|---|
| `supabase/functions/extract-youtube-content/index.ts` | Corrigir prompt da IA para retornar formato compativel |
| `src/components/content-views/ResumoPregacaoView.tsx` | Adicionar normalizacao de fallback para formato simplificado |

## Resultado Esperado
- Conteudos ja salvos no banco serao exibidos corretamente
- Novos conteudos extraidos do YouTube seguirao o formato correto desde a geracao
- A view nunca mais exibira cards vazios por incompatibilidade de estrutura
