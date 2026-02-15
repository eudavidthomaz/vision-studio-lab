import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const PRODUCT_TO_ROLE: Record<string, string> = {
  'prod_TYdDZJuSPTQgsn': 'pro',
  'prod_TYdDnWDdVthKIs': 'team',
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200 });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2025-08-27.basil",
  });

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    logStep("ERROR", { message: "Webhook secret not configured" });
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    logStep("ERROR", { message: "Missing stripe-signature header" });
    return new Response("Missing signature", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logStep("Signature verification failed", { error: msg });
    return new Response("Invalid signature", { status: 400 });
  }

  logStep("Event received", { type: event.type, id: event.id });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.user_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId) {
          logStep("No user_id in checkout session", { sessionId: session.id });
          break;
        }

        logStep("Processing checkout.session.completed", { userId, customerId, subscriptionId });

        // Retrieve subscription to get product/price details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price?.id;
        const productId = subscription.items.data[0]?.price?.product as string;
        const role = PRODUCT_TO_ROLE[productId] || 'free';

        logStep("Subscription details", { productId, role, priceId });

        // Update subscriptions table
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          stripe_price_id: priceId,
          status: 'active',
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        }, { onConflict: 'user_id' });

        // Update user role (delete + insert to ensure single role)
        await supabase.from('user_roles').delete().eq('user_id', userId);
        await supabase.from('user_roles').insert({ user_id: userId, role });

        logStep("Checkout processed successfully", { userId, role });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;

        // Find user by subscription ID
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (!subData?.user_id) {
          // Fallback: try metadata
          const userId = subscription.metadata?.user_id;
          if (!userId) {
            logStep("Cannot find user for subscription", { subscriptionId });
            break;
          }
          logStep("Found user via metadata", { userId });
          // Process with metadata user_id
          const productId = subscription.items.data[0]?.price?.product as string;
          const role = PRODUCT_TO_ROLE[productId] || 'free';
          const status = subscription.status;

          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: subscription.customer as string,
            stripe_price_id: subscription.items.data[0]?.price?.id,
            status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          }, { onConflict: 'user_id' });

          if (status === 'active') {
            await supabase.from('user_roles').delete().eq('user_id', userId);
            await supabase.from('user_roles').insert({ user_id: userId, role });
          }
          break;
        }

        const userId = subData.user_id;
        const productId = subscription.items.data[0]?.price?.product as string;
        const role = PRODUCT_TO_ROLE[productId] || 'free';
        const status = subscription.status;

        logStep("Processing subscription.updated", { userId, status, role });

        await supabase.from('subscriptions').update({
          status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          stripe_price_id: subscription.items.data[0]?.price?.id,
        }).eq('stripe_subscription_id', subscriptionId);

        // Update role based on status
        if (status === 'active') {
          await supabase.from('user_roles').delete().eq('user_id', userId);
          await supabase.from('user_roles').insert({ user_id: userId, role });
        } else if (status === 'canceled' || status === 'unpaid') {
          await supabase.from('user_roles').delete().eq('user_id', userId);
          await supabase.from('user_roles').insert({ user_id: userId, role: 'free' });
        }

        logStep("Subscription updated successfully", { userId, status, role });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;

        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        const userId = subData?.user_id || subscription.metadata?.user_id;
        if (!userId) {
          logStep("Cannot find user for deleted subscription", { subscriptionId });
          break;
        }

        logStep("Processing subscription.deleted", { userId, subscriptionId });

        await supabase.from('subscriptions').update({
          status: 'canceled',
        }).eq('stripe_subscription_id', subscriptionId);

        // Revert to free
        await supabase.from('user_roles').delete().eq('user_id', userId);
        await supabase.from('user_roles').insert({ user_id: userId, role: 'free' });

        logStep("Subscription deleted, role reverted to free", { userId });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) {
          logStep("No subscription in failed invoice");
          break;
        }

        logStep("Processing invoice.payment_failed", { subscriptionId });

        await supabase.from('subscriptions').update({
          status: 'past_due',
        }).eq('stripe_subscription_id', subscriptionId);

        logStep("Subscription marked as past_due");
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logStep("Error processing event", { error: msg, eventType: event.type });
    // Return 200 to prevent Stripe from retrying (we log the error)
    return new Response(JSON.stringify({ received: true, error: msg }), { status: 200 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
