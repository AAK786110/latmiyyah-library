"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { EditSuggestion } from "@/lib/types";

export default function EditSuggestionsPage() {
  const ready = useRequireAuth();
  const supabase = createClient();
  const [items, setItems] = useState<(EditSuggestion & { latmiyyah_title?: string })[]>([]);

  async function load() {
    const { data } = await supabase
      .from("edit_suggestions")
      .select("*, latmiyyahs(title)")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setItems((data || []).map((d: any) => ({ ...d, latmiyyah_title: d.latmiyyahs?.title })));
  }

  useEffect(() => {
    if (ready) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  async function reject(sug: EditSuggestion) {
    await supabase.from("edit_suggestions").update({ status: "rejected" }).eq("id", sug.id);
    load();
  }

  async function approve(sug: EditSuggestion) {
    await supabase.from("latmiyyahs").update({ [sug.field]: sug.suggested_value }).eq("id", sug.latmiyyah_id);
    await supabase.from("edit_suggestions").update({ status: "approved" }).eq("id", sug.id);
    load();
  }

  if (!ready) return null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Suggested Edits</h1>
      {items.length === 0 && <p className="text-muted">No pending suggestions.</p>}
      <div className="space-y-3">
        {items.map((sug) => (
          <div key={sug.id} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm text-muted">
              On <span className="font-medium text-text">{sug.latmiyyah_title || "Unknown"}</span> - field: <span className="font-mono">{sug.field}</span>
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div className="rounded border border-border bg-bg p-2 text-sm">
                <p className="mb-1 text-xs font-medium text-muted">Current</p>
                <p className="whitespace-pre-wrap">{sug.current_value || "—"}</p>
              </div>
              <div className="rounded border border-accent/40 bg-accent/10 p-2 text-sm">
                <p className="mb-1 text-xs font-medium text-muted">Suggested</p>
                <p className="whitespace-pre-wrap">{sug.suggested_value}</p>
              </div>
            </div>
            {sug.note && <p className="mt-2 text-sm text-muted">Note: {sug.note}</p>}
            <div className="mt-3 flex gap-2">
              <button onClick={() => approve(sug)} className="rounded bg-accent px-3 py-1.5 text-sm text-accentFg">
                Approve
              </button>
              <button onClick={() => reject(sug)} className="rounded border border-border px-3 py-1.5 text-sm">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
