// @ts-nocheck — This file runs on Deno (Supabase Edge Functions), not Node.js.
// supabase/functions/stream-webhook/index.ts
// Pure fetch() — NO npm imports. Works reliably in Deno Edge Functions.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const STREAM_API_KEY = Deno.env.get("STREAM_API_KEY")!;
const STREAM_API_SECRET = Deno.env.get("STREAM_API_SECRET")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;

const COACH_JIM_ID = "coach-jim";
const GEMINI_MODELS = ["gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.5-flash-lite"];
const GEMINI_BASE = `https://generativelanguage.googleapis.com/v1beta/models`;

const SYSTEM_PROMPT = `You are **Coach Jim**, a fitness coach with over 15 years of experience and a former competitive bodybuilder.

Style: Super friendly, casual, always respond in **Bahasa Indonesia**. Keep fitness terms in English but explain in Indonesian. Keep responses concise for mobile chat. Use bullet points. End with an encouraging line or follow-up question.

Rules: Ask clarifying questions first. Never diagnose injuries. Don't prescribe supplement brands. Never promote extreme diets. Prioritize long-term health.`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Base64url encode ────────────────────────────────────────────
function b64url(input: string): string {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlBytes(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ── Generate GetStream server JWT ───────────────────────────────
async function makeServerJWT(): Promise<string> {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(JSON.stringify({ server: true }));
  const unsigned = `${header}.${payload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(STREAM_API_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(unsigned));
  return `${unsigned}.${b64urlBytes(new Uint8Array(sig))}`;
}

// ── Send message to GetStream via REST ──────────────────────────
async function sendToGetStream(
  channelType: string,
  channelId: string,
  text: string,
): Promise<void> {
  const jwt = await makeServerJWT();
  const url = `https://chat.stream-io-api.com/channels/${channelType}/${channelId}/message?api_key=${STREAM_API_KEY}`;

  console.log(`[send] POST ${url.substring(0, 80)}...`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwt,
      "stream-auth-type": "jwt",
    },
    body: JSON.stringify({ message: { text, user_id: COACH_JIM_ID } }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[send] GetStream ${res.status}: ${body}`);
    throw new Error(`GetStream ${res.status}`);
  }
  console.log("[send] OK");
}

// ── In-memory dedup (prevents rapid retries within same instance) ───
const processed = new Set<string>();

// ── Background processing ───────────────────────────────────────
async function handleMessage(
  msgText: string,
  msgId: string,
  chType: string,
  chId: string,
) {
  try {
    // Call Gemini (with model fallback)
    const geminiBody = JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: msgText }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
    });

    let data: any = null;
    for (const model of GEMINI_MODELS) {
      console.log(`[bg] Trying ${model}...`);
      const aiRes = await fetch(
        `${GEMINI_BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: geminiBody,
        },
      );
      if (aiRes.ok) {
        data = await aiRes.json();
        console.log(`[bg] ${model} OK`);
        break;
      }
      console.warn(`[bg] ${model} => ${aiRes.status}`);
      if (![503, 429, 404].includes(aiRes.status)) {
        console.error(`[bg] Fatal: ${await aiRes.text()}`);
        return;
      }
    }
    if (!data) {
      console.error("[bg] All Gemini models unavailable");
      return;
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, coba lagi ya 🙏";
    console.log(`[bg] Coach: ${reply.substring(0, 60)}...`);

    // Send reply to GetStream
    await sendToGetStream(chType, chId, reply);
    console.log("[bg] Done!");
  } catch (err) {
    console.error("[bg] Error:", err);
  }
}

// ── Main handler ────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const msg = body.message;
    const sender = msg?.user?.id || body.user?.id;
    const chId = body.channel_id;
    const chType = body.channel_type || "messaging";

    // Skip non-message events and Coach Jim's own messages
    if (body.type !== "message.new" || !msg?.text || sender === COACH_JIM_ID) {
      return jsonOk({ status: "skipped" });
    }
    if (!chId?.startsWith("consultation-")) {
      return jsonOk({ status: "skipped" });
    }

    // Deduplicate — skip if we already processed this message
    const msgId = msg.id || `${sender}-${Date.now()}`;
    if (processed.has(msgId)) {
      console.log(`[webhook] Skipping duplicate: ${msgId}`);
      return jsonOk({ status: "duplicate" });
    }
    processed.add(msgId);

    // Clean up old entries to prevent memory leak
    if (processed.size > 200) processed.clear();

    console.log(`[webhook] Accepted: "${msg.text}" (${msgId})`);

    // ⚡ Fire-and-forget: process in background, return 200 IMMEDIATELY
    // This prevents GetStream from retrying the webhook
    handleMessage(msg.text, msgId, chType, chId);

    return jsonOk({ status: "accepted" });
  } catch (err: any) {
    console.error("[webhook] ERROR:", err);
    return jsonOk({ status: "error", error: err.message });
  }
});

function jsonOk(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
