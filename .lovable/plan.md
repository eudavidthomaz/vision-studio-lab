
# Klap — Plano Duplamente Revisado (com provas)

## 0. Auditoria do código atual (provas)

Fontes verificadas agora (não cache):

| Camada | Achado | Prova |
|---|---|---|
| Edge Functions | 31 funções, padrão `index.ts` único, helper `_shared/security.ts` com `createAuthenticatedClient`, `validateInput`, `checkRateLimit`, `logSecurityEvent`, `sanitizeText`. CORS inline. | `ls supabase/functions` + leitura de `_shared/security.ts` |
| config.toml | Todas as funções autenticadas usam `verify_jwt = true`; webhooks/links públicos usam `false`. Vou seguir o mesmo padrão. | `cat supabase/config.toml` |
| Roles | enum `app_role = {free, pro, team, admin}`. **Não existe `business` ainda.** | `SELECT enum_range(NULL::app_role)` |
| Quotas | `usage_quotas(images_generated, transcriptions_used, live_captures_used)` + `check_quota/increment_quota` em SQL. Não há coluna de vídeo. | schema dump + `useQuota.tsx` |
| RLS padrão | `auth.uid() = user_id` em todas as tabelas do domínio. `has_role(uid, role)` security definer. | dump de policies de `content_library`, `volunteers`, etc. |
| Storage | Buckets: `post-images` (pub), `sermons` (priv), `videos` (priv, **0 policies**), `church-site-assets` (pub). | `SELECT * FROM storage.buckets` + `pg_policies` |
| Frontend | Rotas eager em `src/App.tsx`. Hooks chamam edge via `useSecureApi` que trata `rate_limit_error`/`validation_error`. Subscription role vem de `useSubscription` (`free|pro|team|admin`). | `src/App.tsx`, `useSecureApi.tsx`, `useSubscription.tsx` |
| Klap | Zero referências (`grep -rn "klap" → vazio`). Greenfield, sem risco de colisão. | grep |

**Implicações que mudam o plano original:**

1. **Bucket `videos` não tem policies** — qualquer fluxo de upload do cliente quebraria silenciosamente. **Decisão:** v1 sem upload. Usuário cola URL pública (YouTube ou MP4 hospedado), exatamente como Klap espera. Nada no fluxo atual é tocado.
2. **Não existe role `business`** — não vou criar ainda (ALTER TYPE é arriscado e só vale a pena quando o plano for cobrar). Gating v1 = **allowlist por email**, hardcoded no edge (env `KLAP_ALLOWED_EMAILS`). Quando o Business existir, troco a checagem para `has_role(uid, 'business')` em uma migration isolada.
3. **Quotas em SQL** — adicionar `videos_processed` em `usage_quotas` e estender `check_quota`/`increment_quota` para `'videos'` é não-destrutivo (ADD COLUMN com default 0 + CREATE OR REPLACE FUNCTION). Mas v1 só você usa → vou **adiar essa mudança** e contar uso só na tabela `klap_video_jobs` (`SELECT count(*) WHERE user_id=$1 AND created_at > date_trunc('month', now())`). Zero risco para fluxos existentes.
4. **`useSecureApi` é o canal canônico** — vou reaproveitar 100%, sem criar um cliente paralelo.

---

## 1. Escopo travado

- **Quem pode usar v1:** apenas `contato@ligadafotografia.com.br` (allowlist server-side).
- **O que NÃO faço agora:** criar plano Business, ALTER TYPE app_role, mexer em `usage_quotas`, criar policies em `storage.videos`, alterar `Pricing.tsx`, alterar `Dashboard.tsx`.
- **O que faço:** 4 tabelas novas + 1 edge function nova + 1 rota nova + componentes em pasta nova. Nada mais.

---

## 2. Backend

### 2.1 Secrets
- `KLAP_API_KEY` (via `secrets--add_secret`, exige sua confirmação).
- `KLAP_API_BASE_URL` (opcional, default em código = `https://api.klap.app/v2`). Se você não setar, uso o default; se setar, sobrescreve.
- `KLAP_ALLOWED_EMAILS` (opcional, CSV. Se ausente, fallback hardcoded = `contato@ligadafotografia.com.br`).

### 2.2 Migration (única, aditiva, sem destrutivos)

