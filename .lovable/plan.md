## Causa raiz comprovada

O iframe fica em branco / mostra "não foi possível encontrar o IP" porque o host documentado pela Klap (`app.klap.app`) **está fora do ar em produção**. Provas:

- DNS de `app.klap.app` aponta para `ghs.googlehosted.com` (Google Sites), não para o app Next.js da Klap.
- `curl -I https://app.klap.app/` e `curl -I https://app.klap.app/embed/L30jhjrUhfIA` retornam **zero bytes** (handshake TLS sem resposta).
- Já `https://klap.app/embed/L30jhjrUhfIA` retorna **HTTP/2 200** com o HTML real do player Next.js da Klap (mesma SPA, com os chunks `_next/...`).
- Token gerado pela edge function `create_embed_url` está correto e válido: a response da `POST /functions/v1/klap-api` traz `embed_url` com `#external_access_token=...`. O backend está OK — o problema é puramente o **host** da URL.

Minha correção anterior foi incompleta porque segui literalmente a doc `docs.klap.app/usecases/managed-users` (`https://app.klap.app/embed/{id}#external_access_token=...`), sem validar que esse subdomínio está realmente servindo conteúdo. A documentação da Klap está desatualizada — o player atual da plataforma roda em `klap.app` (sem subdomínio).

## Correção

Mudança cirúrgica, 1 linha de código + 1 fallback de env:

### `supabase/functions/klap-api/index.ts`

1. Adicionar (perto do topo, junto de `KLAP_BASE`):
   ```ts
   const KLAP_EMBED_BASE = Deno.env.get('KLAP_EMBED_BASE_URL') || 'https://klap.app';
   ```
2. Em `actionCreateEmbedUrl` (linha 269), trocar:
   ```ts
   const embed_url = `https://app.klap.app/embed/${project.klap_project_id}#external_access_token=${token}`;
   ```
   por:
   ```ts
   const embed_url = `${KLAP_EMBED_BASE}/embed/${project.klap_project_id}#external_access_token=${token}`;
   ```

Sem mudanças no frontend, no banco, nas RLS, no fluxo de export, no `JobProjects.tsx`. Sem migração.

## Validação

1. Redeploy automático da função `klap-api`.
2. Testar `create_embed_url` via `supabase--curl_edge_functions` e conferir que `embed_url` agora começa com `https://klap.app/embed/...`.
3. Validar via browser real (`view_preview`) clicando em "Preview" — o iframe deve carregar o player. Tirar screenshot como prova.
4. Se ainda houver tela branca após a troca, a causa será outra (CSP / X-Frame-Options), e nesse caso o botão "Abrir em nova aba" já existente serve de fallback imediato, sem nova correção especulativa.

## Fora de escopo (intencional)

Os outros bugs do audit (export de `video-to-video`, watermark jsonb, dual timers, etc.) **não bloqueiam** o que o usuário relatou ("preview e editor não funcionam"). Não vou tocá-los nesta correção para manter o blast radius mínimo. Posso abrir issues separadas depois, se você quiser.
