import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, requireAuth, jsonResult, errorResult } from "../supabase";

export default defineTool({
  name: "list_content",
  title: "List content library",
  description: "List items from the signed-in user's content library. Optional filters by content_type, pilar, status, and free-text search over title.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(20),
    content_type: z.string().optional().describe("Filter by content_type (e.g. 'Reel', 'Carrossel', 'Post')."),
    pilar: z.string().optional().describe("Filter by strategic pillar."),
    status: z.string().optional().describe("Filter by status (e.g. 'draft', 'published')."),
    search: z.string().optional().describe("Case-insensitive title search."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, content_type, pilar, status, search }, ctx) => {
    const guard = requireAuth(ctx); if (guard) return guard;
    const sb = supabaseForUser(ctx);
    let q = sb.from("content_library")
      .select("id, title, content_type, pilar, status, is_favorite, created_at")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (content_type) q = q.eq("content_type", content_type);
    if (pilar) q = q.eq("pilar", pilar);
    if (status) q = q.eq("status", status);
    if (search) q = q.ilike("title", `%${search}%`);
    const { data, error } = await q;
    if (error) return errorResult(error.message);
    return jsonResult(data);
  },
});
