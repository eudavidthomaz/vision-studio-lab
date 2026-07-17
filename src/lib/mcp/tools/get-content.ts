import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, requireAuth, jsonResult, errorResult } from "../supabase";

export default defineTool({
  name: "get_content",
  title: "Get content item",
  description: "Fetch a full content-library item (including the generated content JSON) by id.",
  inputSchema: {
    id: z.string().uuid(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    const guard = requireAuth(ctx); if (guard) return guard;
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("content_library")
      .select("id, title, content_type, pilar, status, content, tags, prompt_original, created_at, updated_at")
      .eq("id", id)
      .eq("user_id", ctx.getUserId())
      .maybeSingle();
    if (error) return errorResult(error.message);
    if (!data) return errorResult("Content not found");
    return jsonResult(data);
  },
});
