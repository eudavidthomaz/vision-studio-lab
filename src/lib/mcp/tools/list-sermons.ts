import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, requireAuth, jsonResult, errorResult } from "../supabase";

export default defineTool({
  name: "list_sermons",
  title: "List sermons",
  description: "List the signed-in user's sermons (id, status, summary, created_at), newest first.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(20).describe("How many sermons to return (max 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    const guard = requireAuth(ctx); if (guard) return guard;
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("sermons")
      .select("id, status, summary, created_at, transcription_time_ms")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (error) return errorResult(error.message);
    return jsonResult(data);
  },
});
