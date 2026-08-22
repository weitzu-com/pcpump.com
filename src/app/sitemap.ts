import type { MetadataRoute } from "next";
import { locales, pages } from "@/lib/site-content";

const baseUrl = "https://www.pcpump.com";
const lastModified = new Date("2026-08-22T00:00:00.000Z");

function languageAlternates(slug?: string) {
  const suffix = slug ? `/${slug}` : "";
  return {
    en: `${baseUrl}/en${suffix}`,
    es: `${baseUrl}/es${suffix}`,
    ru: `${baseUrl}/ru${suffix}`,
    "x-default": `${baseUrl}/en${suffix}`,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const homes: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 1,
    alternates: { languages: languageAlternates() },
  }));

  const detailPages: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    pages.map((page) => ({
      url: `${baseUrl}/${locale}/${page.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: page.slug === "products" ? 0.9 : 0.7,
      alternates: { languages: languageAlternates(page.slug) },
    })),
  );

  return [...homes, ...detailPages];
}
