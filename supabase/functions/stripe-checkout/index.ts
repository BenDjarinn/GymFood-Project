// @ts-nocheck — Runs on Deno (Supabase Edge Functions)
// supabase/functions/stripe-checkout/index.ts
//
// Production-grade payment endpoint.
// - Calculates prices server-side from the database
// - Creates pending orders before payment
// - Uses idempotency keys to prevent double charges
// - Creates/reuses Stripe Customer per Clerk user
//
// Deploy:
//   supabase secrets set STRIPE_SECRET_KEY=sk_test_XXXX
//   supabase secrets set CLERK_ISSUER=https://your-clerk-issuer.clerk.accounts.dev
//   supabase functions deploy stripe-checkout --no-verify-jwt
//
// Secrets required:
//   STRIPE_SECRET_KEY, CLERK_ISSUER
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-populated by Supabase)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "npm:stripe@17";
import * as jose from "npm:jose@5";
import { createClient } from "npm:@supabase/supabase-js@2";

// ── Environment ────────────────────────────────────────────
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const CLERK_ISSUER = Deno.env.get("CLERK_ISSUER")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ── Clients ────────────────────────────────────────────────
const JWKS = jose.createRemoteJWKSet(
  new URL(`${CLERK_ISSUER}/.well-known/jwks.json`)
);

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ── Constants ──────────────────────────────────────────────
const TAX = 2000;
const HEALTH_INSURANCE = 8000;

// ── CORS ───────────────────────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── Verify Clerk JWT (reused from stream-token) ────────────
async function verifyClerkJWT(req: Request): Promise<string> {
  const auth =
    req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    throw new Error("Missing Bearer token");
  }
  const token = auth.slice("Bearer ".length).trim();
  const { payload } = await jose.jwtVerify(token, JWKS, {
    issuer: CLERK_ISSUER,
  });
  if (typeof payload.sub !== "string") {
    throw new Error("Invalid token claims");
  }
  return payload.sub;
}

// ── Get or create Stripe Customer ──────────────────────────
async function getOrCreateStripeCustomer(
  clerkUserId: string
): Promise<string> {
  // Search for existing customer by Clerk user ID
  const existing = await stripe.customers.search({
    query: `metadata["clerk_user_id"]:"${clerkUserId}"`,
  });

  if (existing.data.length > 0) {
    return existing.data[0].id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    metadata: { clerk_user_id: clerkUserId },
  });
  return customer.id;
}

// ── Handle meal order ──────────────────────────────────────
async function handleMealOrder(
  clerkUserId: string,
  cartItems: { mealId: string; qty: number }[]
) {
  if (!cartItems || cartItems.length === 0) {
    throw new Error("cartItems is required and must not be empty");
  }

  // 1. Look up meal prices from the database
  const mealIds = cartItems.map((item) => item.mealId);
  const { data: meals, error: mealsErr } = await supabaseAdmin
    .from("meals")
    .select("id, name, price")
    .in("id", mealIds);

  if (mealsErr) throw new Error("Failed to look up meals: " + mealsErr.message);
  if (!meals || meals.length === 0) throw new Error("No valid meals found");

  // 2. Calculate total SERVER-SIDE (never trust client amount)
  const mealMap = new Map(meals.map((m: any) => [m.id, m]));
  let subTotal = 0;
  const resolvedItems: { mealId: string; name: string; price: number; qty: number }[] = [];

  for (const item of cartItems) {
    const meal = mealMap.get(item.mealId);
    if (!meal) {
      console.warn(`Meal ${item.mealId} not found in DB, skipping`);
      continue;
    }
    subTotal += meal.price * item.qty;
    resolvedItems.push({
      mealId: meal.id,
      name: meal.name,
      price: meal.price,
      qty: item.qty,
    });
  }

  if (resolvedItems.length === 0) throw new Error("No valid meals in cart");

  const grandTotal = subTotal + TAX + HEALTH_INSURANCE;

  // 3. Create pending order in the database
  const orderId = `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const { error: insertErr } = await supabaseAdmin.from("orders").insert({
    id: orderId,
    items: resolvedItems,
    total_amount: grandTotal,
    paid_at: null,
    user_id: clerkUserId,
    payment_status: "pending",
  });

  if (insertErr) throw new Error("Failed to create order: " + insertErr.message);

  return { orderId, grandTotal, description: "GymFood Meal Order", resolvedItems };
}

// ── Handle consultation order ──────────────────────────────
async function handleConsultationOrder(
  clerkUserId: string,
  planName: string,
  planImage: string,
  planNotes: string[]
) {
  if (!planName) throw new Error("planName is required");

  // 1. Look up plan price from the database
  const { data: plan, error: planErr } = await supabaseAdmin
    .from("subscription_plans")
    .select("subscription_plan, price")
    .eq("subscription_plan", planName)
    .maybeSingle();

  if (planErr) throw new Error("Failed to look up plan: " + planErr.message);
  if (!plan) throw new Error(`Plan "${planName}" not found`);
  if (!plan.price || plan.price <= 0) throw new Error(`Plan "${planName}" has no price set`);

  // 2. Create pending consultation order
  const orderId = `consult-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const { error: insertErr } = await supabaseAdmin
    .from("consultation_orders")
    .insert({
      id: orderId,
      plan_name: planName,
      plan_image: planImage || "",
      plan_notes: planNotes || [],
      paid_at: null,
      status: "active",
      payment_status: "pending",
      user_id: clerkUserId,
    });

  if (insertErr) throw new Error("Failed to create consultation order: " + insertErr.message);

  return {
    orderId,
    grandTotal: plan.price,
    description: `GymFood Consultation - ${planName}`,
  };
}

