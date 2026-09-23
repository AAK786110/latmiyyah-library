"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Tag } from "@/lib/types";

type Step =
  | "start"
  | "personality"
  | "context"
  | "speed"
  | "reciter";

type ExploreVariant =
  | "plain"
  | "soft"
  | "accent"
  | "warm";

export default function ExplorePage() {
  const supabase = createClient();

  const [step, setStep] =
    useState<Step>("start");

  const [tags, setTags] = useState<Tag[]>([]);
  const [reciters, setReciters] =
    useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const { data: tagRows } =
        await supabase
          .from("tags")
          .select("*")
          .order("name");

      setTags(tagRows || []);

      const { data: rows } =
        await supabase
          .from("latmiyyahs")
          .select("reciter")
          .eq("status", "published");

      setReciters(
        Array.from(
          new Set(
            (rows || [])
              .map((r: any) => r.reciter)
              .filter(Boolean)
          )
        ).sort()
      );
    }

    load();
  }, [supabase]);

  const personalities = tags.filter(
    (t) =>
      t.category === "holy_personality"
  );

  const contexts = tags.filter(
    (t) => t.category === "context"
  );

  const speeds = tags.filter(
    (t) => t.category === "speed"
  );

  return (
    <div className="mx-auto max-w-5xl">
      {step === "start" && (
        <ExploreStart
          onChoose={setStep}
        />
      )}

      {step === "personality" && (
        <TagGrid
          eyebrow="Explore the archive"
          title="By Holy Personality"
          description="Find latmiyyahs connected to the personalities of the Ahl al-Bayt and those remembered alongside them."
          tags={personalities}
          onBack={() =>
            setStep("start")
          }
        />
      )}

      {step === "context" && (
        <TagGrid
          eyebrow="Explore the archive"
          title="By Context"
          description="Browse by occasion, event, remembrance or setting."
          tags={contexts}
          onBack={() =>
            setStep("start")
          }
        />
      )}

      {step === "speed" && (
        <TagGrid
          eyebrow="Explore the archive"
          title="By Style"
          description="Discover pieces by their style, pace and character."
          tags={speeds}
          onBack={() =>
            setStep("start")
          }
        />
      )}

      {step === "reciter" && (
        <ReciterGrid
          reciters={reciters}
          onBack={() =>
            setStep("start")
          }
        />
      )}
    </div>
  );
}

function ExploreStart({
  onChoose,
}: {
  onChoose: (step: Step) => void;
}) {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border pb-5 pt-2 sm:pb-6 sm:pt-3">
        <p className="mb-2 text-[0.62rem] font-medium uppercase tracking-[0.26em] text-muted">
          Explore the archive
        </p>

        <div className="grid gap-3 lg:grid-cols-[1.3fr_0.7fr] lg:items-end lg:gap-8">
          <div>
            <h1 className="max-w-3xl font-display text-[2rem] font-medium leading-[1.02] tracking-[-0.035em] sm:text-[2.65rem] lg:text-[3.35rem]">
              Find a Latmiyyah suited <br />
              <span className="text-accent">
                {" "}
                for you:
              </span>
            </h1>
          </div>

          
        </div>
      </section>

      {/* Random */}
      <section className="py-4 sm:py-5">
        <Link
          href="/random"
          className="group flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_10px_28px_rgba(70,45,30,0.05)] sm:px-5 sm:py-4"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-bg text-accent">
              <ShuffleIcon />
            </span>

            <div>
              <p className="font-display text-lg font-medium sm:text-xl">
                Choose a random
                latmiyyah
              </p>

              
            </div>
          </div>

          <span className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent">
            <ArrowIcon />
          </span>
        </Link>
      </section>

      {/* Explore options */}
      <section className="pb-6">
        <div className="mb-3">
          

          <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
            What are you looking for?
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-border">
          <div className="grid sm:grid-cols-2">
            <ExploreOption
              number="01"
              title="Holy Personality"
              description="Discover latmiyyahs/nasheeds connected to a specific personality."
              icon={<PersonIcon />}
              variant="plain"
              onClick={() =>
                onChoose("personality")
              }
            />

            <ExploreOption
              number="02"
              title="Context"
              description="Browse by occasion, remembrance or event."
              icon={<ContextIcon />}
              variant="soft"
              onClick={() =>
                onChoose("context")
              }
            />

            <ExploreOption
              number="03"
              title="Style / Speed"
              description="Explore by the character and pace of the recitation."
              icon={<WaveIcon />}
              variant="plain"
              onClick={() =>
                onChoose("speed")
              }
            />

            <ExploreOption
              number="04"
              title="Reciter"
              description="Find everything available from a particular reciter."
              icon={<MicIcon />}
              variant="soft"
              onClick={() =>
                onChoose("reciter")
              }
            />
          </div>
        </div>

        <div className="mt-5 text-center">
          <Link
            href="/search"
            className="group inline-flex items-center gap-1.5 text-xs text-accent sm:text-sm"
          >
            Want more control? Use
            advanced filters

            <span className="transition-transform group-hover:translate-x-1">
              <ArrowIcon />
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}

