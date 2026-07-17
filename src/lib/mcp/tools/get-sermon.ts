import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, requireAuth, jsonResult, errorResult } from "../supabase";

export default defineTool({
  name: "get_sermon",
  title: "Get sermon",
  description: "Fetch a single sermon (transcript + summary) by id. Must belong to the signed-in user.",
  inputSchema: {
    id: z.string().uuid().describe("The sermon id."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    const guard = requireAuth(ctx); if (guard) return guard;
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("sermons")
      .select("id, status, summary, transcript, created_at")
      .eq("id", id)
      .eq("user_id", ctx.getUserId())
      .maybeSingle();
    if (error) return errorResult(error.message);
    if (!data) return errorResult("Sermon not found");
    return jsonResult(data);
  },
});