// ── Main handler ───────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Verify caller identity
    let clerkUserId: string;
    try {
      clerkUserId = await verifyClerkJWT(req);
    } catch (e) {
      return jsonResponse(401, { error: (e as Error).message });
    }

    // 2. Parse request
    const body = await req.json();
    const { type } = body as { type: "meal" | "consultation" };

    let orderId: string;
    let grandTotal: number;
    let description: string;

    // 3. Create pending order + calculate price SERVER-SIDE
    if (type === "meal") {
      const result = await handleMealOrder(clerkUserId, body.cartItems);
      orderId = result.orderId;
      grandTotal = result.grandTotal;
      description = result.description;
    } else if (type === "consultation") {
      const result = await handleConsultationOrder(
        clerkUserId,
        body.planName,
        body.planImage,
        body.planNotes
      );
      orderId = result.orderId;
      grandTotal = result.grandTotal;
      description = result.description;
    } else {
      return jsonResponse(400, { error: 'type must be "meal" or "consultation"' });
    }

    // 4. Get or create Stripe Customer (enables saved cards)
    const stripeCustomerId = await getOrCreateStripeCustomer(clerkUserId);

    // 5. Create PaymentIntent with idempotency key
    //    Stripe treats IDR as a two-decimal currency (not zero-decimal),
    //    so we multiply by 100: e.g. Rp 62,000 → amount 6200000 → Stripe shows Rp 62,000.00
    const stripeAmount = grandTotal * 100;
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: stripeAmount,
        currency: "idr",
        customer: stripeCustomerId,
        description,
        metadata: {
          clerk_user_id: clerkUserId,
          order_id: orderId,
          order_type: type,
        },
      },
      {
        idempotencyKey: `pi_${orderId}`, // Prevents double charges on retry
      }
    );

    // 6. Save the PaymentIntent ID to the order
    const table = type === "meal" ? "orders" : "consultation_orders";
    await supabaseAdmin
      .from(table)
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq("id", orderId);

    // 7. Create ephemeral key for the customer (needed for Payment Sheet)
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: stripeCustomerId },
      { apiVersion: "2024-06-20" }
    );

    // 8. Return everything the app needs
    return jsonResponse(200, {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      ephemeralKey: ephemeralKey.secret,
      customerId: stripeCustomerId,
      orderId,
      amount: grandTotal,
    });
  } catch (err: any) {
    console.error("[stripe-checkout] error:", err);
    return jsonResponse(500, { error: err.message || "Internal server error" });
  }
});
