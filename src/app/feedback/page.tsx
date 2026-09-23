"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const TYPES = [
  { value: "suggestion", label: "Suggestion" },
  { value: "report", label: "Report a problem" },
  { value: "incorrect_information", label: "Incorrect information" },
  { value: "missing_latmiyyah", label: "Missing latmiyyah" },
  { value: "website_issue", label: "Website issue" },
  { value: "other", label: "Other" },
];

export default function FeedbackPage() {
  const supabase = createClient();

  const [type, setType] = useState("suggestion");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [status, setStatus] = useState<
    "idle" | "saving" | "done" | "error"
  >("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setStatus("saving");

    const { error } = await supabase.from("feedback").insert({
      type,
      subject,
      message,
      contact_email: contactEmail.trim() || null,
    });

    if (error) {
      console.error(error);
      setStatus("error");
      return;
    }

    setStatus("done");
    setSubject("");
    setMessage("");
    setContactEmail("");
    setType("suggestion");
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-border bg-surface px-6 py-12 text-center shadow-[0_18px_50px_rgba(70,45,30,0.05)] sm:px-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
            <CheckIcon />
          </div>

          <p className="mt-5 text-[0.65rem] font-medium uppercase tracking-[0.24em] text-muted">
            Feedback received
          </p>

          <h1 className="mt-2 font-display text-4xl font-medium tracking-[-0.03em]">
            Thank you.
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
            Your feedback has been sent successfully and will be reviewed.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setStatus("idle")}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accentFg"
            >
              Send another
            </button>

            <Link
              href="/explore"
              className="rounded-xl border border-border bg-bg px-4 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            >
              Explore the Vault
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:gap-10">
        {/* Left intro */}
        <div className="lg:pt-2">
          <p className="mb-3 text-[0.65rem] font-medium uppercase tracking-[0.24em] text-muted">
            Help improve the Vault
          </p>

          <h1 className="max-w-xl font-display text-4xl font-medium leading-[1.02] tracking-[-0.035em] sm:text-5xl">
            Suggestions,
            <br />
            <span className="text-accent">corrections & reports.</span>
          </h1>

          <p className="mt-4 max-w-md text-sm leading-6 text-muted sm:text-base sm:leading-7">
            Spotted an issue, noticed something missing, or have an idea for the site?
            Send it here.
          </p>

          <div className="mt-7 hidden border-t border-border pt-5 text-sm text-muted lg:block">
            <p className="leading-6">
              For corrections to a specific latmiyyah, you can also use the
              suggest-edit option directly on that page.
            </p>
          </div>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-border bg-surface p-5 shadow-[0_18px_50px_rgba(70,45,30,0.05)] sm:p-7"
        >
          <div className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">
                Type
              </span>

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-3 text-sm outline-none transition-colors focus:border-accent"
              >
                {TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">
                Subject
              </span>

              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Briefly describe your feedback"
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">
                Details
              </span>

              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={7}
                placeholder="Tell us what you noticed or what you would like to suggest."
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-3 text-sm leading-6 outline-none transition-colors placeholder:text-muted focus:border-accent"
              />
            </label>

            <label className="block">
              <div className="mb-1.5 flex items-center gap-1">
                <span className="text-sm font-medium">
                  Email
                </span>
                <span className="text-xs text-muted">
                  optional
                </span>
              </div>

              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Only if you'd like us to contact you"
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
              />
            </label>

            {status === "error" && (
              <p className="text-sm text-red-500">
                Something went wrong. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "saving"}
              className="group flex w-full items-center justify-between rounded-xl bg-accent px-5 py-3.5 font-medium text-accentFg transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(100,35,35,0.12)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                {status === "saving" ? "Sending..." : "Send Feedback"}
              </span>

              <span className="transition-transform group-hover:translate-x-1">
                <ArrowIcon />
              </span>
            </button>
          </div>
        </form>
      </section>
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
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </svg>
  );
}