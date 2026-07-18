import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, requireAuth, jsonResult, errorResult } from "../supabase";

export default defineTool({
  name: "list_volunteers",
  title: "List volunteers",
  description: "List the signed-in user's volunteers.",
  inputSchema: {
    limit: z.number().int().min(1).max(200).default(100),
    search: z.string().optional().describe("Case-insensitive name search."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false, destructiveHint: false },
  handler: async ({ limit, search }, ctx) => {
    const guard = requireAuth(ctx); if (guard) return guard;
    const sb = supabaseForUser(ctx);
    let q = sb.from("volunteers").select("*").eq("user_id", ctx.getUserId()).order("created_at", { ascending: false }).limit(limit ?? 100);
    if (search) q = q.ilike("name", `%${search}%`);
    const { data, error } = await q;
    if (error) return errorResult(error.message);
    return jsonResult(data);
  },
});
