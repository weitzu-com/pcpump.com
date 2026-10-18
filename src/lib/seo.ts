import type { Metadata } from "next";
import type { Locale } from "@/lib/site-content";

export const baseUrl = "https://www.pcpump.com";

/**
 * Routes whose ES/RU versions still render English body copy (checked against the
 * built pages on 2026-10-18). Until a reviewed translation exists, the ES/RU
 * versions are kept out of the sitemap and hreflang clusters and served noindex,follow.
 * "" is the locale home page.
 */
export const untranslatedSlugs = new Set<string>([
  "",
  "pcp-systems",
  "downhole-pumps",
  "pcp-elastomers",
  "surface-drive-pcp",
  "engineering-inquiry",
  "technical-resources",
]);

export function isIndexable(locale: Locale, slug = "") {
  return locale === "en" || !untranslatedSlugs.has(slug);
}

/** hreflang alternates: only locales whose version is genuinely localized. */
export function languageAlternates(slug = ""): Record<string, string> | undefined {
  const suffix = slug ? `/${slug}` : "";
  if (untranslatedSlugs.has(slug)) return undefined; // English only: no cluster to declare
  return {
    en: `${baseUrl}/en${suffix}`,
    es: `${baseUrl}/es${suffix}`,
    ru: `${baseUrl}/ru${suffix}`,
    "x-default": `${baseUrl}/en${suffix}`,
  };
}

/** canonical + hreflang + robots for a localized route. */
export function localizedSeo(locale: Locale, slug = ""): Pick<Metadata, "alternates" | "robots"> {
  const suffix = slug ? `/${slug}` : "";
  const indexable = isIndexable(locale, slug);
  const languages = indexable ? languageAlternates(slug) : undefined;
  return {
    alternates: { canonical: `${baseUrl}/${locale}${suffix}`, ...(languages ? { languages } : {}) },
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
  };
}

export const organizationId = `${baseUrl}/#organization`;

/** Organization data limited to facts already published on the site. */
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": organizationId,
  name: "PCPUMP.COM",
  url: baseUrl,
  logo: `${baseUrl}/apple-icon`,
  email: "sales@pcpump.com",
  contactPoint: [{ "@type": "ContactPoint", contactType: "sales", email: "sales@pcpump.com" }],
};

export function jsonLdScript(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
