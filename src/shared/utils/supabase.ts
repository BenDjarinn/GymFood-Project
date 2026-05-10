import { createClient } from "@supabase/supabase-js";
import { getClerkInstance } from "@clerk/expo";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Add them to your .env file."
  );
}

// Forwards Clerk's session JWT to Supabase so RLS policies can resolve
// auth.jwt()->>'sub' to the Clerk user id. Returns null when signed out,
// which falls back to the anon key.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  accessToken: async () => {
    const token = await getClerkInstance().session?.getToken();
    return token ?? null;
  },
});
