/**
 * Environment variable schema validation using Zod
 *
 * This module validates environment variables against a schema to ensure
 * that all required variables are present and correctly formatted.
 */
import { z } from "zod";

/**
 * Environment variable schema
 */
export const envSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // API URLs
  API_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),

  // Supabase configuration
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // AI API keys
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // Analytics and monitoring
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
});

/**
 * Environment variables type
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 *
 * @returns Validated environment variables
 * @throws Error if validation fails
 */
export function getEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error("❌ Invalid environment variables:", error);
    throw new Error("Invalid environment variables");
  }
}

/**
 * Environment singleton
 */
export const env = getEnv();
