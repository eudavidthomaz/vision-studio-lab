// Klap API router (action-based). All actions require auth + allowlist.
// Never logs secrets, tokens, or full source URLs.
import {
  createAuthenticatedClient,
  validateInput,
  checkRateLimit,
  logSecurityEvent,
  ValidationError,
  RateLimitError,
} from '../_shared/security.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const KLAP_BASE = Deno.env.get('KLAP_API_BASE_URL') || 'https://api.klap.app/v2';
const KLAP_KEY = Deno.env.get('KLAP_API_KEY') || '';
const ALLOWED_EMAILS = (Deno.env.get('KLAP_ALLOWED_EMAILS') ||
  'contato@ligadafotografia.com.br')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split('.')[1];
  if (!payload) throw new Error('missing_payload');
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return JSON.parse(atob(padded));
}

function getEmailFromToken(req: Request): string | null {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const payload = decodeJwtPayload(token);
    return (payload.email as string | undefined)?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

type KlapResponse = { ok: boolean; status: number; data: any; message: string | null };

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value;
  }
  return null;
}

function getPayloadObject(data: any): any {
  return data?.data && typeof data.data === 'object' ? data.data : data;
}

function getKlapMessage(data: any): string | null {
  return firstString(data?.error, data?.message, data?.detail, data?.description, data?.descriptions);
}

async function klapFetch(
  path: string,
  init: RequestInit,
  klapUserId?: string,
): Promise<KlapResponse> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${KLAP_KEY}`,
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (klapUserId) headers['X-On-Behalf-Of'] = klapUserId;

  const res = await fetch(`${KLAP_BASE}${path}`, { ...init, headers });
  const text = await res.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text.slice(0, 300) };
    }
  }
  return { ok: res.ok, status: res.status, data, message: getKlapMessage(data) };
}

async function ensureKlapUser(supabase: any, userId: string): Promise<string> {
  const { data: existing } = await supabase
    .from('klap_users')
    .select('klap_user_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (existing?.klap_user_id) return existing.klap_user_id;

  const created = await klapFetch('/users', { method: 'POST', body: JSON.stringify({}) });
  if (!created.ok) {
    throw new Error(`klap_user_create_failed:${created.status}`);
  }
  const klapUserId = created.data?.id || created.data?.user_id;
  if (!klapUserId) throw new Error('klap_user_create_no_id');

  const { error: upErr } = await supabase
    .from('klap_users')
    .upsert({ user_id: userId, klap_user_id: klapUserId });
  if (upErr) throw new Error(`db_upsert_klap_user:${upErr.message}`);
  return klapUserId;
}

function createKlapProjectExportPath(projectId: string, folderId?: string | null, exportId?: string | null): string {
  const projectPathId = encodeURIComponent(projectId);
  const base = folderId
    ? `/projects/${encodeURIComponent(folderId)}/${projectPathId}/exports`
    : `/projects/${projectPathId}/exports`;
  return exportId ? `${base}/${encodeURIComponent(exportId)}` : base;
}

function extractFolderId(project: any): string | null {
  return firstString(project?.klap_folder_id, project?.folder_id, project?.folderId, project?.raw?.folder_id, project?.raw?.folderId);
}

function extractKlapProjectId(project: any): string | null {
  return firstString(project?.klap_project_id, project?.project_id, project?.projectId, project?.id);
}

async function resolveFolderId(ctx: Ctx, klapUserId: string, project: any): Promise<string | null> {
  const existingFolderId = extractFolderId(project);
  if (existingFolderId) return existingFolderId;

  const klapProjectId = extractKlapProjectId(project);
  if (!klapProjectId) return null;

  const projectRes = await klapFetch(`/projects/${encodeURIComponent(klapProjectId)}`, { method: 'GET' }, klapUserId);
  const projectData = getPayloadObject(projectRes.data);
  const resolvedFolderId = extractFolderId(projectData);
  if (projectRes.ok && resolvedFolderId && project?.id) {
    await ctx.supabase
      .from('klap_projects')
      .update({ klap_folder_id: resolvedFolderId })
      .eq('id', project.id)
      .eq('user_id', ctx.userId);
  }
  return resolvedFolderId;
}

function extractToken(data: any): string | null {
  const payload = getPayloadObject(data);
  return firstString(
    payload?.external_access_token,
    payload?.externalAccessToken,
    payload?.access_token,
    payload?.accessToken,
    payload?.token,
  );
}

function extractExport(data: any): any {
  return data?.export && typeof data.export === 'object' ? data.export : getPayloadObject(data);
}

function extractProjects(data: any): any[] {
  if (Array.isArray(data)) return data;
  const payload = getPayloadObject(data);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.projects)) return payload.projects;
  return [];
}

interface Ctx {
  supabase: any;
  userId: string;
  email: string;
}

async function actionEnsureManagedUser({ supabase, userId }: Ctx) {
  const klapUserId = await ensureKlapUser(supabase, userId);
  return json({ klap_user_id: klapUserId });
}

async function startTask(ctx: Ctx, body: any, type: 'video-to-shorts' | 'video-to-video') {
  validateInput('source_video_url', {
    value: body.source_video_url,
    type: 'string',
    required: true,
    minLength: 8,
    maxLength: 2048,
    pattern: /^https:\/\/.+/i,
  });
  if (body.transcription_context) {
    validateInput('transcription_context', {
      value: body.transcription_context,
      type: 'string',
      maxLength: 1000,
    });
  }

  const klapUserId = await ensureKlapUser(ctx.supabase, ctx.userId);

  const payload: Record<string, unknown> = {
    source_video_url: body.source_video_url,
    language: body.language ?? 'auto',
    editing_options: body.editing_options ?? undefined,
    dimensions: body.dimensions ?? undefined,
    style_preset_id: body.style_preset_id ?? undefined,
    transcription_context: body.transcription_context ?? undefined,
  };
  if (type === 'video-to-shorts') {
    payload.target_clip_count = body.target_clip_count;
    payload.max_clip_count = body.max_clip_count;
    payload.min_duration = body.min_duration;
    payload.max_duration = body.max_duration;
    payload.target_duration = body.target_duration;
  }

  const klap = await klapFetch(`/tasks/${type}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, klapUserId);

  if (!klap.ok) {
    await logSecurityEvent(ctx.supabase, ctx.userId, 'klap_task_create_failed', 'klap-api', false, `status:${klap.status}`, { type });
    return json({ error: 'klap_upstream_error', status: klap.status, success: false }, 502);
  }

  const taskData = getPayloadObject(klap.data);
  const taskId = firstString(taskData?.id, taskData?.task_id, taskData?.taskId);
  const { data: jobRow, error: jobErr } = await ctx.supabase
    .from('klap_video_jobs')
    .insert({
      user_id: ctx.userId,
      job_type: type,
      source_video_url: body.source_video_url,
      options: payload,
      klap_task_id: taskId,
      task_status: firstString(taskData?.status) || 'processing',
    })
    .select()
    .single();

  if (jobErr) throw new Error(`db_insert_job:${jobErr.message}`);
  return json({ job: jobRow });
}

