"use client";

import { useState } from "react";
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

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Suggestions & Reports
        </h1>

        <p className="mt-2 text-muted">
          Have an idea, spotted an issue, or noticed something missing?
          Send it here.
        </p>
      </div>

      {status === "done" ? (
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold">
            Thank you
          </h2>

          <p className="mt-2 text-sm text-muted">
            Your feedback has been sent successfully.
          </p>

          <button
            onClick={() => setStatus("idle")}
            className="mt-5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accentFg"
          >
            Send another
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-border bg-surface p-5"
        >
          <label className="block text-sm font-medium">
            Type
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2"
            >
              {TYPES.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium">
            Subject
            <input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Briefly describe your feedback"
              className="mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2"
            />
          </label>

          <label className="block text-sm font-medium">
            Details
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              placeholder="Tell us what you noticed or what you would like to suggest."
              className="mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2"
            />
          </label>

          <label className="block text-sm font-medium">
            Email
            <span className="ml-1 font-normal text-muted">
              (optional)
            </span>

            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Only if you'd like us to contact you"
              className="mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2"
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
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accentFg disabled:opacity-60"
          >
            {status === "saving" ? "Sending..." : "Send Feedback"}
          </button>
        </form>
      )}
    </div>
  );
}