```sql
-- 1. Tabelas
CREATE TABLE public.klap_users (
  user_id UUID PRIMARY KEY,
  klap_user_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.klap_video_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('video-to-shorts','video-to-video')),
  source_video_url TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '{}'::jsonb,
  klap_task_id TEXT,
  task_status TEXT NOT NULL DEFAULT 'processing',
  output_type TEXT,  -- 'folder' | 'project' | null
  output_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.klap_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.klap_video_jobs(id) ON DELETE CASCADE,
  klap_project_id TEXT NOT NULL,
  klap_folder_id TEXT,
  name TEXT,
  virality_score NUMERIC,
  virality_score_explanation TEXT,
  duration NUMERIC,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, klap_project_id)
);

CREATE TABLE public.klap_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES public.klap_projects(id) ON DELETE CASCADE,
  klap_export_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  src_url TEXT,
  watermark BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);

-- 2. GRANTs (obrigatórios — todas auth-only, sem anon)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.klap_users     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.klap_video_jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.klap_projects   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.klap_exports    TO authenticated;
GRANT ALL ON public.klap_users, public.klap_video_jobs, public.klap_projects, public.klap_exports TO service_role;

-- 3. RLS (owner-only, espelha padrão do projeto)
ALTER TABLE public.klap_users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.klap_video_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.klap_projects   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.klap_exports    ENABLE ROW LEVEL SECURITY;

-- klap_users: dono lê o próprio; writes só via service role (edge function)
CREATE POLICY "klap_users self read" ON public.klap_users
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- klap_video_jobs / klap_projects / klap_exports: dono CRUD
CREATE POLICY "klap_jobs owner" ON public.klap_video_jobs
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "klap_projects owner" ON public.klap_projects
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "klap_exports owner" ON public.klap_exports
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Índices
CREATE INDEX klap_jobs_user_created_idx     ON public.klap_video_jobs(user_id, created_at DESC);
CREATE INDEX klap_projects_user_job_idx     ON public.klap_projects(user_id, job_id);
CREATE INDEX klap_exports_user_project_idx  ON public.klap_exports(user_id, project_id);

-- 5. Trigger de updated_at (reaproveita função existente public.update_updated_at_column)
CREATE TRIGGER klap_jobs_updated_at     BEFORE UPDATE ON public.klap_video_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER klap_projects_updated_at BEFORE UPDATE ON public.klap_projects   FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

Zero `ALTER` em tabelas existentes. Zero `DROP`. Zero mudança em funções existentes. Migration 100% aditiva.

### 2.3 Edge function: `klap-api` (router por `action`)

`supabase/functions/klap-api/index.ts` + bloco `verify_jwt = true` em `supabase/config.toml` (acréscimo, não substituição).

Padrões obrigatórios (espelhando `generate-video-script/index.ts` que já está em produção):
- `createAuthenticatedClient(req)` → `userId`. Sem userId → 401.
- **Allowlist** logo após auth: lê `KLAP_ALLOWED_EMAILS` (CSV) ou usa default `['contato@ligadafotografia.com.br']`. Email vem do JWT (`getClaims`) — não confio em payload do cliente. Não-allowlisted → 403 `feature_not_enabled`.
- `validateInput` para cada campo (Zod-style, igual ao restante do projeto).
- `checkRateLimit` com novo entry `'klap-api': { max: 60, windowMinutes: 60 }` em `_shared/security.ts` (adição segura — leitura confirmou que `RATE_LIMITS` é um map e nada explode com chave nova).
- `logSecurityEvent` em sucesso/erro. **Nunca logar** `KLAP_API_KEY`, `external_access_token`, `src_url` completa (loggar só hash/sufixo).
- Chamada Klap: `fetch(BASE_URL + path, { headers: { Authorization: 'Bearer '+key, 'X-On-Behalf-Of': klap_user_id, 'Content-Type': 'application/json' } })`.
- Toda gravação no DB usa o client autenticado (RLS valida) — service role só seria necessário se algum dia tivermos webhook.

**Actions (body `{ action, ...params }`):**

| action | Klap call | DB |
|---|---|---|
| `ensure_managed_user` | `POST /users` (se não existir em `klap_users`) | upsert `klap_users` |
| `start_video_to_shorts` | `POST /tasks/video-to-shorts` | insert `klap_video_jobs(job_type='video-to-shorts')` |
| `start_video_to_video` | `POST /tasks/video-to-video` | insert `klap_video_jobs(job_type='video-to-video')` |
| `refresh_task` | `GET /tasks/{task_id}` (+ `GET /projects/{folder_id}` ou `/projects/{project_id}` quando ready) | update job + upsert `klap_projects` |
| `create_embed_url` | `POST /users/{klap_user_id}/tokens` | **não persiste token**; retorna `embed_url` derivada |
| `start_export` | `POST /projects/{folder_id}/{project_id}/exports` (se houver folder) ou `POST /projects/{project_id}/exports` | insert `klap_exports` |
| `refresh_export` | `GET .../exports/{export_id}` (path coerente com presença de folder) | update `klap_exports` |

Validação de ownership em todas as actions que recebem id: `SELECT 1 FROM klap_projects WHERE id=$1 AND user_id=$uid` (RLS já garante; consulta explícita para retornar 404 amigável).

### 2.4 Erros tratados
- 401 `Unauthorized` (sem JWT).
- 403 `feature_not_enabled` (não está na allowlist).
- 400 `validation_error` (zod).
- 429 `rate_limit_error`.
- 502 `klap_upstream_error` com `{ error: <mensagem segura>, status }` — payload bruto do Klap só vai para `logSecurityEvent.metadata` (não para o cliente).

### 2.5 Testes (Deno `*_test.ts` em `supabase/functions/klap-api/`)
Cobrem:
- a) sem Authorization → 401
- b) email fora da allowlist → 403
- c) `source_video_url` inválida → 400
- d) usuário A não enxerga job de B (mock duas sessões)
- e) `start_export` escolhe path com/sem folder corretamente (mock do fetch)
- f) `create_embed_url` não persiste token (verifica que nenhuma tabela contém o token retornado)

Mocks via `globalThis.fetch` patch para não bater no Klap real.

---

## 3. Frontend

### 3.1 Rota nova (única alteração em arquivo existente)
`src/App.tsx`: adicionar **uma** linha de rota `/editor-video` + 1 import eager. Sem mexer em layout/Dashboard/Pricing.

### 3.2 Arquivos novos
```
src/pages/VideoEditor.tsx
src/hooks/useKlap.tsx
src/components/video-editor/CreateJobCard.tsx
src/components/video-editor/JobList.tsx
src/components/video-editor/ProjectCard.tsx
src/components/video-editor/KlapEmbedDialog.tsx
src/components/video-editor/ExportButton.tsx
```

### 3.3 Hook `useKlap`
- Wrapper de `useSecureApi.invokeFunction('klap-api', { action, ... })`.
- Queries com React Query:
  - `useJobs()` — `select * from klap_video_jobs order by created_at desc` (RLS filtra).
  - `useProjects(jobId)` — `select * from klap_projects where job_id = $1`.
  - `useExports(projectId)` — `select * from klap_exports where project_id = $1`.
- **Polling adaptativo**: `refetchInterval: data => data?.some(j => j.task_status==='processing') ? 15000 : false`. Backoff: depois de 5 min, aumenta para 30s.
- Mutations: `startShorts`, `startVideo`, `refreshTask`, `createEmbedUrl`, `startExport`, `refreshExport`.

### 3.4 UI (alinhada à Sugestão 2, com correções)
- **Card de criação**: input URL, select modo, idioma (default `auto`), opções avançadas em `Collapsible`. Validação client com Zod: URL https, max 2048 chars; `transcription_context` max 1000.
- **Lista de jobs**: badges `processing/ready/error`. Linha clicável expande projetos.
- **Card de projeto**: nome, `virality_score` (Progress + tooltip com explanation), botões Preview / Editor / Exportar.
- **Preview**: iframe `https://klap.app/player/{project_id}` em `<Dialog>` responsivo.
- **Editor**: chama `create_embed_url` on click → guarda token só em state local (nunca localStorage) → monta iframe com `sandbox="allow-scripts allow-same-origin allow-forms allow-popups"`.
- **Exports**: polling 15s enquanto processing. Botão "Baixar" abre `src_url` em nova aba (rel=noopener).
- **Empty states + skeletons** seguindo o design system existente (glass cards, neon button para primária).
- **Mobile**: `dvh`, safe-area, sheets para modais < md.
- **Gating UI**: a página verifica `user.email === allowed` ANTES de renderizar; se não, mostra "Em breve" + link para `/pricing`. (Backend continua sendo a verdade — UI só evita ruído.)