async function actionRefreshTask(ctx: Ctx, body: any) {
  validateInput('job_id', { value: body.job_id, type: 'string', required: true });
  const { data: job } = await ctx.supabase
    .from('klap_video_jobs')
    .select('*')
    .eq('id', body.job_id)
    .eq('user_id', ctx.userId)
    .maybeSingle();
  if (!job) return json({ error: 'not_found', success: false }, 404);
  if (!job.klap_task_id) return json({ job });

  const klapUserId = await ensureKlapUser(ctx.supabase, ctx.userId);
  const taskRes = await klapFetch(`/tasks/${job.klap_task_id}`, { method: 'GET' }, klapUserId);
  if (!taskRes.ok) {
    return json({ error: 'klap_upstream_error', status: taskRes.status, success: false }, 502);
  }
  const taskData = getPayloadObject(taskRes.data);
  const status = firstString(taskData?.status) || 'processing';
  const outputType = taskData?.output_type ?? taskData?.outputType ?? (job.job_type === 'video-to-shorts' ? 'folder' : 'project');
  const outputId = firstString(taskData?.output_id, taskData?.outputId, taskData?.project_id, taskData?.projectId) ?? null;

  await ctx.supabase
    .from('klap_video_jobs')
    .update({
      task_status: status,
      output_type: outputType,
      output_id: outputId,
      error_message: status === 'error' ? (getKlapMessage(taskData) || 'unknown') : null,
    })
    .eq('id', job.id)
    .eq('user_id', ctx.userId);

  // If ready, fetch projects to persist
  if (status === 'ready' && outputId) {
    if (outputType === 'folder') {
      const folderRes = await klapFetch(`/projects/${outputId}`, { method: 'GET' }, klapUserId);
      const folderProjects = extractProjects(folderRes.data);
      if (folderRes.ok && folderProjects.length > 0) {
        for (const p of folderProjects) {
          if (!p?.id) continue;
          await ctx.supabase.from('klap_projects').upsert({
            user_id: ctx.userId,
            job_id: job.id,
            klap_project_id: p.id,
            klap_folder_id: outputId,
            name: p.name ?? null,
            virality_score: p.virality_score ?? null,
            virality_score_explanation: p.virality_score_explanation ?? null,
            duration: p.duration ?? null,
            raw: p,
          }, { onConflict: 'user_id,klap_project_id' });
        }
      }
    } else if (outputType === 'project') {
      const pRes = await klapFetch(`/projects/${outputId}`, { method: 'GET' }, klapUserId);
      const p = getPayloadObject(pRes.data);
      if (pRes.ok && p) {
        await ctx.supabase.from('klap_projects').upsert({
          user_id: ctx.userId,
          job_id: job.id,
          klap_project_id: p.id ?? outputId,
          klap_folder_id: extractFolderId(p),
          name: p.name ?? null,
          virality_score: p.virality_score ?? null,
          virality_score_explanation: p.virality_score_explanation ?? null,
          duration: p.duration ?? null,
          raw: p,
        }, { onConflict: 'user_id,klap_project_id' });
      }
    }
  }

  const { data: updated } = await ctx.supabase
    .from('klap_video_jobs').select('*').eq('id', job.id).maybeSingle();
  const { data: projects } = await ctx.supabase
    .from('klap_projects').select('*').eq('job_id', job.id).eq('user_id', ctx.userId);
  return json({ job: updated, projects: projects ?? [] });
}

