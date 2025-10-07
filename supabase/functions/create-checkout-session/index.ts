import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const { priceId, successUrl, cancelUrl, userId, userEmail } = await req.json();

    if (!priceId || !successUrl || !cancelUrl || !userId) {
      throw new Error('Missing required parameters');
    }

    console.log('Creating checkout session for user:', userId);

    // Criar ou recuperar customer do Stripe
    let customerId: string;
    
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
      console.log('Found existing customer:', customerId);
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;
      console.log('Created new customer:', customerId);
    }

    // Criar sessão de checkout com trial de 7 dias
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          supabase_user_id: userId,
        },
      },
      metadata: {
        supabase_user_id: userId,
      },
    });

    console.log('Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
