import { pcpSlugs } from "@/lib/pcp-navigation";
import type { MetadataRoute } from "next";
import { locales } from "@/lib/locales";
import { pages } from "@/lib/site-content";
import { baseUrl, isIndexable, isRedirected, languageAlternates } from "@/lib/seo";

const lastModified = new Date("2026-10-17T16:39:43.000Z");

function entry(locale: (typeof locales)[number], slug: string, priority: number, changeFrequency: "weekly" | "monthly") {
  const languages = languageAlternates(locale, slug);
  return {
    url: `${baseUrl}/${locale}${slug ? `/${slug}` : ""}`,
    lastModified,
    changeFrequency,
    priority,
    ...(languages ? { alternates: { languages } } : {}),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = [...new Set([...pages.map(p=>p.slug),...pcpSlugs,'technical-resources'])];
  // Only isIndexable (humanAccepted / en) locale+URL pairs; redirected routes excluded (src/lib/seo.ts).
  const homes = locales.filter((locale) => isIndexable(locale)).map((locale) => entry(locale, "", 1, "weekly"));
  const detailPages = locales.flatMap((locale) =>
    slugs.filter((slug) => isIndexable(locale, slug) && !isRedirected(locale, slug)).map((slug) => entry(locale, slug, slug === "products" ? 0.9 : 0.7, "monthly")),
  );
  return [...homes, ...detailPages];
}
