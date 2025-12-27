import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Map Stripe plan types to database plan types
const mapPlanType = (planType: string): string => {
  const mapping: Record<string, string> = {
    access: "starter",
    growth: "growth",
    enterprise: "enterprise",
  };
  return mapping[planType] || "starter";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No stripe signature provided");

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    logStep("Event verified", { type: event.type, id: event.id });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.completed", { sessionId: session.id });

        const metadata = session.metadata || {};
        const userId = metadata.user_id;
        const planType = metadata.plan_type;
        const companyId = metadata.company_id;

        if (!userId) {
          logStep("No user_id in metadata, skipping");
          break;
        }

        // Get subscription details
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
          const currentPeriodStart = new Date(subscription.current_period_start * 1000);

          // Update or create subscription in database
          const { error: upsertError } = await supabaseAdmin
            .from("subscriptions")
            .upsert({
              company_id: companyId,
              stripe_subscription_id: subscriptionId,
              stripe_customer_id: customerId,
              plan: mapPlanType(planType),
              status: "active",
              billing_cycle_start: currentPeriodStart.toISOString().split('T')[0],
              billing_cycle_end: currentPeriodEnd.toISOString().split('T')[0],
              auto_renew: true,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: "company_id",
            });

          if (upsertError) {
            logStep("Error upserting subscription", { error: upsertError });
          } else {
            logStep("Subscription updated successfully", { subscriptionId, plan: planType });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing subscription update", { subscriptionId: subscription.id });

        const status = subscription.status === "active" ? "active" : 
                       subscription.status === "past_due" ? "past_due" :
                       subscription.status === "canceled" ? "cancelled" : "active";

        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        const currentPeriodStart = new Date(subscription.current_period_start * 1000);

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status,
            billing_cycle_start: currentPeriodStart.toISOString().split('T')[0],
            billing_cycle_end: currentPeriodEnd.toISOString().split('T')[0],
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          logStep("Error updating subscription", { error });
        } else {
          logStep("Subscription status updated", { status });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing subscription cancellation", { subscriptionId: subscription.id });

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "cancelled",
            auto_renew: false,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          logStep("Error cancelling subscription", { error });
        } else {
          logStep("Subscription cancelled successfully");
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        logStep("Processing payment failure", { subscriptionId });

        if (subscriptionId) {
          const { error } = await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscriptionId);

          if (error) {
            logStep("Error updating subscription status", { error });
          } else {
            logStep("Subscription marked as past_due");
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
