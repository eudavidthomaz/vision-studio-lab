## Diagnóstico

A URL gerada pelo edge function está correta conforme `docs.klap.app/usecases/managed-users` §4:
`https://app.klap.app/embed/{project_id}#external_access_token={token}` — verificado em `supabase/functions/klap-api/index.ts:269` retornando 200 OK com token válido.

O iframe carrega (session replay confirma o nó `<iframe title="Klap">` montado) mas renderiza tela branca. Causa mais provável: o atributo `sandbox` em `src/components/video-editor/JobProjects.tsx:81` está bloqueando recursos que o SPA do Klap precisa (storage cross-origin, popups de auth, workers). Combinar `allow-same-origin` + `allow-scripts` num documento de outra origem é uma configuração que vários navegadores tratam como suspeita e que quebra apps SPA que dependem de IndexedDB/Service Worker.

Minha correção anterior foi incompleta porque assumi que o `sandbox` seria neutro para o embed do Klap — não é; o embed é uma aplicação completa e não tolera sandbox restritivo.

## Mudanças

**Único arquivo:** `src/components/video-editor/JobProjects.tsx`

1. Remover o atributo `sandbox` do `<iframe>` (manter apenas `allow="clipboard-write; autoplay; fullscreen; encrypted-media"` e `referrerPolicy="no-referrer-when-downgrade"`).
2. Adicionar `allowFullScreen` e `loading="eager"`.
3. Adicionar botão "Abrir em nova aba" no header do `DialogContent` que faz `window.open(embedUrl, '_blank', 'noopener')` — fallback garantido caso o navegador do usuário bloqueie o embed por política de terceiros (Safari ITP, Brave, etc.).
4. Adicionar `<DialogDescription>` (corrige o warning de acessibilidade já presente no console).
5. Após 8 s sem evento `load` no iframe, exibir banner discreto sugerindo o fallback de nova aba (sem trocar a UI, só um aviso).

## Validação

- Verificar no preview real: clicar Preview → iframe deve renderizar o player do Klap dentro de 2–3 s.
- Se persistir branco, o botão "Abrir em nova aba" prova que a URL é válida e isola o problema como restrição de embedding do navegador, não do app.

## Fora de escopo

Nenhuma mudança em edge function, banco, hooks ou export. Apenas o componente do modal de preview.