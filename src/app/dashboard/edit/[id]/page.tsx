"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { Latmiyyah } from "@/lib/types";
import LatmiyyahForm from "@/components/LatmiyyahForm";

export default function EditLatmiyyahPage() {
  const ready = useRequireAuth();
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const [item, setItem] = useState<Latmiyyah | null | undefined>(undefined);

  useEffect(() => {
    if (!ready) return;
    async function load() {
      const { data } = await supabase
        .from("latmiyyahs")
        .select("*, tags:latmiyyah_tags(tag:tags(*))")
        .eq("id", id)
        .single();
      if (data) {
        setItem({ ...data, tags: (data.tags || []).map((t: any) => t.tag).filter(Boolean) });
      } else {
        setItem(null);
      }
    }
    load();
  }, [ready, id, supabase]);

  if (!ready || item === undefined) return null;
  if (item === null) return <p>Latmiyyah not found.</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Latmiyyah</h1>
      <LatmiyyahForm existing={item} />
    </div>
  );
}
