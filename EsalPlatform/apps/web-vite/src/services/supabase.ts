import { createClient } from "@supabase/supabase-js";
import { getEnvVariable } from "./env";

// Get Supabase URL and anon key from environment variables
const supabaseUrl = getEnvVariable("VITE_SUPABASE_URL");
const supabaseAnonKey = getEnvVariable("VITE_SUPABASE_ANON_KEY");

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type-safe way to access environment variables
export const apiUrl = getEnvVariable("VITE_API_URL");
