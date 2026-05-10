// @ts-nocheck — This file runs on Deno (Supabase Edge Functions), not Node.js.
// supabase/functions/stream-token/index.ts
// Generates GetStream user tokens and initialises consultation channels.
// Deploy: supabase functions deploy stream-token --no-verify-jwt
//
// Auth: caller must send a valid Clerk session JWT in the Authorization
// header. We verify it via Clerk's JWKS, then confirm the orderId belongs
// to the verified user before issuing a GetStream token.
//
// Secrets required:
//   STREAM_API_KEY, STREAM_API_SECRET
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-populated by Supabase)
//   CLERK_ISSUER (e.g. https://funky-caribou-55.clerk.accounts.dev)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { StreamChat } from "npm:stream-chat";
import * as jose from "npm:jose@5";
import { createClient } from "npm:@supabase/supabase-js@2";

const STREAM_API_KEY = Deno.env.get("STREAM_API_KEY")!;
const STREAM_API_SECRET = Deno.env.get("STREAM_API_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CLERK_ISSUER = Deno.env.get("CLERK_ISSUER")!;

const JWKS = jose.createRemoteJWKSet(
  new URL(`${CLERK_ISSUER}/.well-known/jwks.json`),
);

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const COACH_JIM = {
  id: "coach-jim",
  name: "Coach Jim",
  image:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&h=150&fit=crop",
  role: "admin",
};

const DEFAULT_WELCOME =
  "Haii! 👋 Kenalin aku Coach Jim — Anggap aja aku temen gym kamu yang kebetulan tau banyak soal fitness 😄 Mau baru mulai atau udah lama latihan tapi pengen naik level, aku siap bantu! Jadi, apa tujuan kamu sekarang? Yuk kita mulai! 💪";

interface IntakePayload {
  healthConcern?: string;
  foodAllergy?: string;
  bodyGoals?: string;
  dietPreference?: string;
}

function hasIntake(intake?: IntakePayload): boolean {
  if (!intake) return false;
  return Boolean(
    intake.healthConcern?.trim() ||
      intake.foodAllergy?.trim() ||
      intake.bodyGoals?.trim() ||
      intake.dietPreference?.trim()
  );
}

function buildPersonalizedWelcome(userName: string, intake: IntakePayload): string {
  const greeting = userName ? `Halo ${userName}!` : "Halo!";
  const lines = [
    `${greeting} 👋 Aku Coach Jim — aku udah baca info dari Program Detail kamu, jadi aku langsung paham gambarannya 💪`,
    "",
    "Yang aku catat:",
  ];
  if (intake.bodyGoals?.trim()) lines.push(`• 🎯 Goal: ${intake.bodyGoals.trim()}`);
  if (intake.healthConcern?.trim())
    lines.push(`• ❤️ Health concern: ${intake.healthConcern.trim()}`);
  if (intake.foodAllergy?.trim())
    lines.push(`• 🥗 Alergi/pantangan makanan: ${intake.foodAllergy.trim()}`);
  if (intake.dietPreference?.trim())
    lines.push(`• 🍽️ Preferensi diet: ${intake.dietPreference.trim()}`);
  lines.push("");
  lines.push(
    "Aku bakal kasih saran yang aman & sesuai goal kamu — gak perlu ulang info di atas ya. Kita mulai dari mana dulu? 🚀"
  );
  return lines.join("\n");
}

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

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Verify Clerk session JWT
    const auth =
      req.headers.get("authorization") || req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return jsonResponse(401, { error: "Missing Bearer token" });
    }
    const token = auth.slice("Bearer ".length).trim();

    let clerkUserId: string;
    try {
      const { payload } = await jose.jwtVerify(token, JWKS, {
        issuer: CLERK_ISSUER,
      });
      if (typeof payload.sub !== "string") {
        return jsonResponse(401, { error: "Invalid token claims" });
      }
      clerkUserId = payload.sub;
    } catch (e) {
      console.warn("[stream-token] JWT verify failed:", (e as Error).message);
      return jsonResponse(401, { error: "Invalid Clerk session" });
    }

    // 2. Validate body and that the requested userId matches the verified caller
    const { userId, userName, orderId, intake } = (await req.json()) as {
      userId?: string;
      userName?: string;
      orderId?: string;
      intake?: IntakePayload;
    };

    if (!userId || !orderId) {
      return jsonResponse(400, { error: "userId and orderId are required" });
    }

    // Client sanitises the Clerk id for GetStream (alphanumeric + _ -)
    const expectedStreamUserId = clerkUserId.replace(/[^a-zA-Z0-9_-]/g, "_");
    if (userId !== expectedStreamUserId) {
      return jsonResponse(403, { error: "userId does not match caller" });
    }

    // 3. Verify the order belongs to the verified user
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("consultation_orders")
      .select("id, user_id")
      .eq("id", orderId)
      .maybeSingle();

    if (orderErr) {
      console.error("[stream-token] order lookup failed:", orderErr);
      return jsonResponse(500, { error: "Order lookup failed" });
    }
    if (!order || order.user_id !== clerkUserId) {
      return jsonResponse(403, { error: "Order not found or not yours" });
    }

    // 4. Issue GetStream token + initialise channel
    const serverClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);

    await serverClient.upsertUsers([
      { id: userId, name: userName || "User", role: "user" },
    ]);
    await serverClient.upsertUsers([COACH_JIM]);

    const streamToken = serverClient.createToken(userId);

    const channelId = `consultation-${orderId}`;
    const channelData: Record<string, unknown> = {
      name: "Consultation with Coach Jim",
      created_by_id: COACH_JIM.id,
      members: [userId, COACH_JIM.id],
    };
    if (hasIntake(intake)) {
      channelData.intake_user_name = userName || "";
      channelData.intake_health_concern = intake!.healthConcern?.trim() || "";
      channelData.intake_food_allergy = intake!.foodAllergy?.trim() || "";
      channelData.intake_body_goals = intake!.bodyGoals?.trim() || "";
      channelData.intake_diet_preference = intake!.dietPreference?.trim() || "";
    }

    const channel = serverClient.channel("messaging", channelId, channelData);
    const state = await channel.create();

    const existingHasIntake = Boolean(
      (state.channel as Record<string, unknown> | undefined)?.intake_body_goals
    );
    if (hasIntake(intake) && !existingHasIntake) {
      await channel.updatePartial({
        set: {
          intake_user_name: channelData.intake_user_name,
          intake_health_concern: channelData.intake_health_concern,
          intake_food_allergy: channelData.intake_food_allergy,
          intake_body_goals: channelData.intake_body_goals,
          intake_diet_preference: channelData.intake_diet_preference,
        },
      });
    }

    const msgCount =
      state.channel?.message_count ?? state.channel?.messages?.length ?? 0;
    if (msgCount === 0) {
      const welcomeText = hasIntake(intake)
        ? buildPersonalizedWelcome(userName || "", intake!)
        : DEFAULT_WELCOME;
      await channel.sendMessage({
        text: welcomeText,
        user_id: COACH_JIM.id,
      });
    }

    return jsonResponse(200, { token: streamToken, channelId });
  } catch (err: any) {
    console.error("stream-token error:", err);
    return jsonResponse(500, { error: err.message || "Internal server error" });
  }
});
