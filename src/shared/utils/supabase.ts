import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Add them to your .env file."
  );
}

/**
 * Supabase client for database operations.
 *
 * Auth is handled by Clerk — this client is used purely
 * for Postgres queries and data persistence.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
