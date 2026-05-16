import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const PRODUCT_TO_ROLE: Record<string, "pro" | "team"> = {
  'prod_TYdDZJuSPTQgsn': 'pro',
  'prod_TYdDnWDdVthKIs': 'team',
};

// Stripe statuses that grant premium access
const PREMIUM_STATUSES = new Set(['active', 'trialing']);

function safeTimestamp(unix: number | null | undefined): string | null {
  if (!unix || typeof unix !== 'number') return null;
  return new Date(unix * 1000).toISOString();
}

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200 });

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-08-27.basil" });
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    logStep("ERROR", { message: "Webhook secret not configured" });
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    logStep("Signature verification failed", { error: err instanceof Error ? err.message : String(err) });
    return new Response("Invalid signature", { status: 400 });
  }

  logStep("Event received", { type: event.type, id: event.id });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  /**
   * Single source of truth: given a Stripe subscription, reconcile DB
   * subscription row + user_roles row atomically.
   */
  async function reconcileSubscription(
    userId: string,
    subscription: Stripe.Subscription,
    sourceEvent: string,
  ) {
    const productId = subscription.items.data[0]?.price?.product as string;
    const priceId = subscription.items.data[0]?.price?.id;
    const status = subscription.status;
    const role = PRODUCT_TO_ROLE[productId] || 'free';

    // ALWAYS persist subscription state, regardless of status
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      status,
      current_period_start: safeTimestamp(subscription.current_period_start),
      current_period_end: safeTimestamp(subscription.current_period_end),
      cancel_at_period_end: subscription.cancel_at_period_end ?? false,
    }, { onConflict: 'user_id' });

    if (PREMIUM_STATUSES.has(status) && role !== 'free') {
      // Promote (uses SECURITY DEFINER helper that respects admin)
      await supabase.rpc('promote_user_role', {
        _user_id: userId,
        _role: role,
        _reason: `${sourceEvent}:${status}`,
      });
      logStep("Role promoted", { userId, role, status });
    } else {
      // Any non-premium status → degrade (helper respects admin + manual_override)
      await supabase.rpc('degrade_user_to_free', {
        _user_id: userId,
        _reason: `${sourceEvent}:${status}`,
      });
      logStep("Role degraded", { userId, status });
    }
  }

  /** Resolve user_id from a subscription (DB first, metadata fallback). */
  async function resolveUserId(subscription: Stripe.Subscription): Promise<string | null> {
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .maybeSingle();
    if (subData?.user_id) return subData.user_id;

    const metaUid = (subscription.metadata?.user_id as string) || null;
    if (metaUid) return metaUid;

    // Last resort: lookup by customer
    const { data: byCust } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', subscription.customer as string)
      .maybeSingle();
    return byCust?.user_id || null;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || (session.metadata?.user_id as string);
        const subscriptionId = session.subscription as string;

        if (!userId || !subscriptionId) {
          logStep("Missing user_id or subscription in checkout", { sessionId: session.id });
          break;
        }
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await reconcileSubscription(userId, subscription, 'checkout.completed');
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(subscription);
        if (!userId) {
          logStep("Cannot resolve user", { subscriptionId: subscription.id, type: event.type });
          break;
        }
        await reconcileSubscription(userId, subscription, event.type);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(subscription);
        if (!userId) {
          logStep("Cannot resolve user for deleted subscription", { subscriptionId: subscription.id });
          break;
        }

        await supabase.from('subscriptions').update({
          status: 'canceled',
          cancel_at_period_end: false,
          current_period_end: safeTimestamp(subscription.current_period_end),
        }).eq('stripe_subscription_id', subscription.id);

        await supabase.rpc('degrade_user_to_free', {
          _user_id: userId,
          _reason: 'subscription.deleted',
        });
        logStep("Subscription deleted, role degraded", { userId });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string
          || (invoice as any).parent?.subscription_details?.subscription as string;
        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = await resolveUserId(subscription)
          || ((invoice as any).parent?.subscription_details?.metadata?.user_id as string)
          || null;
        if (!userId) {
          logStep("WARN: no user for invoice.payment_succeeded", { subscriptionId });
          break;
        }
        await reconcileSubscription(userId, subscription, 'invoice.paid');
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string
          || (invoice as any).parent?.subscription_details?.subscription as string;
        if (!subscriptionId) break;

        // Re-fetch subscription to get authoritative status (past_due / unpaid)
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = await resolveUserId(subscription);
        if (!userId) {
          logStep("WARN: no user for invoice.payment_failed", { subscriptionId });
          break;
        }
        // Reconcile: status will be past_due/unpaid → degrades to free
        await reconcileSubscription(userId, subscription, 'invoice.payment_failed');
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logStep("Error processing event", { error: msg, eventType: event.type });
    return new Response(JSON.stringify({ received: true, error: msg }), { status: 200 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