### 3.5 O que **não** mostro
- Nenhum log de token/URL sensível.
- `console.error` filtra `KLAP_API_KEY` e `external_access_token` antes de imprimir.
- Toasts genéricos ("Erro ao processar vídeo. Tente novamente.").

---

## 4. Auditoria final (Sugestão 3) — como vou provar

Ao terminar a implementação:
1. `rg -i "api\.klap\.app|api\.klap\.video" src/` → deve retornar vazio.
2. `rg -i "KLAP_API_KEY" src/ public/` → deve retornar vazio.
3. `rg -i "external_access_token" src/` → só em comentários ou no nome do campo do hook.
4. `supabase--linter` → 0 erros novos relacionados às 4 tabelas.
5. `supabase--curl_edge_functions` rodando:
   - sem auth → 401 ✓
   - com auth não-allowlist → 403 ✓
   - com seu auth + URL válida → 200 + job criado ✓
6. `security--run_security_scan` → revisar achados, todos owner-only.
7. Browser test do fluxo: criar job → polling → preview → embed → export.

Relatório final entregue com: arquivos alterados, tabelas criadas, edge function criada, testes executados, achados de segurança, pendências.

---

## 5. Arquivos / mudanças (lista fechada)

**Novos (10):**
- `supabase/migrations/<ts>_klap_integration.sql`
- `supabase/functions/klap-api/index.ts`
- `supabase/functions/klap-api/deno.json`
- `supabase/functions/klap-api/index_test.ts`
- `src/pages/VideoEditor.tsx`
- `src/hooks/useKlap.tsx`
- `src/components/video-editor/CreateJobCard.tsx`
- `src/components/video-editor/JobList.tsx`
- `src/components/video-editor/ProjectCard.tsx`
- `src/components/video-editor/KlapEmbedDialog.tsx`
- `src/components/video-editor/ExportButton.tsx`

