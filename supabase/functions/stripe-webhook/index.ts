// @ts-nocheck — Runs on Deno (Supabase Edge Functions)
// supabase/functions/stripe-webhook/index.ts
//
// Handles Stripe webhook events to confirm payments server-side.
// This is the SOURCE OF TRUTH — it marks orders as "paid" or "failed".
//
// Deploy:
//   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_XXXX
//   supabase functions deploy stripe-webhook --no-verify-jwt
//
// Secrets required:
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-populated)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  try {
    // 1. Get the raw body and Stripe signature
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing Stripe signature", { status: 400 });
    }

    // 2. Verify the webhook signature (CRITICAL — prevents fake events)
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("[stripe-webhook] Signature verification failed:", (err as Error).message);
      return new Response("Invalid signature", { status: 400 });
    }

    // 3. Handle the event
    console.log(`[stripe-webhook] Received event: ${event.type}`);

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.order_id;
      const orderType = paymentIntent.metadata.order_type; // "meal" or "consultation"

      if (!orderId || !orderType) {
        console.warn("[stripe-webhook] Missing order metadata, skipping");
        return new Response("OK", { status: 200 });
      }

      const table = orderType === "meal" ? "orders" : "consultation_orders";

      // Mark order as paid
      const { error } = await supabaseAdmin
        .from(table)
        .update({
          payment_status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("payment_status", "pending"); // Only update if still pending (idempotent)

      if (error) {
        console.error(`[stripe-webhook] Failed to update ${table}:`, error.message);
      } else {
        console.log(`[stripe-webhook] ✅ Order ${orderId} marked as paid`);
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.order_id;
      const orderType = paymentIntent.metadata.order_type;

      if (orderId && orderType) {
        const table = orderType === "meal" ? "orders" : "consultation_orders";

        await supabaseAdmin
          .from(table)
          .update({ payment_status: "failed" })
          .eq("id", orderId)
          .eq("payment_status", "pending");

        console.log(`[stripe-webhook] ❌ Order ${orderId} marked as failed`);
      }
    }

    // Always return 200 to acknowledge receipt (Stripe retries on non-2xx)
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[stripe-webhook] error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
