"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Latmiyyah } from "@/lib/types";
import { getFavourites } from "@/lib/favourites";
import LatmiyyahCard from "@/components/LatmiyyahCard";

export default function FavouritesPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Latmiyyah[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const ids = getFavourites();
    if (ids.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("latmiyyahs")
      .select("*, tags:latmiyyah_tags(tag:tags(*))")
      .in("id", ids)
      .eq("status", "published");

    const normalized = (data || []).map((r: any) => ({
      ...r,
      tags: (r.tags || []).map((t: any) => t.tag).filter(Boolean),
    }));
    setItems(normalized);
    setLoading(false);
  }

  useEffect(() => {
    load();
    window.addEventListener("favourites-changed", load);
    return () => window.removeEventListener("favourites-changed", load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Your Favourites</h1>
      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-muted">
          You haven't favourited anything yet. Tap the heart on any latmiyyah to save it here -
          your favourites are stored on this device.
        </p>
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
