import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, requireAuth, jsonResult, errorResult } from "../supabase";

export default defineTool({
  name: "list_schedules",
  title: "List volunteer schedules",
  description: "List volunteer schedule assignments for the signed-in user. Optionally filter by date range and status.",
  inputSchema: {
    limit: z.number().int().min(1).max(200).default(100),
    from_date: z.string().optional().describe("ISO date (YYYY-MM-DD) lower bound on service_date."),
    to_date: z.string().optional().describe("ISO date (YYYY-MM-DD) upper bound on service_date."),
    status: z.string().optional().describe("Filter by status (e.g. 'pending', 'confirmed', 'declined')."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false, destructiveHint: false },
  handler: async ({ limit, from_date, to_date, status }, ctx) => {
    const guard = requireAuth(ctx); if (guard) return guard;
    const sb = supabaseForUser(ctx);
    let q = sb.from("volunteer_schedules")
      .select("id, volunteer_id, service_date, service_name, start_time, end_time, role, status, notes, confirmed_at")
      .eq("user_id", ctx.getUserId())
      .order("service_date", { ascending: true })
      .limit(limit ?? 100);
    if (from_date) q = q.gte("service_date", from_date);
    if (to_date) q = q.lte("service_date", to_date);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return errorResult(error.message);
    return jsonResult(data);
  },
});
