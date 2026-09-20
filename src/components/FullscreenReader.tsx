"use client";

import { useEffect, useState } from "react";

export default function FullscreenReader({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActive(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (active) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-bg">
        <button
          onClick={() => setActive(false)}
          className="fixed right-4 top-4 z-10 rounded-full border border-border bg-surface px-3 py-1.5 text-sm"
        >
          ✕ Exit
        </button>
        <div className="mx-auto max-w-2xl px-6 py-16">{children}</div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setActive(true)}
      className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-accent"
    >
      ⛶ Fullscreen Reading
    </button>
  );
}
