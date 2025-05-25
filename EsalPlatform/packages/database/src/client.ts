/**
 * Supabase client configuration and initialization
 */
import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";
import { env } from "@repo/config";

/**
 * Create and initialize a Supabase client
 *
 * @returns Typed Supabase client
 */
export function createSupabaseClient() {
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}

/**
 * Create and initialize a Supabase admin client with service role key
 *
 * @returns Typed Supabase admin client
 */
export function createSupabaseAdminClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin client");
  }

  return createClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// Export singleton instance for client-side usage
export const supabase = createSupabaseClient();
