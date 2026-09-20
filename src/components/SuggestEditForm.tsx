"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Latmiyyah } from "@/lib/types";

const FIELDS: { key: keyof Latmiyyah; label: string }[] = [
  { key: "title", label: "Title" },
  { key: "arabic_title", label: "Arabic title" },
  { key: "reciter", label: "Reciter" },
  { key: "poet", label: "Poet" },
  { key: "arabic_text", label: "Arabic lyrics" },
  { key: "english_translation", label: "English translation" },
];

export default function SuggestEditForm({ latmiyyah }: { latmiyyah: Latmiyyah }) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [field, setField] = useState<string>("title");
  const [suggestedValue, setSuggestedValue] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const currentValue = (latmiyyah as any)[field] ?? null;
    const { error } = await supabase.from("edit_suggestions").insert({
      latmiyyah_id: latmiyyah.id,
      field,
      current_value: currentValue,
      suggested_value: suggestedValue,
      note: note || null,
    });
    setStatus(error ? "error" : "done");
  }

  if (status === "done") {
    return <p className="mt-8 text-sm text-muted">Thanks - your suggestion has been sent for review.</p>;
  }

  return (
    <div className="mt-12 border-t border-border pt-6">
      {!open ? (
        <button onClick={() => setOpen(true)} className="text-sm text-accent hover:underline">
          Suggest an Edit
        </button>
      ) : (
        <form onSubmit={submit} className="space-y-3 rounded-lg border border-border bg-surface p-4">
          <h3 className="font-medium">Suggest an Edit</h3>
          <label className="block text-sm">
            Field
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="mt-1 w-full rounded border border-border bg-bg px-2 py-1.5"
            >
              {FIELDS.map((f) => (
                <option key={f.key} value={f.key}>{f.label}</option>
              ))}
            </select>
          </label>
          <div className="rounded border border-border bg-bg p-2 text-sm text-muted">
            <span className="font-medium">Current: </span>
            {String((latmiyyah as any)[field] || "—").slice(0, 200)}
          </div>
          <label className="block text-sm">
            Suggested value
            <textarea
              required
              value={suggestedValue}
              onChange={(e) => setSuggestedValue(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded border border-border bg-bg px-2 py-1.5"
            />
          </label>
          <label className="block text-sm">
            Notes (optional)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded border border-border bg-bg px-2 py-1.5"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={status === "saving"}
              className="rounded bg-accent px-4 py-1.5 text-sm text-accentFg disabled:opacity-60"
            >
              {status === "saving" ? "Sending..." : "Send Suggestion"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted">
              Cancel
            </button>
          </div>
          {status === "error" && <p className="text-sm text-red-500">Something went wrong - please try again.</p>}
        </form>
      )}
    </div>
  );
}
