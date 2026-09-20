"use client";

import { useState } from "react";
import { parseStanzas } from "@/lib/types";

export default function TranslationView({
  arabicText,
  englishText,
}: {
  arabicText: string;
  englishText: string;
}) {
  const [copied, setCopied] = useState(false);
  const arabicStanzas = parseStanzas(arabicText);
  const englishStanzas = parseStanzas(englishText);

  async function handleCopy() {
    const stanzaBlocks = arabicStanzas.map((stanza, i) => {
      const englishStanza = englishStanzas[i] || [];
      return stanza.map((line, j) => `${line}\n${englishStanza[j] || ""}`).join("\n\n");
    });
    await navigator.clipboard.writeText(stanzaBlocks.join("\n\n\n"));
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
          {copied ? "Copied" : "Copy Translation"}
        </button>
      </div>
      <div className="space-y-20">
        {arabicStanzas.map((stanza, i) => {
          const englishStanza = englishStanzas[i] || [];
          return (
            <div key={i} className="space-y-3">
              {stanza.map((line, j) => (
                <div key={j}>
                  <p className="arabic-text">{line}</p>
                  <p className="mt-1 text-muted">{englishStanza[j] || ""}</p>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
