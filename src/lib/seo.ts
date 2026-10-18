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

/**
 * PCP overview topic ("progressive cavity pump" / "PCP pump"): one canonical owner per locale.
 * EN owner is /en/pcp-systems (/en/progressive-cavity-pumps 308-redirects there, see next.config.ts).
 * ES/RU owners are the translated /es|ru/progressive-cavity-pumps pages; /es|ru/pcp-systems are
 * untranslated (noindex) and stay out of the cluster.
 */
/** Cross-slug hreflang clusters (paths without host). hreflang output and the language switcher both use these. */
const crossSlugClusters: Record<string, string>[] = [
  { en: "/en/pcp-systems", es: "/es/progressive-cavity-pumps", ru: "/ru/progressive-cavity-pumps" },
];
const pcpOverviewCluster = {
  en: `${baseUrl}${crossSlugClusters[0].en}`,
  es: `${baseUrl}${crossSlugClusters[0].es}`,
  ru: `${baseUrl}${crossSlugClusters[0].ru}`,
  "x-default": `${baseUrl}${crossSlugClusters[0].en}`,
};

/** Routes that permanently redirect elsewhere: never rendered as indexable, never in the sitemap. */
export const redirectedRoutes: Record<string, string> = {
  "/en/progressive-cavity-pumps": "/en/pcp-systems",
};

export function isRedirected(locale: Locale, slug = "") {
  return `/${locale}${slug ? `/${slug}` : ""}` in redirectedRoutes;
}

/** Language-switcher target: the cluster sibling when the current page is in a cross-slug cluster. */
export function switcherHref(currentPath: string, targetLocale: Locale | string, slug = "") {
  const path = currentPath.replace(/\/+$/, "") || "/";
  const cluster = crossSlugClusters.find((c) => Object.values(c).includes(path));
  if (cluster?.[targetLocale]) return cluster[targetLocale];
  return localHref(targetLocale, slug);
}

/** Internal href that never points at a redirecting URL. */
export function localHref(locale: Locale | string, slug = "") {
  const path = `/${locale}${slug ? `/${slug}` : ""}`;
  return redirectedRoutes[path] ?? path;
}

/** hreflang alternates: only self-canonical, indexable, genuinely localized versions. */
export function languageAlternates(locale: Locale, slug = ""): Record<string, string> | undefined {
  if ((locale === "en" && slug === "pcp-systems") || (locale !== "en" && slug === "progressive-cavity-pumps")) return pcpOverviewCluster;
  if (slug === "progressive-cavity-pumps" || slug === "pcp-systems") return undefined;
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
  const languages = indexable ? languageAlternates(locale, slug) : undefined;
  return {
    alternates: { canonical: `${baseUrl}/${locale}${suffix}`, ...(languages ? { languages } : {}) },
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
  };
}

export const organizationId = `${baseUrl}/#organization`;

/** Organization data limited to facts already published on the site. */
/** Brand name used in titles, og:site_name and structured data. */
export const brandName = "PCPUMP";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": organizationId,
  name: brandName,
  alternateName: ["PCPUMP.COM", "pcpump.com"],
  url: baseUrl,
  logo: `${baseUrl}/apple-icon`,
  email: "sales@pcpump.com",
  contactPoint: [{ "@type": "ContactPoint", contactType: "sales", email: "sales@pcpump.com" }],
};

export function jsonLdScript(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
