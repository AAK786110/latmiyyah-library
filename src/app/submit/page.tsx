"use client";

import { useState } from "react";
import Link from "next/link";
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
    website: "",
  });

  const [status, setStatus] = useState<
    "idle" | "saving" | "done" | "error"
  >("idle");

  function update<K extends keyof typeof form>(
    key: K,
    value: string
  ) {
    setForm((f) => ({
      ...f,
      [key]: value,
    }));
  }

  async function submit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (form.website.trim() !== "") {
      setStatus("done");
      return;
    }

    setStatus("saving");

    const { website, ...payload } = form;

    const { error } = await supabase
      .from("submissions")
      .insert(payload);

    setStatus(
      error ? "error" : "done"
    );
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-3xl">
        <section className="pt-4">
          <div className="rounded-2xl border border-border bg-surface px-6 py-10 text-center sm:px-10 sm:py-12">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-border bg-bg text-accent">
              <CheckIcon />
            </div>

            <p className="mt-5 text-[0.65rem] font-medium uppercase tracking-[0.24em] text-muted">
              Submission received
            </p>

            <h1 className="mt-2 font-display text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
              Thank you
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">
              Your submission has been sent for review. It will only appear on the site once it has been checked and approved.
            </p>

            <Link
              href="/explore"
              className="mt-6 inline-flex items-center gap-2 text-sm text-accent"
            >
              Explore the Vault
              <ArrowIcon />
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Heading */}
      <section className="border-b border-border pb-6 pt-2 sm:pb-8 sm:pt-4">
        <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.24em] text-muted">
          Contribute to the archive
        </p>

        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
          Add Your Own Submission
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Submissions are reviewed before publication. You do not need to complete every field, but more detail makes the review process easier.
        </p>
      </section>

      <form
        onSubmit={submit}
        className="py-6"
      >
        {/* Honeypot */}
        <div
          className="absolute -left-[9999px]"
          aria-hidden="true"
        >
          <label>
            Leave this blank
            <input
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) =>
                update(
                  "website",
                  e.target.value
                )
              }
            />
          </label>
        </div>

        {/* Basic details */}
        <FormSection
          eyebrow="01"
          title="Basic Details"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Title"
              required
              value={form.title}
              onChange={(v) =>
                update("title", v)
              }
            />

            <Field
              label="Arabic title"
              value={form.arabic_title}
              onChange={(v) =>
                update(
                  "arabic_title",
                  v
                )
              }
            />

            <Field
              label="Reciter"
              value={form.reciter}
              onChange={(v) =>
                update("reciter", v)
              }
            />

            <Field
              label="Poet"
              value={form.poet}
              onChange={(v) =>
                update("poet", v)
              }
            />
          </div>
        </FormSection>

        {/* Text */}
        <FormSection
          eyebrow="02"
          title="Lyrics & Translation"
        >
          <div className="space-y-4">
            <TextArea
              label="Arabic lyrics"
              value={form.arabic_text}
              onChange={(v) =>
                update(
                  "arabic_text",
                  v
                )
              }
              arabic
            />

            <TextArea
              label="English translation"
              value={
                form.english_translation
              }
              onChange={(v) =>
                update(
                  "english_translation",
                  v
                )
              }
            />
          </div>
        </FormSection>

        {/* Extra details */}
        <FormSection
          eyebrow="03"
          title="Additional Information"
        >
          <div className="space-y-4">
            <Field
              label="Proposed tags"
              hint="Separate multiple tags with commas"
              value={form.proposed_tags}
              onChange={(v) =>
                update(
                  "proposed_tags",
                  v
                )
              }
            />

            <TextArea
              label="Notes"
              hint="Anything else that may help us review the submission"
              value={form.notes}
              onChange={(v) =>
                update("notes", v)
              }
              rows={3}
            />
          </div>
        </FormSection>

        {/* Submit */}
        <div className="border-t border-border pt-6">
          <button
            type="submit"
            disabled={status === "saving"}
            className="group flex w-full items-center justify-between rounded-xl bg-accent px-5 py-3.5 font-medium text-accentFg transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(100,35,35,0.12)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>
              {status === "saving"
                ? "Submitting..."
                : "Submit for Review"}
            </span>

            <span className="transition-transform group-hover:translate-x-1">
              <ArrowIcon />
            </span>
          </button>

          {status === "error" && (
            <p className="mt-3 text-sm text-red-500">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

function FormSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border py-6">
      <div className="mb-4">
        <p className="text-[0.62rem] font-medium uppercase tracking-[0.22em] text-muted">
          {eyebrow}
        </p>

        <h2 className="mt-1 font-display text-xl font-medium">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-sm font-medium">
          {label}
          {required && (
            <span className="ml-1 text-accent">
              *
            </span>
          )}
        </span>
      </div>

      <input
        required={required}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
      />

      {hint && (
        <p className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 6,
  arabic,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  arabic?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">
        {label}
      </span>

      <textarea
        dir={arabic ? "rtl" : "ltr"}
        rows={rows}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className={`w-full rounded-xl border border-border bg-surface px-3.5 py-3 outline-none transition-colors focus:border-accent ${
          arabic
            ? "arabic-text"
            : "text-sm leading-6"
        }`}
      />

      {hint && (
        <p className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
    </label>
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

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </svg>
  );
}