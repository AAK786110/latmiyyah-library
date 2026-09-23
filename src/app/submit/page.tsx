"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SubmitPage() {
  const supabase = createClient();
  const [form, setForm] = useState({
    title: "",
    arabic_title: "",
    reciter: "",
    poet: "",
    arabic_text: "",
    english_translation: "",
    proposed_tags: "",
    notes: "",
    // Honeypot field - real users never fill this in; bots that
    // auto-fill every input will, and we silently drop those submissions.
    website: "",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot check - a real visitor never sees or fills this field.
    if (form.website.trim() !== "") {
      setStatus("done"); // pretend success so bots don't learn anything
      return;
    }

    setStatus("saving");
    const { website, ...payload } = form;
    const { error } = await supabase.from("submissions").insert(payload);
    setStatus(error ? "error" : "done");
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-semibold">Thank you</h1>
        <p className="mt-2 text-muted">
          Your submission has been sent for review. It will not appear on the site until it's approved.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold">Add Your Own Submission</h1>
      <p className="mt-1 text-sm text-muted">
        Submissions are reviewed before they're published - this won't go live automatically.
        You don't need to fill in every field, but the more information you provide, the easier it is for us to review and approve your submission.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {/* Honeypot - visually hidden, not just display:none, to fool more bots */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label>
            Leave this blank
            <input
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
            />
          </label>
        </div>

        <Field label="Title" required value={form.title} onChange={(v) => update("title", v)} />
        <Field label="Arabic title" value={form.arabic_title} onChange={(v) => update("arabic_title", v)} />
        <Field label="Reciter" value={form.reciter} onChange={(v) => update("reciter", v)} />
        <Field label="Poet" value={form.poet} onChange={(v) => update("poet", v)} />
        <TextArea label="Arabic lyrics" value={form.arabic_text} onChange={(v) => update("arabic_text", v)} arabic />
        <TextArea label="English translation" value={form.english_translation} onChange={(v) => update("english_translation", v)} />
        <Field label="Proposed tags (comma separated)" value={form.proposed_tags} onChange={(v) => update("proposed_tags", v)} />
        <TextArea label="Notes" value={form.notes} onChange={(v) => update("notes", v)} rows={3} />

        <button
          type="submit"
          disabled={status === "saving"}
          className="w-full rounded bg-accent py-2.5 font-medium text-accentFg disabled:opacity-60"
        >
          {status === "saving" ? "Submitting..." : "Submit for Review"}
        </button>
        {status === "error" && <p className="text-sm text-red-500">Something went wrong - please try again.</p>}
      </form>
    </div>
  );
}

function Field({
  label, value, onChange, required,
}: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label className="block text-sm">
      {label}
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
      />
    </label>
  );
}

function TextArea({
  label, value, onChange, rows = 6, arabic,
}: { label: string; value: string; onChange: (v: string) => void; rows?: number; arabic?: boolean }) {
  return (
    <label className="block text-sm">
      {label}
      <textarea
        dir={arabic ? "rtl" : "ltr"}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded border border-border bg-surface px-3 py-2 ${arabic ? "arabic-text" : ""}`}
      />
    </label>
  );
}
