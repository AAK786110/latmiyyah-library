"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Latmiyyah, Tag } from "@/lib/types";
import { rankLatmiyyahs } from "@/lib/search/fuzzySearch";
import LatmiyyahCard from "@/components/LatmiyyahCard";
import FilterPanel, { EMPTY_FILTERS, type FilterState } from "@/components/FilterPanel";

// useSearchParams() opts a page out of static rendering unless it's wrapped
// in a Suspense boundary - this wrapper is what makes `next build` happy.
export default function SearchPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading...</p>}>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageInner() {
  const params = useSearchParams();
  const supabase = createClient();

  const [query, setQuery] = useState(params.get("q") || "");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [all, setAll] = useState<Latmiyyah[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: tagRows } = await supabase.from("tags").select("*").order("name");
      const { data: rows } = await supabase
        .from("latmiyyahs")
        .select("*, tags:latmiyyah_tags(tag:tags(*))")
        .eq("status", "published");

      const normalized: Latmiyyah[] = (rows || []).map((r: any) => ({
        ...r,
        tags: (r.tags || []).map((t: any) => t.tag).filter(Boolean),
      }));

      setTags(tagRows || []);
      setAll(normalized);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const reciters = useMemo(
    () => Array.from(new Set(all.map((a) => a.reciter))).sort(),
    [all]
  );

  const results = useMemo(() => {
    let items = all;

    // Advanced filters: OR within a category, AND across categories.
    if (filters.holy_personality.length > 0) {
      items = items.filter((i) =>
        i.tags?.some((t) => filters.holy_personality.includes(t.id))
      );
    }
    if (filters.context.length > 0) {
      items = items.filter((i) => i.tags?.some((t) => filters.context.includes(t.id)));
    }
    if (filters.speed.length > 0) {
      items = items.filter((i) => i.tags?.some((t) => filters.speed.includes(t.id)));
    }
    if (filters.reciters.length > 0) {
      items = items.filter((i) => filters.reciters.includes(i.reciter));
    }

    if (query.trim()) {
      items = rankLatmiyyahs(items, query);
    } else {
      items = [...items].sort((a, b) => a.title.localeCompare(b.title));
    }

    return items;
  }, [all, filters, query]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-3">
        <span aria-hidden>🔎</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, reciter, poet, tag..."
          className="w-full bg-transparent outline-none placeholder:text-muted"
        />
      </div>

      <div className="mb-6">
        <FilterPanel tags={tags} reciters={reciters} filters={filters} onChange={setFilters} />
      </div>

      <p className="mb-3 text-sm text-muted">
        {loading ? "Loading..." : `${results.length} result${results.length === 1 ? "" : "s"}`}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {results.map((item) => (
          <LatmiyyahCard key={item.id} item={item} />
        ))}
      </div>

      {!loading && results.length === 0 && (
        <div className="mt-8 text-center text-muted">
          <p>No results found.</p>
          <Link href="/explore" className="mt-2 inline-block text-accent hover:underline">
            Try Explore Latmiyyahs instead
          </Link>
        </div>
      )}
    </div>
  );
}
