import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRODUCT_TO_ROLE: Record<string, string> = {
  'prod_TYdDZJuSPTQgsn': 'pro',
  'prod_TYdDnWDdVthKIs': 'team',
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-ROLES] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Starting subscription roles sync");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Verify admin (optional - can be removed for one-time execution)
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      if (!userError && userData.user) {
        const { data: roleData } = await supabaseClient
          .from('user_roles')
          .select('role')
          .eq('user_id', userData.user.id)
          .single();
        
        if (roleData?.role !== 'admin') {
          throw new Error("Only admins can sync roles");
        }
      }
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Get all active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
    });

    logStep("Found active subscriptions", { count: subscriptions.data.length });

    const results: any[] = [];

    for (const subscription of subscriptions.data) {
      try {
        const customerId = subscription.customer as string;
        
        // Get customer email from Stripe
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted || !('email' in customer) || !customer.email) {
          logStep("Skipping deleted customer", { customerId });
          continue;
        }

        const email = customer.email;
        const productId = subscription.items.data[0].price.product as string;
        const role = PRODUCT_TO_ROLE[productId] || 'free';
        
        // Safe date handling
        const periodEnd = subscription.current_period_end ? subscription.current_period_end * 1000 : Date.now();
        const periodStart = subscription.current_period_start ? subscription.current_period_start * 1000 : Date.now();
        const subscriptionEnd = new Date(periodEnd).toISOString();
        const subscriptionStart = new Date(periodStart).toISOString();

        logStep("Processing subscription", { email, productId, role, customerId });

        // Find user in Supabase by email
        const { data: users } = await supabaseClient.auth.admin.listUsers();
        const user = users.users.find(u => u.email === email);

        if (!user) {
          logStep("No Supabase user found for email", { email });
          results.push({ email, status: 'no_user', role });
          continue;
        }

        // Update user_roles table
        await supabaseClient
          .from('user_roles')
          .delete()
          .eq('user_id', user.id);
        
        await supabaseClient
          .from('user_roles')
          .insert({ user_id: user.id, role: role });

        // Update subscriptions table
        await supabaseClient
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0].price.id,
            status: 'active',
            current_period_start: subscriptionStart,
            current_period_end: subscriptionEnd,
            cancel_at_period_end: subscription.cancel_at_period_end ?? false,
          }, { onConflict: 'user_id' });

        logStep("Updated user role", { email, userId: user.id, role });
        results.push({ email, userId: user.id, status: 'updated', role });
      } catch (subError) {
        const errMsg = subError instanceof Error ? subError.message : String(subError);
        logStep("Error processing subscription", { error: errMsg, subscriptionId: subscription.id });
        results.push({ subscriptionId: subscription.id, status: 'error', error: errMsg });
      }
    }

    logStep("Sync completed", { updatedCount: results.filter(r => r.status === 'updated').length });

    return new Response(JSON.stringify({
      success: true,
      results,
      summary: {
        total: subscriptions.data.length,
        updated: results.filter(r => r.status === 'updated').length,
        noUser: results.filter(r => r.status === 'no_user').length,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
