## Auditoria: UI/UX × Documentação Klap × Código real

Revisei `klap-api/index.ts`, `useKlap.tsx`, `CreateJobCard.tsx`, `JobList.tsx`, `JobProjects.tsx` e `ExportButton.tsx` contra `docs.klap.app`. Os defeitos abaixo são de paridade — corrigíveis sem mudar arquitetura.

---

### Bugs confirmados

**1. "Preview" e "Editor" abrem exatamente o mesmo destino**
Em `JobProjects.tsx:79-86`, os dois botões chamam `open(p)`, que gera **o mesmo** `create_embed_url`. A Klap não expõe dois modos distintos — o embed retornado já é o editor completo (com player). Ter dois botões idênticos é o que está confundindo o usuário.

**2. Export quebra para `video-to-video`**
`actionStartExport` (klap-api/index.ts:286-288) exige `klap_folder_id`. Mas tasks `video-to-video` retornam `output_type='project'` (sem folder) — o `klap_folder_id` fica `null` e o export devolve 400 `project_has_no_folder`. O endpoint correto para projetos avulsos (sem folder) é `/projects/{project_id}/exports` (docs Klap, seção Exports).

**3. Polling duplicado de jobs**
`useKlapJobs` já tem `refetchInterval: 15s` enquanto há `processing`. `JobList.tsx:19-22` adiciona `setInterval(20s)` chamando `refresh_task` para cada job. Resultado: 2 timers concorrentes + chamadas extras à edge function. Mantenho apenas o refresh server-side (que é o que de fato atualiza o status na Klap).

**4. URL do form é limpa antes da mutation terminar**
`CreateJobCard.tsx:43` faz `if (!start.isError) setUrl('')` **síncrono** após `mutate()` (que é fire-and-forget). No primeiro submit `isError` é sempre `false`, então a URL some mesmo se a request falhar depois. Mover para `onSuccess`.

**5. Dimensões forçadas a 9:16 mesmo no modo "Editar vídeo único"**
`CreateJobCard.tsx:40` envia `dimensions: {1080,1920}` para os dois modos. Em `video-to-video` o usuário pode querer manter o aspect original (horizontal). Enviar `dimensions` só quando `reframe` estiver ligado, ou expor seletor 9:16 / 1:1 / 16:9.

**6. Paridade de opções com a doc Klap (`video-to-shorts`)**
A doc aceita `min_duration`, `target_duration`, `max_duration`, `target_clip_count`, `max_clip_count`. A UI só expõe `target_clip_count` e `max_duration`. O backend já encaminha os demais (linhas 137-141), mas não há controles. Adicionar `min_duration` e `max_clip_count` em "Opções avançadas".

**7. Toggle "Reframe vertical" em `video-to-video`**
A Klap só aceita `reframe` na task `video-to-shorts` (gera cortes verticais). Em `video-to-video` esse toggle não tem efeito documentado. Ocultar quando `mode === 'video'`.

**8. Watermark não configurável**
`ExportButton.tsx:42` chama `start_export` sem `watermark`. O backend já aceita `{ src_url, pos_x?, pos_y?, scale? }`. Sem UI nem env default, o export sempre usa a marca d'água padrão da Klap. Não é bug, mas é gap vs. a doc. **Fora deste escopo** — registro como issue, não corrijo agora para manter o blast radius.

**9. Refresh único na linha "Pronto"**
`JobList.tsx:67-70` só mostra o botão de refresh quando `status === 'processing'`. Se um job ficou `error` por motivo transiente, não dá pra re-tentar. Adicionar refresh também em estado `error`.

---

### Mudanças propostas (cirúrgicas, frontend + 1 ajuste backend)

**`src/components/video-editor/JobProjects.tsx`**
- Remover o botão "Editor". Manter um único CTA "Abrir editor" (a UI da Klap dentro do iframe já é o editor completo, com play, trim, captions). O botão "Abrir em nova aba" já existe como fallback.
- Tooltip explicando: "Player oficial da Klap — edite cortes, legendas e baixe."

**`src/components/video-editor/CreateJobCard.tsx`**
- `setUrl('')` dentro de `onSuccess` do hook (não inline após `mutate`).
- Ocultar toggle `reframe` em `mode === 'video'`.
- Em `mode === 'video'`, não enviar `dimensions` (deixa Klap manter o aspect do source).
- Adicionar inputs `min_duration` e `max_clip_count` no bloco avançado de `shorts`.

**`src/hooks/useKlap.tsx`**
- Estender tipo de input de `useStartJob` com `min_duration` e `max_clip_count`.
- Adicionar `onSuccess` que limpa nada (deixar o componente lidar) — ou expor callback. Vou apenas tipar.

**`src/components/video-editor/JobList.tsx`**
- Remover o `setInterval` duplicado (linhas 15-24). O `refetchInterval` do `useKlapJobs` já mantém o status atualizado para o usuário; o refresh server-side será chamado explicitamente via botão e on-demand quando o usuário abre o card. Para garantir sincronia com a Klap em jobs `processing`, adiciono um único `setInterval` de 30s que chama `refresh_task` **apenas** para jobs `processing` visíveis — sem sobrepor com `refetchInterval` (que só relê do DB).
- Mostrar botão de refresh também quando `status === 'error'`.

**`supabase/functions/klap-api/index.ts`** (1 correção real de bug)
- Em `actionStartExport` e `actionRefreshExport`: se `klap_folder_id` for `null`, usar o path `/projects/${klap_project_id}/exports[/${export_id}]` em vez de retornar 400. Isso destrava export para `video-to-video`.

---

### Fora de escopo (declarado)

- UI de watermark customizada (registro como follow-up).
- Suporte a `style_preset_id` configurável (hoje hard-coded como `undefined`).
- Webhook da Klap para encerrar polling (otimização, não bug).

### Validação

1. Build TS limpo.
2. `view_preview` em `/editor-video`: confirmar que só existe um botão "Abrir editor" + "Exportar" por card de corte.
3. `curl_edge_functions` `start_export` em um `video-to-video` real: deve retornar `export` em vez de 400.
4. Network tab: confirmar 1 chamada `refresh_task` a cada 30s (não 2 timers).
5. Submeter URL inválida e verificar que o campo não some sozinho.
