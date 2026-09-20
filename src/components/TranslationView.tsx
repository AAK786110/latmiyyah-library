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

      if (isDivider(stanza)) {
        return "✦";
      }

      return stanza
        .map(
          (line, j) =>
            `${line}\n${englishStanza[j] || ""}`
        )
        .join("\n\n");
    });

    await navigator.clipboard.writeText(
      stanzaBlocks.join("\n\n\n")
    );

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

      <div className="space-y-14">
        {arabicStanzas.map((stanza, i) => {
          const englishStanza = englishStanzas[i] || [];

          if (isDivider(stanza)) {
            return <RefrainDivider key={i} />;
          }

          return (
            <div key={i} className="space-y-3">
              {stanza.map((line, j) => (
                <div key={j}>
                  <p className="arabic-text">
                    {line}
                  </p>

                  <p className="mt-1 text-muted">
                    {englishStanza[j] || ""}
                  </p>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}