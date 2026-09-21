import type { MetadataRoute } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const SITE_URL = "https://latmiyyahvault.com";

// Refresh the sitemap periodically so newly published latmiyyahs appear automatically
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerSupabaseClient();

  const { data } = await supabase
    .from("latmiyyahs")
    .select("slug, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const latmiyyahPages: MetadataRoute.Sitemap = (data || []).map((item) => ({
    url: `${SITE_URL}/latmiyyah/${item.slug}`,
    lastModified: item.created_at
      ? new Date(item.created_at)
      : new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...latmiyyahPages,
  ];
}