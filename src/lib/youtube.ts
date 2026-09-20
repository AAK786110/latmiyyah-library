// Extracts a YouTube video ID from any common URL format
// (youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...).
// Returns null if the input isn't a recognizable YouTube URL.
export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "") || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      if (parsed.pathname.startsWith("/embed/")) return parsed.pathname.split("/embed/")[1] || null;
      if (parsed.pathname.startsWith("/shorts/")) return parsed.pathname.split("/shorts/")[1] || null;
    }
    return null;
  } catch {
    return null;
  }
}

// Free, no-API-key thumbnail URL that YouTube serves for every video.
export function youTubeThumbnail(url: string | null | undefined): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}