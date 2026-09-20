"use client";

import { useState } from "react";
import { parseStanzas } from "@/lib/types";

export default function LyricsView({ arabicText }: { arabicText: string }) {
  const [copied, setCopied] = useState(false);
  const stanzas = parseStanzas(arabicText);

  async function handleCopy() {
    const text = stanzas.map((s) => s.join("\n")).join("\n\n");
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
      <div className="space-y-20">
        {stanzas.map((stanza, i) => (
          <div key={i} className="arabic-text">
            {stanza.map((line, j) => (
              <p key={j}>{line}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