**Alterados (mínimo cirúrgico, 2 arquivos):**
- `supabase/config.toml` — append `[functions.klap-api]` com `verify_jwt = true`. Não toca em outras entradas.
- `supabase/functions/_shared/security.ts` — adiciona 1 entry no map `RATE_LIMITS`. Nenhuma assinatura mudada.
- `src/App.tsx` — 1 import + 1 `<Route>`. Nada removido.

**Secrets:**
- `KLAP_API_KEY` (obrigatório, via add_secret).
- `KLAP_ALLOWED_EMAILS` (opcional).
- `KLAP_API_BASE_URL` (opcional).

---

## 6. Garantias de não-regressão (provadas)

- Nenhuma migration toca em `subscriptions`, `user_roles`, `usage_quotas`, `profiles`, `content_library`, storage. Confirmado pela diff acima.
- Não adiciono valores ao enum `app_role` (evita problema futuro de remoção).
- `_shared/security.ts`: mudança é só `RATE_LIMITS['klap-api'] = {...}` — função `checkRateLimit` já trata `undefined` com `console.warn`, então outras funções não quebram.
- `supabase/config.toml`: anexo de bloco novo é compatível (verificado pelo padrão atual com 31 funções).
- `src/App.tsx`: rota nova não conflita com nenhum path existente (`grep` confirma).
- Sem token em localStorage → não interfere com cache da `useSubscription` (que já faz `queryClient.clear()` no SIGNED_OUT).

---

## 7. Perguntas antes de eu entrar em build mode

1. **Allowlist por email** confirma como gating v1 (vs. promover você a `admin`)? Recomendo allowlist para isolar a feature sem alterar seu role.
2. **Sem upload de arquivo na v1** — só URL pública (YouTube/MP4). Confirma? (Permite reaproveitar bucket `videos` depois, sem urgência.)
3. **Sem webhooks na v1**, polling 15s adaptativo. Confirma?
4. Posso pedir o secret `KLAP_API_KEY` assim que entrarmos em build mode?

Aprovando essas 4, executo migration → edge function → testes → frontend → auditoria final, nessa ordem, com checkpoint em cada etapa.