function ExploreOption({
  number,
  title,
  description,
  icon,
  variant,
  onClick,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  variant: ExploreVariant;
  onClick: () => void;
}) {
  const variantClasses: Record<
    ExploreVariant,
    string
  > = {
    plain:
      "bg-surface text-fg hover:bg-bg",
    soft:
      "bg-bg text-fg hover:bg-surface",
    warm:
      "bg-accent/[0.04] text-fg hover:bg-accent/[0.07]",
    accent:
      "bg-accent text-accentFg hover:bg-accent/95",
  };

  const mutedClasses: Record<
    ExploreVariant,
    string
  > = {
    plain: "text-muted",
    soft: "text-muted",
    warm: "text-muted",
    accent: "text-accentFg/70",
  };

  const iconClasses: Record<
    ExploreVariant,
    string
  > = {
    plain:
      "border-border bg-bg text-accent",
    soft:
      "border-border bg-surface text-accent",
    warm:
      "border-accent/20 bg-accent/10 text-accent",
    accent:
      "border-white/15 bg-white/10 text-accentFg",
  };

  const arrowClasses: Record<
    ExploreVariant,
    string
  > = {
    plain:
      "text-muted group-hover:text-accent",
    soft:
      "text-muted group-hover:text-accent",
    warm:
      "text-accent/70 group-hover:text-accent",
    accent:
      "text-accentFg/70 group-hover:text-accentFg",
  };

  return (
    <button
      onClick={onClick}
      className={`group relative min-h-[138px] border-b border-border p-4 text-left transition-all sm:min-h-[155px] sm:p-5 sm:odd:border-r ${variantClasses[variant]}`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`text-[0.65rem] font-medium tracking-[0.24em] ${mutedClasses[variant]}`}
        >
          {number}
        </span>

        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full border ${iconClasses[variant]}`}
        >
          {icon}
        </span>
      </div>

      <div className="mt-5">
        <h3 className="font-display text-[1.3rem] font-semibold leading-tight tracking-[-0.02em] sm:text-[1.45rem]">
          {title}
        </h3>

        <div className="mt-2 flex items-end justify-between gap-3">
          <p
            className={`max-w-[17rem] text-xs leading-5 ${mutedClasses[variant]}`}
          >
            {description}
          </p>

          <span
            className={`mb-1 shrink-0 transition-transform group-hover:translate-x-1 ${arrowClasses[variant]}`}
          >
            <ArrowIcon />
          </span>
        </div>
      </div>
    </button>
  );
}

function TagGrid({
  eyebrow,
  title,
  description,
  tags,
  onBack,
}: {
  eyebrow: string;
  title: string;
  description: string;
  tags: Tag[];
  onBack: () => void;
}) {
  return (
    <div className="pt-2 sm:pt-3">
      <button
        onClick={onBack}
        className="group mb-5 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
      >
        <span className="transition-transform group-hover:-translate-x-1">
          ←
        </span>
        Back to Explore
      </button>

      <div className="border-b border-border pb-5 sm:pb-6">
        <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.24em] text-muted">
          {eyebrow}
        </p>

        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
          {title}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          {description}
        </p>
      </div>

      <div className="grid border-t border-border sm:grid-cols-2 lg:grid-cols-3">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/explore/${tag.category}/${tag.slug}`}
            className="group flex min-h-[88px] items-end justify-between border-b border-border px-1 py-4 transition-colors hover:bg-surface hover:text-accent sm:px-4 sm:py-4"
          >
            <span className="font-display text-lg font-medium">
              {tag.name}
            </span>

            <span className="shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent">
              <ArrowIcon />
            </span>
          </Link>
        ))}

        {tags.length === 0 && (
          <p className="col-span-full py-10 text-center text-muted">
            No options yet.
          </p>
        )}
      </div>
    </div>
  );
}

function ReciterGrid({
  reciters,
  onBack,
}: {
  reciters: string[];
  onBack: () => void;
}) {
  return (
    <div className="pt-2 sm:pt-3">
      <button
        onClick={onBack}
        className="group mb-5 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
      >
        <span className="transition-transform group-hover:-translate-x-1">
          ←
        </span>
        Back to Explore
      </button>

      <div className="border-b border-border pb-5 sm:pb-6">
        <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.24em] text-muted">
          Explore the archive
        </p>

        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
          By Reciter
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Browse the pieces currently
          available from each reciter
          in the Vault.
        </p>
      </div>

      <div className="grid border-t border-border sm:grid-cols-2 lg:grid-cols-3">
        {reciters.map((reciter) => (
          <Link
            key={reciter}
            href={`/explore/reciter/${encodeURIComponent(
              reciter
            )}`}
            className="group flex min-h-[88px] items-end justify-between border-b border-border px-1 py-4 transition-colors hover:bg-surface hover:text-accent sm:px-4 sm:py-4"
          >
            <span className="font-display text-lg font-medium">
              {reciter}
            </span>

            <span className="shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent">
              <ArrowIcon />
            </span>
          </Link>
        ))}
      </div>
    </div>
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

function ShuffleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
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

function PersonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="3.5"
      />
      <path d="M5.5 20c.8-4 3-6 6.5-6s5.7 2 6.5 6" />
    </svg>
  );
}

function ContextIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
      />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M3 12h2l2-5 3 10 3-13 3 15 2-7h3" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect
        x="9"
        y="3"
        width="6"
        height="11"
        rx="3"
      />
      <path d="M6.5 11.5a5.5 5.5 0 0 0 11 0" />
      <path d="M12 17v4" />
      <path d="M9 21h6" />
    </svg>
  );
}