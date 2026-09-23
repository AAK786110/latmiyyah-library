"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
      tags: (r.tags || [])
        .map((t: any) => t.tag)
        .filter(Boolean),
    }));

    setItems(normalized);
    setLoading(false);
  }

  useEffect(() => {
    load();

    window.addEventListener(
      "favourites-changed",
      load
    );

    return () =>
      window.removeEventListener(
        "favourites-changed",
        load
      );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Heading */}
      <section className="border-b border-border pb-6 pt-2 sm:pb-8 sm:pt-4">
        <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.24em] text-muted">
          Saved to your device
        </p>

        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
          Your Favourites
        </h1>

        
      </section>

      {/* Content */}
      <section className="pt-6">
        {loading ? (
          <p className="text-sm text-muted">
            Loading favourites...
          </p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface px-6 py-10 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-border bg-bg text-accent">
              <HeartIcon />
            </div>

            <h2 className="mt-4 font-display text-xl font-medium">
              No favourites yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Tap the heart on any latmiyyah to save it here. Your favourites are stored on this device.
            </p>

            <Link
              href="/explore"
              className="mt-5 inline-flex items-center gap-2 text-sm text-accent"
            >
              Explore Latmiyyahs
              <ArrowIcon />
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-muted">
                  Saved
                </p>

                <p className="mt-1 font-display text-xl font-medium">
                  {items.length}{" "}
                  {items.length === 1
                    ? "favourite"
                    : "favourites"}
                </p>
              </div>

              <Link
                href="/explore"
                className="text-sm text-accent hover:underline"
              >
                Explore more
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((item) => (
                <LatmiyyahCard
                  key={item.id}
                  item={item}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </svg>
  );
}