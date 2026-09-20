import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import LatmiyyahCard from "@/components/LatmiyyahCard";
import type { Latmiyyah } from "@/lib/types";

export default async function HomePage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("latmiyyahs")
    .select("*, tags:latmiyyah_tags(tag:tags(*))")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);

  const recent: Latmiyyah[] = (data || []).map((r: any) => ({
    ...r,
    tags: (r.tags || []).map((t: any) => t.tag).filter(Boolean),
  }));

  return (
    <div>
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            A library of latmiyyahs & qasidas
          </h1>
          <p className="mt-3 text-muted">
            Original Arabic lyrics, English translations, and easy ways to find
            exactly what you're looking for.
          </p>
        </div>

        <form action="/search" className="mt-8">
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-3 shadow-sm">
            <span aria-hidden>🔎</span>
            <input
              name="q"
              type="text"
              placeholder="Search by title, reciter, poet, or tag..."
              className="w-full bg-transparent outline-none placeholder:text-muted"
            />
          </div>
        </form>

        <div className="mt-6 grid gap-3">
          <Link
            href="/explore"
            className="rounded-lg border border-accent bg-accent/10 px-5 py-4 text-center text-lg font-medium text-accent transition-colors hover:bg-accent/20"
          >
            Explore Latmiyyahs
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/search"
              className="rounded-lg border border-border px-4 py-3 text-center text-sm hover:border-accent"
            >
              Advanced Filters
            </Link>
            <Link
              href="/random"
              className="rounded-lg border border-border px-4 py-3 text-center text-sm hover:border-accent"
            >
              Random Latmiyyah
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/favourites"
              className="rounded-lg border border-border px-4 py-3 text-center text-sm hover:border-accent"
            >
              Favourites
            </Link>
            <Link
              href="/submit"
              className="rounded-lg border border-border px-4 py-3 text-center text-sm hover:border-accent"
            >
              Add Your Own Submission
            </Link>
          </div>
        </div>
      </div>

      {recent.length > 0 && (
        <div className="mt-14">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recently Added</h2>
            <Link href="/search" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((item) => (
              <LatmiyyahCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}