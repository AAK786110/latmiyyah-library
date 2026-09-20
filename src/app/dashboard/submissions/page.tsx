"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { Submission } from "@/lib/types";

function slugify(input: string): string {
  return input.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export default function SubmissionsPage() {
  const ready = useRequireAuth();
  const supabase = createClient();
  const router = useRouter();
  const [items, setItems] = useState<Submission[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from("submissions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setItems(data || []);
  }

  useEffect(() => {
    if (ready) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  async function reject(sub: Submission) {
    await supabase.from("submissions").update({ status: "rejected" }).eq("id", sub.id);
    load();
  }

  async function approveAndPublish(sub: Submission) {
    const slug = slugify(sub.title) || `latmiyyah-${Date.now()}`;
    const { error } = await supabase.from("latmiyyahs").insert({
      title: sub.title,
      arabic_title: sub.arabic_title,
      reciter: sub.reciter || "Unknown",
      poet: sub.poet,
      arabic_text: sub.arabic_text || "",
      english_translation: sub.english_translation || "",
      status: "draft", // opens as draft so the creator can tag + verify alignment before publishing
      slug,
    });
    if (!error) {
      await supabase.from("submissions").update({ status: "approved" }).eq("id", sub.id);
      load();
      router.push("/dashboard");
    }
  }

  if (!ready) return null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">User Submissions</h1>
      {items.length === 0 && <p className="text-muted">No pending submissions.</p>}
      <div className="space-y-3">
        {items.map((sub) => (
          <div key={sub.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{sub.title}</p>
                <p className="text-sm text-muted">{sub.reciter || "No reciter given"} {sub.poet ? `· ${sub.poet}` : ""}</p>
              </div>
              <button
                onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}
                className="text-sm text-accent hover:underline"
              >
                {expanded === sub.id ? "Hide" : "Preview"}
              </button>
            </div>

            {expanded === sub.id && (
              <div className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
                {sub.arabic_title && <p className="arabic-text">{sub.arabic_title}</p>}
                {sub.arabic_text && (
                  <div>
                    <p className="text-xs font-medium text-muted">Arabic lyrics</p>
                    <p className="arabic-text whitespace-pre-wrap">{sub.arabic_text}</p>
                  </div>
                )}
                {sub.english_translation && (
                  <div>
                    <p className="text-xs font-medium text-muted">English translation</p>
                    <p className="whitespace-pre-wrap">{sub.english_translation}</p>
                  </div>
                )}
                {sub.proposed_tags && (
                  <p><span className="text-xs font-medium text-muted">Proposed tags: </span>{sub.proposed_tags}</p>
                )}
                {sub.notes && <p><span className="text-xs font-medium text-muted">Notes: </span>{sub.notes}</p>}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => approveAndPublish(sub)}
                className="rounded bg-accent px-3 py-1.5 text-sm text-accentFg"
              >
                Approve → Create Draft
              </button>
              <button onClick={() => reject(sub)} className="rounded border border-border px-3 py-1.5 text-sm">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
