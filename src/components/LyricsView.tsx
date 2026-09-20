"use client";

import { useState } from "react";
import { parseStanzas } from "@/lib/types";

function isDivider(stanza: string[]) {
  return stanza.length === 1 && stanza[0].trim() === "***";
}

function RefrainDivider() {
  return (
    <div className="mx-auto flex max-w-md items-center gap-4 py-1">
      <div className="h-px flex-1 bg-border" />

      <span className="text-sm text-accent">✦</span>

      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export default function LyricsView({
  arabicText,
}: {
  arabicText: string;
}) {
  const [copied, setCopied] = useState(false);
  const stanzas = parseStanzas(arabicText);

  async function handleCopy() {
    const text = stanzas
      .map((stanza) => {
        if (isDivider(stanza)) {
          return "✦";
        }

        return stanza.join("\n");
      })
      .join("\n\n");

    await navigator.clipboard.writeText(text);

    setCopied(true);

    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleCopy}
          className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-accent"
        >
          {copied ? "Copied" : "Copy Lyrics"}
        </button>
      </div>

      <div className="space-y-14">
        {stanzas.map((stanza, i) => {
          if (isDivider(stanza)) {
            return <RefrainDivider key={i} />;
          }

          return (
            <div key={i} className="arabic-text">
              {stanza.map((line, j) => (
                <p key={j}>{line}</p>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}