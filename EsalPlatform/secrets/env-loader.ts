/**
 * Environment Configuration Loader
 * Loads environment variables from the secrets folder based on NODE_ENV
 */

import { config } from "dotenv";
import { join } from "path";
import { existsSync } from "fs";

export interface EnvironmentConfig {
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;

  // Database
  DATABASE_URL: string;

  // AI Services
  GEMINI_API_KEY: string;
  OPENAI_API_KEY?: string;

  // JWT
  JWT_SECRET_KEY: string;
  JWT_ALGORITHM: string;
  JWT_EXPIRATION_TIME: string;

  // Application
  DEBUG: string;
  ENVIRONMENT: string;
  PROJECT_NAME: string;
  API_VERSION: string;

  // CORS
  ALLOWED_ORIGINS: string;

  // Email
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_USER: string;
  SMTP_PASSWORD: string;
  SMTP_FROM_EMAIL: string;
  SMTP_FROM_NAME: string;

  // Redis
  REDIS_URL: string;
}

/**
 * Load environment variables from the secrets folder
 * @param environment - The environment to load (development, production, test)
 * @returns Parsed environment configuration
 */
export function loadEnvironment(environment?: string): EnvironmentConfig {
  const env = environment || process.env.NODE_ENV || "development";
  const secretsPath = join(
    process.cwd(),
    "secrets",
    "environments",
    `.env.${env}`
  );

  // Check if secrets file exists
  if (!existsSync(secretsPath)) {
    console.warn(`Secrets file not found: ${secretsPath}`);
    console.warn("Loading from process.env instead...");
  } else {
    // Load from secrets file
    config({ path: secretsPath });
  }

  // Validate required environment variables
  const requiredVars = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "JWT_SECRET_KEY",
    "DATABASE_URL",
  ];

  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  return {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    DATABASE_URL: process.env.DATABASE_URL!,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY!,
    JWT_ALGORITHM: process.env.JWT_ALGORITHM || "HS256",
    JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME || "3600",
    DEBUG: process.env.DEBUG || "false",
    ENVIRONMENT: process.env.ENVIRONMENT || env,
    PROJECT_NAME: process.env.PROJECT_NAME || "ESAL Platform API",
    API_VERSION: process.env.API_VERSION || "v1",
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "http://localhost:3000",
    SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
    SMTP_PORT: process.env.SMTP_PORT || "587",
    SMTP_USER: process.env.SMTP_USER!,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD!,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL!,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || "ESAL Platform",
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379/0",
  };
}

// Export singleton instance
export const env = loadEnvironment();
