import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-08-27.basil" });
  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  const orphans = ["cus_TvVtdFegNkN2Rg", "cus_TvJ4ScOf3MnLhz", "cus_Tq15kzWJx6Zbhq"];
  const results: any[] = [];

  for (const cid of orphans) {
    const cust: any = await stripe.customers.retrieve(cid);
    const email = cust.email;
    const meta = cust.metadata;
    const subs = await stripe.subscriptions.list({ customer: cid, status: "active", limit: 5 });

    let userId: string | null = meta?.user_id || meta?.supabase_user_id || null;

    if (!userId && email) {
      // Look up by email in auth.users
      const { data } = await supa.auth.admin.listUsers();
      const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      userId = found?.id || null;
    }

    const subInfos = subs.data.map((s) => ({
      id: s.id,
      price: s.items.data[0]?.price.id,
      current_period_end: s.current_period_end,
    }));

    results.push({ customer_id: cid, email, metadata: meta, user_id_found: userId, subscriptions: subInfos });
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
