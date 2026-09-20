"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Tag } from "@/lib/types";

type Step = "start" | "personality" | "context" | "speed" | "reciter";

export default function ExplorePage() {
  const supabase = createClient();
  const [step, setStep] = useState<Step>("start");
  const [tags, setTags] = useState<Tag[]>([]);
  const [reciters, setReciters] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const { data: tagRows } = await supabase.from("tags").select("*").order("name");
      setTags(tagRows || []);
      const { data: rows } = await supabase
        .from("latmiyyahs")
        .select("reciter")
        .eq("status", "published");
      setReciters(Array.from(new Set((rows || []).map((r: any) => r.reciter))).sort());
    }
    load();
  }, [supabase]);

  const personalities = tags.filter((t) => t.category === "holy_personality");
  const contexts = tags.filter((t) => t.category === "context");
  const speeds = tags.filter((t) => t.category === "speed");

  return (
    <div className="mx-auto max-w-2xl text-center">
      {step === "start" && (
        <>
          <h1 className="text-2xl font-semibold">What are you looking for?</h1>
          <p className="mt-1 text-muted">Tap a category below to see everything that matches.</p>
          <div className="mt-6 grid gap-3">
            <BigButton onClick={() => setStep("personality")}>A Holy Personality</BigButton>
            <BigButton onClick={() => setStep("context")}>Context</BigButton>
            <BigButton onClick={() => setStep("speed")}>Style / Speed</BigButton>
            <BigButton onClick={() => setStep("reciter")}>A Reciter</BigButton>
          </div>
          <Link href="/search" className="mt-6 inline-block text-sm text-accent hover:underline">
            Want more control? Use advanced filters
          </Link>
        </>
      )}

      {step === "personality" && (
        <TagGrid title="By Holy Personality" tags={personalities} onBack={() => setStep("start")} />
      )}
      {step === "context" && (
        <TagGrid title="By Context" tags={contexts} onBack={() => setStep("start")} />
      )}
      {step === "speed" && (
        <TagGrid title="By Style" tags={speeds} onBack={() => setStep("start")} />
      )}
      {step === "reciter" && (
        <ReciterGrid reciters={reciters} onBack={() => setStep("start")} />
      )}
    </div>
  );
}

function BigButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-border bg-surface px-6 py-5 text-lg font-medium transition-colors hover:border-accent hover:text-accent"
    >
      {children}
    </button>
  );
}

function TagGrid({ title, tags, onBack }: { title: string; tags: Tag[]; onBack: () => void }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-muted hover:underline">← Back</button>
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="w-10" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/explore/${tag.category}/${tag.slug}`}
            className="rounded-lg border border-border bg-surface px-4 py-6 text-base font-medium transition-colors hover:border-accent hover:text-accent"
          >
            {tag.name}
          </Link>
        ))}
        {tags.length === 0 && <p className="col-span-full text-muted">No options yet.</p>}
      </div>
    </div>
  );
}

function ReciterGrid({ reciters, onBack }: { reciters: string[]; onBack: () => void }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-muted hover:underline">← Back</button>
        <h2 className="text-lg font-semibold">By Reciter</h2>
        <span className="w-10" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {reciters.slice(0, 12).map((r) => (
          <Link
            key={r}
            href={`/explore/reciter/${encodeURIComponent(r)}`}
            className="rounded-lg border border-border bg-surface px-4 py-6 text-base font-medium transition-colors hover:border-accent hover:text-accent"
          >
            {r}
          </Link>
        ))}
      </div>
    </div>
  );
}
