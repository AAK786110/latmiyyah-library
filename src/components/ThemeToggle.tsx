"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "latmiyyah_theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY) as "dark" | "light" | null;
    const initial = stored || "light";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem(THEME_KEY, next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark/light mode"
      className="rounded-full border border-border px-3 py-1.5 text-sm hover:bg-surface transition-colors"
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}

