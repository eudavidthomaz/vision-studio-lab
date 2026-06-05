// Klap API router (action-based). All actions require auth + allowlist.
// Never logs secrets, tokens, or full source URLs.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
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

function getEmailFromToken(req: Request): string | null {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return (payload.email as string | undefined)?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

async function klapFetch(
  path: string,
  init: RequestInit,
  klapUserId?: string,
): Promise<{ ok: boolean; status: number; data: any }> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${KLAP_KEY}`,
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (klapUserId) headers['X-On-Behalf-Of'] = klapUserId;

  const res = await fetch(`${KLAP_BASE}${path}`, { ...init, headers });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
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

function maskUrl(u: string | null | undefined): string {
  if (!u) return '';
  return u.length > 24 ? `${u.slice(0, 18)}…(${u.length})` : u;
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

  const taskId = klap.data?.id || klap.data?.task_id;
  const { data: jobRow, error: jobErr } = await ctx.supabase
    .from('klap_video_jobs')
    .insert({
      user_id: ctx.userId,
      job_type: type,
      source_video_url: body.source_video_url,
      options: payload,
      klap_task_id: taskId,
      task_status: klap.data?.status || 'processing',
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
  const status = taskRes.data?.status || 'processing';
  const outputType = taskRes.data?.output_type ?? null;
  const outputId = taskRes.data?.output_id ?? null;

  await ctx.supabase
    .from('klap_video_jobs')
    .update({
      task_status: status,
      output_type: outputType,
      output_id: outputId,
      error_message: status === 'error' ? (taskRes.data?.error || 'unknown') : null,
    })
    .eq('id', job.id)
    .eq('user_id', ctx.userId);

  // If ready, fetch projects to persist
  if (status === 'ready' && outputId) {
    if (outputType === 'folder') {
      const folderRes = await klapFetch(`/projects/${outputId}`, { method: 'GET' }, klapUserId);
      if (folderRes.ok && Array.isArray(folderRes.data)) {
        for (const p of folderRes.data) {
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
      if (pRes.ok && pRes.data) {
        const p = pRes.data;
        await ctx.supabase.from('klap_projects').upsert({
          user_id: ctx.userId,
          job_id: job.id,
          klap_project_id: p.id ?? outputId,
          klap_folder_id: null,
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
    .select('klap_project_id, user_id')
    .eq('klap_project_id', body.klap_project_id)
    .eq('user_id', ctx.userId)
    .maybeSingle();
  if (!project) return json({ error: 'not_found', success: false }, 404);

  const klapUserId = await ensureKlapUser(ctx.supabase, ctx.userId);
  const tokenRes = await klapFetch(`/users/${klapUserId}/tokens`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  if (!tokenRes.ok) {
    return json({ error: 'klap_upstream_error', status: tokenRes.status, success: false }, 502);
  }
  // Klap returns { external_access_token: "..." } per docs.klap.app/usecases/managed-users
  const token =
    tokenRes.data?.external_access_token ||
    tokenRes.data?.token ||
    tokenRes.data?.access_token;
  if (!token) return json({ error: 'no_token', success: false }, 502);
  const embed_url = `https://app.klap.app/embed/${project.klap_project_id}#external_access_token=${token}`;
  return json({ embed_url });
}


async function actionStartExport(ctx: Ctx, body: any) {
  validateInput('klap_project_id', { value: body.klap_project_id, type: 'string', required: true });
  const { data: project } = await ctx.supabase
    .from('klap_projects')
    .select('id, klap_project_id, klap_folder_id')
    .eq('klap_project_id', body.klap_project_id)
    .eq('user_id', ctx.userId)
    .maybeSingle();
  if (!project) return json({ error: 'not_found', success: false }, 404);
  if (!project.klap_folder_id) {
    return json({ error: 'project_has_no_folder', success: false }, 400);
  }

  const klapUserId = await ensureKlapUser(ctx.supabase, ctx.userId);
  // Klap API only documents watermark as an object: { src_url, pos_x?, pos_y?, scale? }
  // If omitted, Klap applies its default watermark. Booleans are rejected.
  const requestBody: Record<string, unknown> = {};
  const wm = body.watermark;
  if (wm && typeof wm === 'object' && typeof (wm as any).src_url === 'string') {
    requestBody.watermark = wm;
  }
  const persistedWm = (requestBody.watermark as Record<string, unknown> | undefined) ?? null;

  const path = `/projects/${project.klap_folder_id}/${project.klap_project_id}/exports`;
  const exportRes = await klapFetch(path, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  }, klapUserId);
  if (!exportRes.ok) {
    await logSecurityEvent(ctx.supabase, ctx.userId, 'klap_export_failed', 'klap-api', false, `status:${exportRes.status}`);
    return json({ error: 'klap_upstream_error', status: exportRes.status, success: false }, 502);
  }
  const exportId = exportRes.data?.id || exportRes.data?.export_id;
  const { data: row, error } = await ctx.supabase
    .from('klap_exports')
    .insert({
      user_id: ctx.userId,
      project_id: project.id,
      klap_export_id: exportId,
      status: exportRes.data?.status || 'processing',
      watermark: persistedWm,
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
    .select('klap_project_id, klap_folder_id')
    .eq('id', exp.project_id)
    .eq('user_id', ctx.userId)
    .maybeSingle();
  if (!project) return json({ error: 'not_found', success: false }, 404);

  const klapUserId = await ensureKlapUser(ctx.supabase, ctx.userId);
  if (!project.klap_folder_id) {
    return json({ error: 'project_has_no_folder', success: false }, 400);
  }
  const path = `/projects/${project.klap_folder_id}/${project.klap_project_id}/exports/${exp.klap_export_id}`;
  const res = await klapFetch(path, { method: 'GET' }, klapUserId);

  if (!res.ok) return json({ error: 'klap_upstream_error', status: res.status, success: false }, 502);

  const status = res.data?.status || 'processing';
  const src_url = res.data?.src_url || res.data?.url || null;
  await ctx.supabase
    .from('klap_exports')
    .update({
      status,
      src_url,
      finished_at: status === 'ready' ? new Date().toISOString() : null,
      error_message: status === 'error' ? (res.data?.error || 'unknown') : null,
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
