import { defineTool } from "@lovable.dev/mcp-js";
import { defineTool as _ } from "@lovable.dev/mcp-js";
import { supabaseForUser, requireAuth, jsonResult, errorResult } from "../supabase";

export default defineTool({
  name: "list_church_sites",
  title: "List church sites",
  description: "List church sites owned by the signed-in user (id, slug, is_published, published URL).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const guard = requireAuth(ctx); if (guard) return guard;
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("church_sites")
      .select("id, slug, is_published, created_at, updated_at")
      .eq("user_id", ctx.getUserId())
      .order("updated_at", { ascending: false });
    if (error) return errorResult(error.message);
    const withUrl = (data ?? []).map((s: any) => ({ ...s, url: s.is_published ? `https://midias.app/igreja/${s.slug}` : null }));
    return jsonResult(withUrl);
  },
});
