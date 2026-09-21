import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/login",
        "/favourites",
      ],
    },

    sitemap: "https://latmiyyahvault.com/sitemap.xml",

    host: "https://latmiyyahvault.com",
  };
}