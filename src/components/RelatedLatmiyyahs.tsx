"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Latmiyyah } from "@/lib/types";
import LatmiyyahCard from "./LatmiyyahCard";

export default function RelatedLatmiyyahs({ current }: { current: Latmiyyah }) {
  const supabase = createClient();
  const [related, setRelated] = useState<Latmiyyah[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("latmiyyahs")
        .select("*, tags:latmiyyah_tags(tag:tags(*))")
        .eq("status", "published")
        .neq("id", current.id);

      const normalized: Latmiyyah[] = (data || []).map((r: any) => ({
        ...r,
        tags: (r.tags || []).map((t: any) => t.tag).filter(Boolean),
      }));

      const currentTagIds = new Set((current.tags || []).map((t) => t.id));

      const scored = normalized.map((item) => {
        let score = 0;
        if (item.reciter === current.reciter) score += 3;
        const overlap = (item.tags || []).filter((t) => currentTagIds.has(t.id)).length;
        score += overlap * 2;
        return { item, score };
      });

      setRelated(
        scored
          .filter((s) => s.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 4)
          .map((s) => s.item)
      );
    }
    load();
  }, [current, supabase]);

  if (related.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="mb-4 text-lg font-semibold">Related Latmiyyahs</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {related.map((item) => (
          <LatmiyyahCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
