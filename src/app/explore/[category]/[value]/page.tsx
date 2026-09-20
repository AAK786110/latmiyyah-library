"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Latmiyyah } from "@/lib/types";
import LatmiyyahCard from "@/components/LatmiyyahCard";

export default function ExploreResultsPage() {
  const { category, value } = useParams<{ category: string; value: string }>();
  const supabase = createClient();
  const [items, setItems] = useState<Latmiyyah[]>([]);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (category === "reciter") {
        const reciterName = decodeURIComponent(value);
        setLabel(reciterName);
        const { data } = await supabase
          .from("latmiyyahs")
          .select("*, tags:latmiyyah_tags(tag:tags(*))")
          .eq("status", "published")
          .eq("reciter", reciterName)
          .order("title");
        setItems(normalize(data));
      } else {
        const { data: tagRow } = await supabase
          .from("tags")
          .select("*")
          .eq("category", category)
          .eq("slug", value)
          .single();

        if (tagRow) {
          setLabel(tagRow.name);
          const { data } = await supabase
            .from("latmiyyah_tags")
            .select("latmiyyah:latmiyyahs(*, tags:latmiyyah_tags(tag:tags(*)))")
            .eq("tag_id", tagRow.id);

          const rows = (data || [])
            .map((r: any) => r.latmiyyah)
            .filter((l: any) => l && l.status === "published");
          setItems(normalize(rows).sort((a, b) => a.title.localeCompare(b.title)));
        }
      }
      setLoading(false);
    }
    load();
  }, [category, value, supabase]);

  function normalize(rows: any[] | null): Latmiyyah[] {
    return (rows || []).map((r: any) => ({
      ...r,
      tags: (r.tags || []).map((t: any) => t.tag).filter(Boolean),
    }));
  }

  return (
    <div>
      <Link href="/explore" className="text-sm text-muted hover:underline">← Back to Explore</Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">
        Latmiyyahs about {label || "..."}
      </h1>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-muted">No latmiyyahs found for this category yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <LatmiyyahCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
