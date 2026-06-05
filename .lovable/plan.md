
## Diagnóstico (provas reais)

**Banco (`klap_video_jobs`, `klap_projects`):** 2 jobs `ready`, 7 projetos persistidos corretamente, todos com `klap_folder_id` (ex.: folder `VMo7te6u`, project `IsgEZdhfmD7W`). Pipeline de criação/refresh está funcionando.

**Tabela `klap_exports`:** vazia — usuário nunca conseguiu exportar.

**Edge Function logs (`klap-api`):** sem registros recentes — provavelmente o erro ocorre no **iframe do navegador**, não no backend.

### Bugs confirmados contra a doc oficial do Klap (`docs.klap.app`)

1. **Preview = 404** — `JobProjects.tsx:67` usa `https://klap.app/player/{id}`. **Esse endpoint não existe.** A doc só documenta `https://app.klap.app/embed/{project_id}#external_access_token={token}` como player/embed. Esse é o 404 que o usuário vê.

2. **Editor nunca carrega** — `klap-api/index.ts:263` lê `tokenRes.data?.token || tokenRes.data?.access_token`. A doc diz que a resposta é `{ "external_access_token": "..." }`. Ambos os campos lidos são `undefined` → retorna `502 no_token` → modal do Editor fica em spinner infinito.

3. **Export quebrado** — `klap-api/index.ts:286` envia `{ watermark: true|false }` (boolean). A doc define `watermark` como **objeto** (`{ src_url, pos_x, pos_y, scale }`) ou ausente. Boolean causa rejeição do upstream. Além disso, a doc só define `POST /projects/{folder_id}/{project_id}/exports` (sempre com folder); o branch sem folder no código é morto/errado.

4. **Refresh de `video-to-video`** — `klap-api/index.ts:220` faz `GET /projects/{outputId}` para projeto único, mas a doc define `GET /projects/{folder_id}/{project_id}` para buscar projeto, e `GET /projects/{folder_id}` retorna **array**. Para `video-to-video` o output é `media` (não folder); endpoint correto é diferente. Em modo `shorts` o branch de folder está correto (retorna array).

5. **Coluna `watermark` no DB é `boolean NOT NULL DEFAULT true`** — precisa virar `jsonb` nullable (ou simplesmente armazenar flag de presença).

---

## Plano de correção (escopo cirúrgico, apenas módulo Klap)

### A. Backend — `supabase/functions/klap-api/index.ts`

1. **`actionCreateEmbedUrl`**: trocar leitura para `tokenRes.data?.external_access_token`. Manter fallback para `token` apenas como defensivo.
2. **`actionStartExport`**:
   - Exigir `klap_folder_id` (rejeitar projetos sem folder por enquanto, já que v2 só documenta esse caminho).
   - Aceitar `watermark?: { src_url, pos_x?, pos_y?, scale? }` (objeto). Padrão: omitir → Klap aplica watermark gratuito padrão dele.
   - Persistir `watermark` como `jsonb` (presença/objeto).
3. **`actionRefreshTask`** para `output_type === 'project'`: usar `GET /projects/{output_id}` apenas se Klap retornar objeto; caso contrário, tratar como `media` e gravar `klap_project_id = output_id` sem chamar endpoint inexistente. (Para v1 do usuário, o fluxo principal é `shorts` que já funciona — `video-to-video` fica em modo defensivo.)

### B. Banco — nova migration

```sql
ALTER TABLE public.klap_exports
  ALTER COLUMN watermark DROP NOT NULL,
  ALTER COLUMN watermark DROP DEFAULT,
  ALTER COLUMN watermark TYPE jsonb USING
    CASE WHEN watermark THEN '{}'::jsonb ELSE NULL END;
```

Sem mudanças em RLS, grants ou outras tabelas.

### C. Frontend

1. **`JobProjects.tsx`** (Preview):
   - Substituir `https://klap.app/player/{id}` (404) pelo **mesmo embed autenticado** (`app.klap.app/embed/...#external_access_token=...`) reutilizando `useCreateEmbedUrl`.
   - Mostrar spinner enquanto token é gerado; mensagem de erro clara se falhar.
2. **`ExportButton.tsx`** + `useKlap.tsx`:
   - Remover prop `watermark: boolean`. Por padrão não enviar; opcionalmente expor um campo avançado para `watermark` como objeto (fora do escopo v1 — apenas tipo no hook).
3. Tipos do `KlapExport` em `useKlap.tsx`: `watermark: Record<string, unknown> | null`.

### D. Verificação após o build

1. `supabase--curl_edge_functions` chamando `create_embed_url` com um `klap_project_id` real do banco → confirmar retorno de `embed_url`.
2. `supabase--curl_edge_functions` chamando `start_export` com folder real → confirmar 200 e linha em `klap_exports`.
3. `supabase--edge_function_logs klap-api` para confirmar ausência de erros 502.
4. Browser test em `/editor-video`: abrir Preview e Editor de um corte existente, validar iframe carregando sem 404.

### Arquivos que serão alterados

- `supabase/functions/klap-api/index.ts`
- `supabase/migrations/<novo>.sql` (apenas `klap_exports.watermark`)
- `src/components/video-editor/JobProjects.tsx`
- `src/components/video-editor/ExportButton.tsx`
- `src/hooks/useKlap.tsx`

### Fora de escopo (não tocar)

- Outras Edge Functions, outras tabelas, roles, quotas, RLS de outros recursos, bucket `videos`, fluxo de upload.

### Riscos

- Nenhum impacto em usuários fora do allowlist (gate continua igual).
- Migration é não-destrutiva: converte boolean→jsonb mantendo semântica (true → `{}`, false → `NULL`). `klap_exports` está vazia hoje, então conversão é trivial.
- Sem alteração em endpoints já validados (`start_video_to_shorts`, `refresh_task` no caminho `folder`).
