"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type {
  Latmiyyah,
  Tag,
} from "@/lib/types";
import { rankLatmiyyahs } from "@/lib/search/fuzzySearch";
import LatmiyyahCard from "@/components/LatmiyyahCard";
import FilterPanel, {
  EMPTY_FILTERS,
  type FilterState,
} from "@/components/FilterPanel";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <p className="text-muted">
          Loading...
        </p>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageInner() {
  const params = useSearchParams();
  const supabase = createClient();

  const [query, setQuery] = useState(
    params.get("q") || ""
  );

  const [filters, setFilters] =
    useState<FilterState>(EMPTY_FILTERS);

  const [all, setAll] = useState<
    Latmiyyah[]
  >([]);

  const [tags, setTags] = useState<
    Tag[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: tagRows } =
        await supabase
          .from("tags")
          .select("*")
          .order("name");

      const { data: rows } =
        await supabase
          .from("latmiyyahs")
          .select(
            "*, tags:latmiyyah_tags(tag:tags(*))"
          )
          .eq("status", "published");

      const normalized: Latmiyyah[] = (
        rows || []
      ).map((r: any) => ({
        ...r,
        tags: (r.tags || [])
          .map((t: any) => t.tag)
          .filter(Boolean),
      }));

      setTags(tagRows || []);
      setAll(normalized);
      setLoading(false);
    }

    load();
  }, [supabase]);

  const reciters = useMemo(
    () =>
      Array.from(
        new Set(
          all
            .map((a) => a.reciter)
            .filter(Boolean)
        )
      ).sort(),
    [all]
  );

  const results = useMemo(() => {
    let items = all;

    /*
     * TAG FILTERS USE AND LOGIC.
     *
     * If multiple tags are selected inside a category,
     * the latmiyyah must contain EVERY selected tag.
     *
     * Example:
     * Fast + Shoor
     * means:
     * Fast AND Shoor
     */

    if (
      filters.holy_personality.length >
      0
    ) {
      items = items.filter((item) =>
        filters.holy_personality.every(
          (selectedTagId) =>
            item.tags?.some(
              (tag) =>
                tag.id ===
                selectedTagId
            ) ?? false
        )
      );
    }

    if (filters.context.length > 0) {
      items = items.filter((item) =>
        filters.context.every(
          (selectedTagId) =>
            item.tags?.some(
              (tag) =>
                tag.id ===
                selectedTagId
            ) ?? false
        )
      );
    }

    if (filters.speed.length > 0) {
      items = items.filter((item) =>
        filters.speed.every(
          (selectedTagId) =>
            item.tags?.some(
              (tag) =>
                tag.id ===
                selectedTagId
            ) ?? false
        )
      );
    }

    /*
     * Reciters remain OR.
     *
     * Selecting two reciters means:
     * show pieces by either reciter.
     */
    if (filters.reciters.length > 0) {
      items = items.filter((item) =>
        filters.reciters.includes(
          item.reciter
        )
      );
    }

    if (query.trim()) {
      items = rankLatmiyyahs(
        items,
        query
      );
    } else {
      items = [...items].sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    return items;
  }, [all, filters, query]);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Heading */}
      <section className="border-b border-border pb-6 pt-2 sm:pb-8 sm:pt-4">
        <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.24em] text-muted">
          Search the archive
        </p>

        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
          Search Precisely with Advanced Filters
        </h1>
      </section>

      {/* Search */}
      <section className="py-6">
        <div className="flex items-center gap-3 rounded-full border border-border bg-surface px-4 py-3 shadow-[0_8px_24px_rgba(70,45,30,0.04)] transition-colors focus-within:border-accent">
          <span className="text-accent">
            <SearchIcon />
          </span>

          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search by title, reciter, poet, personality or tag"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted sm:text-base"
          />

          {query && (
            <button
              type="button"
              onClick={() =>
                setQuery("")
              }
              aria-label="Clear search"
              className="shrink-0 text-sm text-muted transition-colors hover:text-accent"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border pb-6">
        <div className="mb-3">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-muted">
            Refine results
          </p>
        </div>

        <FilterPanel
          tags={tags}
          reciters={reciters}
          filters={filters}
          onChange={setFilters}
        />
      </section>

      {/* Results */}
      <section className="pt-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-muted">
              Results
            </p>

            <p className="mt-1 font-display text-xl font-medium">
              {loading
                ? "Searching..."
                : `${results.length} ${
                    results.length === 1
                      ? "result"
                      : "results"
                  }`}
            </p>
          </div>

          {!loading &&
            results.length > 0 && (
              <Link
                href="/explore"
                className="text-sm text-accent hover:underline"
              >
                Explore instead
              </Link>
            )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((item) => (
            <LatmiyyahCard
              key={item.id}
              item={item}
            />
          ))}
        </div>

        {!loading &&
          results.length === 0 && (
            <div className="mt-8 rounded-2xl border border-border bg-surface px-6 py-10 text-center">
              <p className="font-display text-xl font-medium">
                No results found
              </p>

              <p className="mt-2 text-sm text-muted">
                Try a different spelling,
                fewer filters, or browse
                the archive manually.
              </p>

              <Link
                href="/explore"
                className="mt-4 inline-flex items-center gap-2 text-sm text-accent"
              >
                Explore Latmiyyahs
                <ArrowIcon />
              </Link>
            </div>
          )}
      </section>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />
      <path d="m20 20-3.5-3.5" />
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