async function actionCreateEmbedUrl(ctx: Ctx, body: any) {
  validateInput('klap_project_id', { value: body.klap_project_id, type: 'string', required: true });
  const { data: project } = await ctx.supabase
    .from('klap_projects')
    .select('id, klap_project_id, klap_folder_id, raw, user_id')
    .eq('klap_project_id', body.klap_project_id)
    .eq('user_id', ctx.userId)
    .maybeSingle();
  if (!project) return json({ error: 'not_found', success: false }, 404);

  const klapUserId = await ensureKlapUser(ctx.supabase, ctx.userId);
  const tokenRes = await klapFetch(`/users/${encodeURIComponent(klapUserId)}/tokens`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  if (!tokenRes.ok) {
    return json({ error: 'klap_upstream_error', status: tokenRes.status, success: false }, 502);
  }
  const token = extractToken(tokenRes.data);
  const klapProjectId = extractKlapProjectId(project);
  if (!token || !klapProjectId) return json({ error: 'klap_embed_token_error', success: false }, 502);
  const embed_url = `https://app.klap.app/embed/${encodeURIComponent(klapProjectId)}#external_access_token=${token}`;
  return json({ embed_url });
}

async function actionStartExport(ctx: Ctx, body: any) {
  validateInput('klap_project_id', { value: body.klap_project_id, type: 'string', required: true });
  const { data: project } = await ctx.supabase
    .from('klap_projects')
    .select('id, klap_project_id, klap_folder_id, raw')
    .eq('klap_project_id', body.klap_project_id)
    .eq('user_id', ctx.userId)
    .maybeSingle();
  if (!project) return json({ error: 'not_found', success: false }, 404);

  const klapUserId = await ensureKlapUser(ctx.supabase, ctx.userId);
  const klapProjectId = extractKlapProjectId(project);
  if (!klapProjectId) return json({ error: 'project_missing_klap_id', success: false }, 500);

  const folderId = await resolveFolderId(ctx, klapUserId, project);
  const exportBody = typeof body.watermark === 'object' && body.watermark !== null
    ? { watermark: body.watermark }
    : null;
  const exportInit: RequestInit = {
    method: 'POST',
    ...(exportBody ? { body: JSON.stringify(exportBody) } : {}),
  };

  let exportRes = await klapFetch(createKlapProjectExportPath(klapProjectId, folderId), exportInit, klapUserId);
  if (!exportRes.ok && folderId) {
    exportRes = await klapFetch(createKlapProjectExportPath(klapProjectId, null), exportInit, klapUserId);
  }
  if (!exportRes.ok) {
    return json({
      error: 'klap_upstream_error',
      status: exportRes.status,
      message: exportRes.message ?? 'Erro ao iniciar exportação no Klap',
      success: false,
    }, 502);
  }

  const exportData = extractExport(exportRes.data);
  const exportId = firstString(exportData?.id, exportData?.export_id, exportData?.exportId);
  if (!exportId) return json({ error: 'klap_export_missing_id', success: false }, 502);

  const status = firstString(exportData?.status) || 'processing';
  const { data: row, error } = await ctx.supabase
    .from('klap_exports')
    .insert({
      user_id: ctx.userId,
      project_id: project.id,
      klap_export_id: exportId,
      status,
      watermark: Boolean(body.watermark),
      src_url: firstString(exportData?.src_url, exportData?.srcUrl, exportData?.url),
      finished_at: firstString(exportData?.finished_at, exportData?.finishedAt) || (status === 'ready' ? new Date().toISOString() : null),
    })
    .select()
    .single();
  if (error) throw new Error(`db_insert_export:${error.message}`);
  return json({ export: row });
}

async function actionRefreshExport(ctx: Ctx, body: any) {
  validateInput('export_id', { value: body.export_id, type: 'string', required: true });
  const { data: exp } = await ctx.supabase
    .from('klap_exports')
    .select('id, klap_export_id, project_id, status')
    .eq('id', body.export_id)
    .eq('user_id', ctx.userId)
    .maybeSingle();
  if (!exp) return json({ error: 'not_found', success: false }, 404);

  const { data: project } = await ctx.supabase
    .from('klap_projects')
    .select('klap_project_id, klap_folder_id, raw')
    .eq('id', exp.project_id)
    .eq('user_id', ctx.userId)
    .maybeSingle();
  if (!project) return json({ error: 'not_found', success: false }, 404);

  const klapUserId = await ensureKlapUser(ctx.supabase, ctx.userId);
  const klapProjectId = extractKlapProjectId(project);
  if (!klapProjectId) return json({ error: 'project_missing_klap_id', success: false }, 500);

  const folderId = await resolveFolderId(ctx, klapUserId, { ...project, id: exp.project_id });
  let res = await klapFetch(createKlapProjectExportPath(klapProjectId, folderId, exp.klap_export_id), { method: 'GET' }, klapUserId);
  if (!res.ok && folderId) {
    res = await klapFetch(createKlapProjectExportPath(klapProjectId, null, exp.klap_export_id), { method: 'GET' }, klapUserId);
  }
  if (!res.ok) {
    return json({
      error: 'klap_upstream_error',
      status: res.status,
      message: res.message ?? 'Erro ao atualizar exportação no Klap',
      success: false,
    }, 502);
  }

  const exportData = extractExport(res.data);
  const status = firstString(exportData?.status) || 'processing';
  const src_url = firstString(exportData?.src_url, exportData?.srcUrl, exportData?.url);
  await ctx.supabase
    .from('klap_exports')
    .update({
      status,
      src_url,
      finished_at: firstString(exportData?.finished_at, exportData?.finishedAt) || (status === 'ready' ? new Date().toISOString() : null),
      error_message: status === 'error' ? (getKlapMessage(exportData) || 'unknown') : null,
    })
    .eq('id', exp.id)
    .eq('user_id', ctx.userId);

  const { data: updated } = await ctx.supabase
    .from('klap_exports').select('*').eq('id', exp.id).maybeSingle();
  return json({ export: updated });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const { client: supabase, userId } = createAuthenticatedClient(req);
  if (!userId) return json({ error: 'Unauthorized', success: false }, 401);

  const email = getEmailFromToken(req);
  if (!email || !ALLOWED_EMAILS.includes(email)) {
    await logSecurityEvent(supabase, userId, 'klap_forbidden', 'klap-api', false, 'not_in_allowlist');
    return json({ error: 'feature_not_enabled', success: false }, 403);
  }

  if (!KLAP_KEY) {
    return json({ error: 'klap_not_configured', success: false }, 500);
  }

  try {
    await checkRateLimit(supabase, userId, 'klap-api');
  } catch (e) {
    if (e instanceof RateLimitError) {
      return json({ error: e.message, type: 'rate_limit_error', retry_after: e.retryAfter, success: false }, 429);
    }
  }

  let body: any = {};
  try { body = await req.json(); } catch { body = {}; }
  const action = body?.action as string | undefined;
  const ctx: Ctx = { supabase, userId, email };

  try {
    switch (action) {
      case 'ensure_managed_user': return await actionEnsureManagedUser(ctx);
      case 'start_video_to_shorts': return await startTask(ctx, body, 'video-to-shorts');
      case 'start_video_to_video': return await startTask(ctx, body, 'video-to-video');
      case 'refresh_task': return await actionRefreshTask(ctx, body);
      case 'create_embed_url': return await actionCreateEmbedUrl(ctx, body);
      case 'start_export': return await actionStartExport(ctx, body);
      case 'refresh_export': return await actionRefreshExport(ctx, body);
      default:
        return json({ error: 'unknown_action', success: false }, 400);
    }
  } catch (e) {
    if (e instanceof ValidationError) {
      return json({ error: e.message, type: 'validation_error', success: false }, 400);
    }
    const msg = e instanceof Error ? e.message : 'unknown';
    await logSecurityEvent(supabase, userId, 'klap_action_error', 'klap-api', false, msg, { action });
    return json({ error: 'internal_error', success: false }, 500);
  }
});
