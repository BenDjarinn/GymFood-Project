import { StreamChat } from "stream-chat";

const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY!;

if (!STREAM_API_KEY) {
  throw new Error(
    "Missing EXPO_PUBLIC_STREAM_API_KEY. Add it to your .env file."
  );
}

/**
 * GetStream Chat client singleton.
 *
 * Used for real-time messaging in consultation chat.
 * Auth tokens are generated server-side by the stream-token Edge Function.
 */
export const chatClient = StreamChat.getInstance(STREAM_API_KEY);
