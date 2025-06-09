/// <reference types="vite/client" />

// Environment variable type definitions for the Landing Page
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_APP_TITLE?: string;
  readonly VITE_ENVIRONMENT?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_LANDING_URL?: string;
  readonly VITE_INNOVATOR_PORTAL_URL?: string;
  readonly VITE_INVESTOR_PORTAL_URL?: string;
  readonly VITE_HUB_PORTAL_URL?: string;
  readonly VITE_ADMIN_PORTAL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
