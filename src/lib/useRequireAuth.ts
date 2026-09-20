"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Client-side guard for creator dashboard pages. Real enforcement of who
// can create/edit/delete data still happens via Supabase RLS policies -
// this hook just gives a good UX by redirecting logged-out visitors.
export function useRequireAuth() {
  const supabase = createClient();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
      } else {
        setReady(true);
      }
    });
  }, [supabase, router]);

  return ready;
}
