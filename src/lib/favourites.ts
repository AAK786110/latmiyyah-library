"use client";

const KEY = "latmiyyah_favourites_v1";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("favourites-changed"));
}

export function getFavourites(): string[] {
  return read();
}

export function isFavourite(id: string): boolean {
  return read().includes(id);
}

export function toggleFavourite(id: string): boolean {
  const current = read();
  const idx = current.indexOf(id);
  if (idx === -1) {
    current.push(id);
    write(current);
    return true;
  } else {
    current.splice(idx, 1);
    write(current);
    return false;
  }
}
