import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRODUCT_TO_ROLE: Record<string, "pro" | "team"> = {
  'prod_TYdDZJuSPTQgsn': 'pro',
  'prod_TYdDnWDdVthKIs': 'team',
};

const PREMIUM_STATUSES = new Set(['active', 'trialing']);

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // ADMIN bypass
    const { data: currentRole } = await supabaseClient
      .from('user_roles')
      .select('role, manual_override, override_reason')
      .eq('user_id', user.id)
      .maybeSingle();

    if (currentRole?.role === 'admin') {
      return new Response(JSON.stringify({
        subscribed: true, role: 'admin', product_id: null, subscription_end: null,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    // MANUAL OVERRIDE bypass (explicit, audited)
    if (currentRole?.manual_override && (currentRole.role === 'pro' || currentRole.role === 'team')) {
      logStep("Manual override active", { role: currentRole.role, reason: currentRole.override_reason });
      return new Response(JSON.stringify({
        subscribed: true, role: currentRole.role, product_id: null, subscription_end: null,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Resolve customer
    let customerId: string | null = null;
    const { data: existingSub } = await supabaseClient
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (existingSub?.stripe_customer_id) customerId = existingSub.stripe_customer_id;

    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) customerId = customers.data[0].id;
    }

    if (!customerId) {
      try {
        const subsSearch = await stripe.subscriptions.search({
          query: `metadata['user_id']:'${user.id}'`, limit: 1,
        });
        if (subsSearch.data.length > 0) customerId = subsSearch.data[0].customer as string;
      } catch (e) {
        logStep("Subscription search failed", { error: String(e) });
      }
    }

    if (!customerId) {
      logStep("No customer found → degrading to free");
      await supabaseClient.rpc('degrade_user_to_free', {
        _user_id: user.id, _reason: 'check-subscription:no_customer',
      });
      return new Response(JSON.stringify({
        subscribed: false, role: 'free', product_id: null, subscription_end: null,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    // Get MOST RECENT subscription (any status) — not just "active"
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId, status: "all", limit: 10,
    });

    // Pick the one with premium status, or the most recent if none premium
    const premium = subscriptions.data.find(s => PREMIUM_STATUSES.has(s.status));
    const chosen = premium || subscriptions.data[0];

    if (!chosen) {
      logStep("Customer has no subscriptions → degrading");
      await supabaseClient.rpc('degrade_user_to_free', {
        _user_id: user.id, _reason: 'check-subscription:no_subscriptions',
      });
      return new Response(JSON.stringify({
        subscribed: false, role: 'free', product_id: null, subscription_end: null,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    const status = chosen.status;
    const productId = chosen.items.data[0]?.price?.product as string;
    const priceId = chosen.items.data[0]?.price?.id;
    const role = PRODUCT_TO_ROLE[productId] || 'free';
    const subscriptionEnd = chosen.current_period_end
      ? new Date(chosen.current_period_end * 1000).toISOString() : null;
    const subscriptionStart = chosen.current_period_start
      ? new Date(chosen.current_period_start * 1000).toISOString() : null;

    // ALWAYS persist subscription state
    await supabaseClient.from('subscriptions').upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: chosen.id,
      stripe_price_id: priceId,
      status,
      current_period_start: subscriptionStart,
      current_period_end: subscriptionEnd,
      cancel_at_period_end: chosen.cancel_at_period_end ?? false,
    }, { onConflict: 'user_id' });

    const isPremium = PREMIUM_STATUSES.has(status) && role !== 'free';

    if (isPremium) {
      await supabaseClient.rpc('promote_user_role', {
        _user_id: user.id, _role: role, _reason: `check-subscription:${status}`,
      });
    } else {
      await supabaseClient.rpc('degrade_user_to_free', {
        _user_id: user.id, _reason: `check-subscription:${status}`,
      });
    }

    logStep("Reconciled", { status, role: isPremium ? role : 'free' });

    return new Response(JSON.stringify({
      subscribed: isPremium,
      role: isPremium ? role : 'free',
      product_id: isPremium ? productId : null,
      subscription_end: subscriptionEnd,
      status,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
