/**
 * Helper to safely access environment variables
 * This will throw an error if the environment variable is missing in production
 */
export function getEnvVariable(key: string): string {
  const value = import.meta.env[key];
  
  // In development, we'll warn but not throw to make development easier
  if (!value && import.meta.env.DEV) {
    console.warn(`Missing environment variable: ${key}`);
    return '';
  }
  
  // In production, we'll throw an error to prevent deployment with missing variables
  if (!value && import.meta.env.PROD) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value as string;
}
