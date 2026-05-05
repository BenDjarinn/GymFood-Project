// @ts-nocheck — This file runs on Deno (Supabase Edge Functions), not Node.js.
// supabase/functions/stream-token/index.ts
// Generates GetStream user tokens and initialises consultation channels.
// Deploy: supabase functions deploy stream-token
//
// Secrets required:
//   STREAM_API_KEY, STREAM_API_SECRET

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { StreamChat } from "npm:stream-chat";

const STREAM_API_KEY = Deno.env.get("STREAM_API_KEY")!;
const STREAM_API_SECRET = Deno.env.get("STREAM_API_SECRET")!;

const COACH_JIM = {
  id: "coach-jim",
  name: "Coach Jim",
  image:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&h=150&fit=crop",
  role: "admin",
};

const WELCOME_MESSAGE =
  "Haii! 👋 Kenalin aku Coach Jim — Anggap aja aku temen gym kamu yang kebetulan tau banyak soal fitness 😄 Mau baru mulai atau udah lama latihan tapi pengen naik level, aku siap bantu! Jadi, apa tujuan kamu sekarang? Yuk kita mulai! 💪";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, userName, orderId } = await req.json();

    if (!userId || !orderId) {
      return new Response(
        JSON.stringify({ error: "userId and orderId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serverClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);

    // Upsert the human user
    await serverClient.upsertUsers([
      { id: userId, name: userName || "User", role: "user" },
    ]);

    // Upsert Coach Jim bot user
    await serverClient.upsertUsers([COACH_JIM]);

    // Generate token for the human user
    const token = serverClient.createToken(userId);

    // Create or get the consultation channel
    const channelId = `consultation-${orderId}`;
    const channel = serverClient.channel("messaging", channelId, {
      name: "Consultation with Coach Jim",
      created_by_id: COACH_JIM.id,
      members: [userId, COACH_JIM.id],
    });

    const state = await channel.create();

    // Send welcome message if the channel is brand new (no messages yet)
    const msgCount =
      state.channel?.message_count ?? state.channel?.messages?.length ?? 0;
    if (msgCount === 0) {
      await channel.sendMessage({
        text: WELCOME_MESSAGE,
        user_id: COACH_JIM.id,
      });
    }

    return new Response(
      JSON.stringify({ token, channelId }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("stream-token error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
