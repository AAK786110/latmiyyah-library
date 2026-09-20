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

export default function SuggestEditForm({
  latmiyyah,
}: {
  latmiyyah: Latmiyyah;
}) {
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [field, setField] = useState<string>("title");

  const getCurrentValue = (selectedField: string) =>
    String((latmiyyah as any)[selectedField] ?? "");

  const [suggestedValue, setSuggestedValue] = useState(
    getCurrentValue("title")
  );

  const [note, setNote] = useState("");

  const [status, setStatus] = useState<
    "idle" | "saving" | "done" | "error" | "unchanged"
  >("idle");

  const selectedField =
    FIELDS.find((f) => f.key === field)?.label || "Field";

  const isLongField =
    field === "arabic_text" || field === "english_translation";

  function handleFieldChange(newField: string) {
    setField(newField);
    setSuggestedValue(getCurrentValue(newField));
    setStatus("idle");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const currentValue = getCurrentValue(field);

    if (suggestedValue.trim() === currentValue.trim()) {
      setStatus("unchanged");
      return;
    }

    setStatus("saving");

    const { error } = await supabase.from("edit_suggestions").insert({
      latmiyyah_id: latmiyyah.id,
      field,
      current_value: currentValue || null,
      suggested_value: suggestedValue,
      note: note || null,
    });

    setStatus(error ? "error" : "done");
  }

  if (status === "done") {
    return (
      <div className="mt-10 border-t border-border pt-6">
        <p className="text-sm text-muted">
          Thanks — your suggestion has been sent for review.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 border-t border-border pt-6">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-sm font-medium text-accent hover:underline"
        >
          Suggest an Edit
        </button>
      ) : (
        <form
          onSubmit={submit}
          className="space-y-5 rounded-xl border border-border bg-surface p-5"
        >
          <div>
            <h3 className="text-lg font-semibold">Suggest an Edit</h3>
            <p className="mt-1 text-sm text-muted">
              Spotted a mistake? Select what you would like to correct below.
            </p>
          </div>

          <label className="block text-sm font-medium">
            What would you like to edit?
            <select
              value={field}
              onChange={(e) => handleFieldChange(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2"
            >
              {FIELDS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          <div>
            <p className="mb-2 text-sm font-medium">
              Current {selectedField.toLowerCase()}
            </p>

            <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-bg p-3 text-sm text-muted">
              {getCurrentValue(field) || "—"}
            </div>
          </div>

          <label className="block text-sm font-medium">
            Your corrected version
            <textarea
              required
              value={suggestedValue}
              onChange={(e) => {
                setSuggestedValue(e.target.value);
                setStatus("idle");
              }}
              rows={isLongField ? 10 : 4}
              className="mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2"
            />
          </label>

          <label className="block text-sm font-medium">
            Reason or notes
            <span className="ml-1 font-normal text-muted">(optional)</span>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Anything else we should know?"
              className="mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2"
            />
          </label>

          {status === "unchanged" && (
            <p className="text-sm text-red-500">
              Your correction is the same as the current version.
            </p>
          )}

          {status === "error" && (
            <p className="text-sm text-red-500">
              Something went wrong — please try again.
            </p>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={status === "saving"}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accentFg disabled:opacity-60"
            >
              {status === "saving" ? "Sending..." : "Send Suggestion"}
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setStatus("idle");
              }}
              className="text-sm text-muted hover:text-fg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}