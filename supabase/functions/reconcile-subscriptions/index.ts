import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

/**
 * Daily reconciliation safety net.
 * For every user with premium role (non-admin, non-manual-override),
 * verify they have an active/trialing Stripe subscription.
 * If not → degrade to free.
 *
 * Run via pg_cron daily.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PREMIUM_STATUSES = new Set(['active', 'trialing']);

const log = (s: string, d?: unknown) =>
  console.log(`[RECONCILE] ${s}${d ? ' - ' + JSON.stringify(d) : ''}`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-08-27.basil" });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  const summary = { checked: 0, degraded: 0, ok: 0, errors: 0, details: [] as any[] };

  try {
    // All users with premium role that are NOT admin and NOT manual override
    const { data: premiumUsers, error } = await supabase
      .from('user_roles')
      .select('user_id, role, manual_override')
      .in('role', ['pro', 'team'])
      .eq('manual_override', false);

    if (error) throw error;
    log("Premium users to check", { count: premiumUsers?.length || 0 });

    for (const u of premiumUsers || []) {
      summary.checked++;
      try {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('stripe_customer_id, stripe_subscription_id')
          .eq('user_id', u.user_id)
          .maybeSingle();

        let isPremium = false;
        let stripeStatus: string | null = null;

        if (sub?.stripe_customer_id) {
          const subs = await stripe.subscriptions.list({
            customer: sub.stripe_customer_id, status: "all", limit: 10,
          });
          const premium = subs.data.find(s => PREMIUM_STATUSES.has(s.status));
          if (premium) {
            isPremium = true;
            stripeStatus = premium.status;
            // Stripe API 2025-08-27.basil: period dates live on the item.
            const item: any = premium.items.data[0];
            const pStart = item?.current_period_start ?? (premium as any).current_period_start ?? null;
            const pEnd = item?.current_period_end ?? (premium as any).current_period_end ?? null;
            // Sync the row
            await supabase.from('subscriptions').upsert({
              user_id: u.user_id,
              stripe_customer_id: sub.stripe_customer_id,
              stripe_subscription_id: premium.id,
              stripe_price_id: premium.items.data[0]?.price?.id,
              status: premium.status,
              current_period_start: pStart ? new Date(pStart * 1000).toISOString() : null,
              current_period_end: pEnd ? new Date(pEnd * 1000).toISOString() : null,
              cancel_at_period_end: premium.cancel_at_period_end ?? false,
            }, { onConflict: 'user_id' });
          } else if (subs.data[0]) {
            stripeStatus = subs.data[0].status;
          }
        }

        if (isPremium) {
          summary.ok++;
        } else {
          await supabase.rpc('degrade_user_to_free', {
            _user_id: u.user_id,
            _reason: `reconcile:no_premium_sub(stripe_status=${stripeStatus ?? 'none'})`,
          });
          summary.degraded++;
          summary.details.push({ user_id: u.user_id, was_role: u.role, stripe_status: stripeStatus });
          log("Degraded", { user_id: u.user_id, stripe_status: stripeStatus });
        }
      } catch (e) {
        summary.errors++;
        summary.details.push({ user_id: u.user_id, error: String(e) });
        log("Error per-user", { user_id: u.user_id, error: String(e) });
      }
    }

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (err) {
    log("FATAL", { error: String(err) });
    return new Response(JSON.stringify({ error: String(err), summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
