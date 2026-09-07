import type { MetadataRoute } from "next";

// Only public marketing pages belong here — staff areas stay out so search
// engines never index login screens or dashboards.
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();
  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/portal`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
