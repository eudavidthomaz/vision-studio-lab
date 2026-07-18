import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser, requireAuth, jsonResult } from "../supabase";

export default defineTool({
  name: "whoami",
  title: "Who am I",
  description: "Returns the signed-in Ide.On user's id, email and profile (full_name, church, city).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false, destructiveHint: false },
  handler: async (_input, ctx) => {
    const guard = requireAuth(ctx); if (guard) return guard;
    const sb = supabaseForUser(ctx);
    const userId = ctx.getUserId();
    const { data: profile } = await sb.from("profiles").select("full_name, phone, church, city, instagram").eq("id", userId).maybeSingle();
    return jsonResult({ id: userId, email: ctx.getUserEmail(), profile });
  },
});
