import { useState, useEffect, useCallback, useRef } from "react";
import { useUser, useAuth } from "@clerk/expo";
import { chatClient } from "@shared/utils/streamChat";
import { COACH_JIM_ID } from "@shared/types/chat";
import type { Channel as StreamChannel, Event } from "stream-chat";
import type { ChatMessageItem } from "@shared/types/chat";
import type { ConsultationIntake } from "@shared/types/data";

const TOKEN_URL = process.env.EXPO_PUBLIC_STREAM_TOKEN_URL!;

/** Timeout for coach typing indicator (ms) */
const TYPING_TIMEOUT = 45_000;

/**
 * Custom hook that encapsulates all GetStream chat logic for the
 * fitness consultation. Keeps the ChatScreen component focused
 * purely on rendering.
 *
 * Architecture: separates UI ↔ state ↔ transport concerns.
 */
export function useFitnessChat(orderId: string, intake?: ConsultationIntake) {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCoachTyping, setIsCoachTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientReady, setClientReady] = useState(false);

  const channelRef = useRef<StreamChannel | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Hold the latest intake in a ref so it's read on connect without re-firing
  // the effect when the prop reference changes.
  const intakeRef = useRef<ConsultationIntake | undefined>(intake);
  useEffect(() => {
    intakeRef.current = intake;
  }, [intake]);

  // ── Connect to GetStream & watch channel ────────────────────
  useEffect(() => {
    if (!user?.id || !orderId) return;

    let mounted = true;

    // Sanitise Clerk ID for GetStream (alphanumeric, _, - only)
    const userId = user.id.replace(/[^a-zA-Z0-9_-]/g, "_");

    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Fetch token from backend Edge Function. The Clerk session JWT
        // proves caller identity; the function verifies it server-side via
        // Clerk's JWKS and confirms orderId belongs to this user.
        const clerkToken = await getToken();
        if (!clerkToken) throw new Error("Not signed in");

        const tokenRes = await fetch(TOKEN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${clerkToken}`,
          },
          body: JSON.stringify({
            userId,
            userName: user.firstName ?? "User",
            orderId,
            intake: intakeRef.current,
          }),
        });

        if (!tokenRes.ok) {
          const errBody = await tokenRes.text().catch(() => "");
          throw new Error(
            `Failed to get chat token (${tokenRes.status})${errBody ? `: ${errBody}` : ""}`
          );
        }

        const { token, channelId } = await tokenRes.json();

        // 2. Connect user to GetStream (skip if already connected)
        if (!chatClient.userID) {
          await chatClient.connectUser(
            {
              id: userId,
              name: user.firstName ?? "User",
              image: user.imageUrl,
            },
            token
          );
        }

        // 3. Watch the consultation channel
        const channel = chatClient.channel("messaging", channelId);
        await channel.watch();
        channelRef.current = channel;

        // 4. Load existing messages
        if (mounted) {
          setMessages(mapAllMessages(channel));
          setClientReady(true);
          setIsLoading(false);
        }

        // 5. Listen for new messages (from user AND coach)
        channel.on("message.new", (event: Event) => {
          if (!mounted) return;

          // Refresh messages from channel state (always in sync)
          setMessages(mapAllMessages(channel));

          // Hide typing indicator when coach responds
          if (event.message?.user?.id === COACH_JIM_ID) {
            setIsCoachTyping(false);
            clearTypingTimer();
          }
        });
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Failed to connect to chat");
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      clearTypingTimer();
      channelRef.current?.stopWatching();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, orderId]);

  // ── Clear typing timeout helper ─────────────────────────────
  const clearTypingTimer = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  }, []);

  // ── Send a message ──────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      if (!channelRef.current || !text.trim()) return;

      try {
        await channelRef.current.sendMessage({ text: text.trim() });

        // Show coach typing indicator after user sends
        setIsCoachTyping(true);

        // Safety timeout — hide indicator if coach doesn't respond
        clearTypingTimer();
        typingTimerRef.current = setTimeout(() => {
          setIsCoachTyping(false);
        }, TYPING_TIMEOUT);
      } catch (err: any) {
        setError(err.message || "Failed to send message");
        setIsCoachTyping(false);
      }
    },
    [clearTypingTimer]
  );

  return {
    messages,
    isLoading,
    isCoachTyping,
    error,
    sendMessage,
    clientReady,
  };
}

// ── Helpers ─────────────────────────────────────────────────────

/** Map all GetStream channel messages to our ChatMessageItem format */
function mapAllMessages(channel: StreamChannel): ChatMessageItem[] {
  return (channel.state.messages || []).map((msg) => ({
    id: msg.id,
    text: msg.text || "",
    isCoach: msg.user?.id === COACH_JIM_ID,
    createdAt: new Date(msg.created_at || Date.now()),
  }));
}
