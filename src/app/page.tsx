import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import LatmiyyahCard from "@/components/LatmiyyahCard";
import type { Latmiyyah } from "@/lib/types";

const SITE_URL = "https://latmiyyahvault.com";

export const dynamic = "force-dynamic";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHomepageLatmiyyahs() {
  const supabase = createServerSupabaseClient();

  const runQuery = async () =>
    supabase
      .from("latmiyyahs")
      .select("*, tags:latmiyyah_tags(tag:tags(*))", {
        count: "exact",
      })
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(50);

  let result = await runQuery();

  if (result.error) {
    console.warn(
      "Homepage latmiyyah fetch failed. Retrying...",
      result.error
    );

    await wait(500);
    result = await runQuery();
  }

  if (result.error) {
    console.error(
      "Homepage latmiyyah fetch failed after retry:",
      result.error
    );

    return {
      recent: [] as Latmiyyah[],
      count: null as number | null,
      failed: true,
    };
  }

  const recent: Latmiyyah[] = (result.data || []).map(
    (r: any) => ({
      ...r,
      tags: (r.tags || [])
        .map((t: any) => t.tag)
        .filter(Boolean),
    })
  );

  return {
    recent,
    count: result.count ?? recent.length,
    failed: false,
  };
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M4 6h10M18 6h2M4 12h3M11 12h9M4 18h8M16 18h4" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="14" cy="18" r="2" />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M4 7h3c5 0 5 10 10 10h3" />
      <path d="m17 14 3 3-3 3" />
      <path d="M4 17h3c2.5 0 3.8-2.5 5-5" />
      <path d="M14 7c1-1.5 2-2 3-2h3" />
      <path d="m17 2 3 3-3 3" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M4 5.5c2.7-.7 5.3-.2 8 1.5v12c-2.7-1.7-5.3-2.2-8-1.5Z" />
      <path d="M20 5.5c-2.7-.7-5.3-.2-8 1.5v12c2.7-1.7 5.3-2.2 8-1.5Z" />
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
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </svg>
  );
}

export default async function HomePage() {
  const {
    recent,
    count: latmiyyahCount,
    failed,
  } = await fetchHomepageLatmiyyahs();

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "Latmiyyah Vault",
    description:
      "A searchable archive of Shia latmiyyahs and nasheeds with original Arabic lyrics, English translations, reciters, poets, and videos.",
    inLanguage: ["en", "ar"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            websiteStructuredData
          ).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto -mt-8 max-w-6xl sm:-mt-6">
        {/* Hero */}
<section className="relative border-b border-border pb-4 pt-4 sm:pb-9 sm:pt-6 lg:pb-11 lg:pt-5">
          <div className="relative z-10 mx-auto max-w-5xl text-center">
  <div className="mb-6 flex items-center justify-center gap-2 whitespace-nowrap text-[0.5rem] font-medium uppercase tracking-[0.18em] text-muted sm:mb-5 sm:gap-3 sm:text-[0.62rem] sm:tracking-[0.24em]">
    <span>Arabic lyrics</span>
    <span className="h-px w-3 bg-border sm:w-5" />
    <span>English translations</span>
    <span className="h-px w-3 bg-border sm:w-5" />
    <span>Curated selections</span>
  </div>

  <h1 className="text-center font-display font-medium leading-[0.98] tracking-[-0.04em]">
  <span className="block text-[2.00rem] sm:text-[2.6rem] lg:text-[3.5rem]">
    A Vault of
  </span>

  <span className="block text-[2.65rem] text-accent sm:text-5xl lg:text-[4.5rem]">
    Latmiyyahs
  </span>

  <span className="block whitespace-nowrap text-[2.65rem] text-accent sm:text-5xl lg:text-[4.5rem]">
    &amp; Nasheeds
  </span>
</h1>
</div>

  {/* Search */}
  <form
    action="/search"
    className="relative z-20 mx-auto mt-5 max-w-5xl sm:mt-7 lg:mt-8"
  >
    <div className="flex items-center rounded-full border border-border bg-surface/95 p-1.5 shadow-[0_12px_35px_rgba(70,45,30,0.06)] backdrop-blur">
      <span className="ml-3 text-fg">
        <SearchIcon />
      </span>

      <input
        name="q"
        type="text"
        placeholder="Search by title, reciter, poet, or tag..."
        className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted sm:py-3 sm:text-base"
      />

      <button
        type="submit"
        aria-label="Search"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accentFg transition-transform hover:scale-[1.03] sm:h-11 sm:w-11"
      >
        <ArrowIcon />
      </button>
    </div>
  </form>
</section>

        {/* Main actions */}
        <section className="py-6 sm:py-9">
          <div className="grid gap-3">
            <Link
              href="/explore"
              className="group flex items-center justify-between rounded-2xl border border-accent bg-accent px-5 py-5 text-accentFg shadow-[0_12px_35px_rgba(100,35,35,0.10)] transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <BookIcon />
                </span>

                <div>
                  <div className="font-display text-xl font-medium sm:text-2xl">
                    Explore Latmiyyahs
                  </div>
                  <div className="mt-0.5 text-xs text-accentFg/70 sm:text-sm">
                    Browse the full archive
                  </div>
                </div>
              </div>

              <span className="transition-transform group-hover:translate-x-1">
                <ArrowIcon />
              </span>
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <ActionCard
                href="/search"
                title="Advanced Filters"
                subtitle="Search precisely"
                icon={<SlidersIcon />}
              />

              

              <ActionCard
                href="/favourites"
                title="Favourites"
                subtitle="Return to saved pieces"
                icon={<HeartIcon />}
              />

              
            </div>
          </div>

          {!failed && latmiyyahCount !== null && (
            <div className="mt-9 flex items-center justify-center gap-4">
              <span className="h-px w-12 bg-border sm:w-20" />

              <p className="font-display text-base text-accent sm:text-lg">
                {latmiyyahCount}{" "}
                {latmiyyahCount === 1
                  ? "Latmiyyah"
                  : "Latmiyyahs"}{" "}
                in the Vault
              </p>

              <span className="h-px w-12 bg-border sm:w-20" />
            </div>
          )}

          {failed && (
            <div className="mt-8 text-center">
              <p className="text-sm text-muted">
                The latest additions are temporarily
                unavailable. Search and explore are still
                available.
              </p>
            </div>
          )}
        </section>

        {/* Recently added */}
        {recent.length > 0 && (
          <section className="pb-14 pt-4">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="mb-1 text-[0.65rem] font-medium uppercase tracking-[0.24em] text-muted">
                  From the archive
                </p>

                <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
                  Recently Added
                </h2>
              </div>

              <Link
                href="/search"
                className="group flex items-center gap-1.5 text-sm text-accent"
              >
                View all
                <span className="transition-transform group-hover:translate-x-1">
                  <ArrowIcon />
                </span>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((item) => (
                <LatmiyyahCard
                  key={item.id}
                  item={item}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function ActionCard({
  href,
  title,
  subtitle,
  icon,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[84px] flex-col justify-between rounded-2xl border border-border bg-surface px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_10px_28px_rgba(70,45,30,0.05)] sm:min-h-[100px] sm:px-5 sm:py-4"    >
      <div className="flex items-start justify-between">
        <span className="text-accent">{icon}</span>

        <span className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent">
          <ArrowIcon />
        </span>
      </div>

      <div>
        <div className="font-display text-lg font-medium leading-tight sm:text-xl">
          {title}
        </div>

        <p className="mt-1 hidden text-xs text-muted sm:block">
          {subtitle}
        </p>
      </div>
    </Link>
  );
}