"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "../types";

// Browser client - uses the public anon key only.
// Safety comes from Row Level Security policies (see supabase/policies.sql),
// not from this key being secret. It is fine for it to be visible in the
// bundle shipped to the browser.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
