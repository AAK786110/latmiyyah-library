"use client";

import { useMemo, useState } from "react";
import type { Tag, TagCategory } from "@/lib/types";

export interface FilterState {
  holy_personality: string[]; // tag ids, OR'd within category
  context: string[];
  speed: string[];
  reciters: string[]; // reciter name strings, OR'd within category
}

export const EMPTY_FILTERS: FilterState = {
  holy_personality: [],
  context: [],
  speed: [],
  reciters: [],
};

function CategoryDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { id: string; name: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase())),
    [options, query]
  );

  function toggle(id: string) {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm"
      >
        <span>
          {label}
          {selected.length > 0 && (
            <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-xs text-accentFg">
              {selected.length}
            </span>
          )}
        </span>
        <span aria-hidden>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-64 rounded-lg border border-border bg-surface p-2 shadow-xl">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}...`}
            className="mb-2 w-full rounded border border-border bg-bg px-2 py-1.5 text-sm outline-none"
          />
          <div className="mb-2 flex justify-between text-xs">
            <button
              type="button"
              className="text-accent hover:underline"
              onClick={() => onChange(options.map((o) => o.id))}
            >
              Select all
            </button>
            <button
              type="button"
              className="text-muted hover:underline"
              onClick={() => onChange([])}
            >
              Clear
            </button>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-2 py-1 text-sm text-muted">No matches.</p>
            )}
            {filtered.map((opt) => (
              <label
                key={opt.id}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-bg"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt.id)}
                  onChange={() => toggle(opt.id)}
                />
                {opt.name}
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-2 w-full rounded bg-accent py-1.5 text-sm text-accentFg"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

export default function FilterPanel({
  tags,
  reciters,
  filters,
  onChange,
}: {
  tags: Tag[];
  reciters: string[];
  filters: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const byCategory = (cat: TagCategory) =>
    tags.filter((t) => t.category === cat).map((t) => ({ id: t.id, name: t.name }));

  const hasAny =
    filters.holy_personality.length + filters.context.length + filters.speed.length + filters.reciters.length > 0;

  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <CategoryDropdown
          label="Holy Personality"
          options={byCategory("holy_personality")}
          selected={filters.holy_personality}
          onChange={(v) => onChange({ ...filters, holy_personality: v })}
        />
        <CategoryDropdown
          label="Context"
          options={byCategory("context")}
          selected={filters.context}
          onChange={(v) => onChange({ ...filters, context: v })}
        />
        <CategoryDropdown
          label="Speed"
          options={byCategory("speed")}
          selected={filters.speed}
          onChange={(v) => onChange({ ...filters, speed: v })}
        />
        <CategoryDropdown
          label="Reciter"
          options={reciters.map((r) => ({ id: r, name: r }))}
          selected={filters.reciters}
          onChange={(v) => onChange({ ...filters, reciters: v })}
        />
      </div>
      {hasAny && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="mt-2 text-xs text-muted hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
