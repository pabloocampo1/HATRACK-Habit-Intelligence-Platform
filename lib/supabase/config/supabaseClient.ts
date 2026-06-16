/**
 * Browser-side Supabase client.
 * Uses createBrowserClient from @supabase/ssr so the session is stored
 * in cookies (not localStorage), making it readable by Server Components
 * and the middleware for automatic token refresh.
 *
 * Only import this in Client Components ("use client").
 * For Server Components / Route Handlers / Server Actions use lib/supabase/config/server.ts
 */
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
