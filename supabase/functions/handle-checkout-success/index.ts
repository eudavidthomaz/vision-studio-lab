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
  console.log(`[HANDLE-CHECKOUT-SUCCESS] ${step}${detailsStr}`);
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
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Session ID is required");
    logStep("Session ID received", { sessionId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Retrieve the checkout session with expanded data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });
    logStep("Session retrieved", { 
      status: session.status, 
      clientReferenceId: session.client_reference_id,
      customerId: typeof session.customer === 'string' ? session.customer : session.customer?.id
    });

    if (session.status !== 'complete') {
      logStep("Session not complete, skipping");
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Checkout session not complete" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Verify the session belongs to this user
    if (session.client_reference_id !== user.id) {
      logStep("Session user mismatch", { 
        sessionUserId: session.client_reference_id, 
        requestUserId: user.id 
      });
      throw new Error("Session does not belong to this user");
    }

    const customerId = typeof session.customer === 'string' 
      ? session.customer 
      : session.customer?.id;
    
    const subscription = session.subscription as Stripe.Subscription;
    if (!subscription || !customerId) {
      throw new Error("No subscription or customer found in session");
    }

    const subscriptionId = subscription.id;
    const priceId = subscription.items.data[0]?.price?.id;
    const productId = subscription.items.data[0]?.price?.product as string;
    const role = PRODUCT_TO_ROLE[productId] || 'free';

    logStep("Subscription details", { 
      subscriptionId, 
      customerId, 
      priceId, 
      productId,
      role,
      periodStart: subscription.current_period_start,
      periodEnd: subscription.current_period_end
    });

    // Update subscriptions table with Stripe customer ID
    const { error: subError } = await supabaseClient
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_price_id: priceId,
        status: 'active',
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      }, { onConflict: 'user_id' });

    if (subError) {
      logStep("Error updating subscriptions", { error: subError.message });
      throw new Error(`Failed to update subscription: ${subError.message}`);
    }
    logStep("Subscriptions table updated");

    // Update user role
    await supabaseClient
      .from('user_roles')
      .delete()
      .eq('user_id', user.id);
    
    await supabaseClient
      .from('user_roles')
      .insert({ user_id: user.id, role: role });
    
    logStep("User role updated", { role });

    return new Response(JSON.stringify({ 
      success: true,
      role,
      subscription_end: new Date(subscription.current_period_end * 1000).toISOString()
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
