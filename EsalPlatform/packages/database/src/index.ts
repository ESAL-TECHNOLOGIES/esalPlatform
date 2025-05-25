// packages/database/src/index.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generated types (use Supabase CLI)
export interface User {
  id: string;
  name: string;
  email: string;
  // Add other user fields as needed
}

export interface Database {
  users: User;
  // ...
}