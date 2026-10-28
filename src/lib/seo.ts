import type { Metadata } from "next";
import {
  hreflangCode,
  type Locale,
  locales,
} from "@/lib/locales";

export const baseUrl = "https://www.pcpump.com";

/**
 * Historical note (Batch0/Batch1): ES/RU routes that still rendered English body
 * copy as of 2026-10-18. Indexability is no longer derived from this set —
 * only `humanAccepted` (plus English) gates sitemap/robots/hreflang via
 * isIndexable. Kept for Batch1 translation prioritization.
 */
export const untranslatedSlugs = new Set<string>([
  "pcp-systems",
  "downhole-pumps",
  "pcp-elastomers",
  "surface-drive-pcp",
  "engineering-inquiry",
  "technical-resources",
]);

/**
 * Historical note: es/ru homes that served English PCP shell body.
 * Indexability is gated solely by humanAccepted (empty → English only).
 */
export const untranslatedHomeLocales = new Set<string>(["es", "ru"]);

/**
 * Explicit human-accepted locale+slug pairs. Format: `${locale}:${slug}`
 * (slug "" for home). Empty after Batch0 — only English is indexable until
 * Batch1+ adds reviewed pairs. fa stays out until the compliance gate.
 * Sitemap, robots (localizedSeo), and hreflang all share isIndexable → this set.
 */
export const humanAccepted = new Set<string>([]);

/** True only for English or an explicit humanAccepted locale+slug pair. */
export function isHumanAccepted(locale: Locale, slug = ""): boolean {
  if (locale === "en") return true;
  return humanAccepted.has(`${locale}:${slug}`);
}

export function isIndexable(locale: Locale, slug = "") {
  if (isRedirected(locale, slug)) return false;
  return isHumanAccepted(locale, slug);
}

/**
 * Quiet pending / English-fallback hint: show for any non-indexable localized URL
 * (shell locales, English-body es/ru pages, pending homes).
 */
export function isPendingLocalePage(locale: Locale, slug = ""): boolean {
  if (locale === "en") return false;
  return !isIndexable(locale, slug);
}

/**
 * PCP overview topic: EN owner is /en/pcp-systems.
 * ES/RU /progressive-cavity-pumps stay routable as shells but are noindex and
 * out of sitemap/hreflang until explicitly listed in humanAccepted (Batch1+).
 */
const crossSlugClusters: Record<string, string>[] = [
  { en: "/en/pcp-systems", es: "/es/progressive-cavity-pumps", ru: "/ru/progressive-cavity-pumps" },
];

/** Routes that permanently redirect elsewhere: never rendered as indexable, never in the sitemap. */
export const redirectedRoutes: Record<string, string> = {
  "/en/progressive-cavity-pumps": "/en/pcp-systems",
};

export function isRedirected(locale: Locale, slug = "") {
  return `/${locale}${slug ? `/${slug}` : ""}` in redirectedRoutes;
}

/** Language-switcher target: cluster sibling when current page is in a cross-slug cluster. */
export function switcherHref(currentPath: string, targetLocale: Locale | string, slug = "") {
  const path = currentPath.replace(/\/+$/, "") || "/";
  const cluster = crossSlugClusters.find((c) => Object.values(c).includes(path));
  if (cluster?.[targetLocale]) return cluster[targetLocale];
  return localHref(targetLocale, slug);
}

/** Fallback when a translation is missing: locale home (quiet hint shown there / on shell). */
export function switcherFallbackHref(targetLocale: Locale | string) {
  return localHref(targetLocale, "");
}

/** Internal href that never points at a redirecting URL. */
export function localHref(locale: Locale | string, slug = "") {
  const path = `/${locale}${slug ? `/${slug}` : ""}`;
  return redirectedRoutes[path] ?? path;
}

function slugFromClusterPath(path: string): { locale: Locale; slug: string } | null {
  const parts = path.replace(/^\//, "").split("/");
  if (!parts[0]) return null;
  return { locale: parts[0] as Locale, slug: parts.slice(1).join("/") };
}

/** hreflang alternates: only indexable human-accepted locale+URL pairs. x-default → en. */
export function languageAlternates(locale: Locale, slug = ""): Record<string, string> | undefined {
  if (!isIndexable(locale, slug)) return undefined;

  if (
    (locale === "en" && slug === "pcp-systems") ||
    (locale !== "en" && slug === "progressive-cavity-pumps")
  ) {
    const cluster = crossSlugClusters[0];
    const languages: Record<string, string> = {};
    for (const path of Object.values(cluster)) {
      const parsed = slugFromClusterPath(path);
      if (!parsed || !isIndexable(parsed.locale, parsed.slug)) continue;
      languages[hreflangCode(parsed.locale)] = `${baseUrl}${path}`;
    }
    languages["x-default"] = `${baseUrl}/en/pcp-systems`;
    return languages;
  }

  if (slug === "progressive-cavity-pumps" || slug === "pcp-systems") return undefined;

  if (slug === "") {
    const homes: Record<string, string> = {};
    for (const l of locales) {
      if (isIndexable(l)) homes[hreflangCode(l)] = `${baseUrl}/${l}`;
    }
    return { ...homes, "x-default": `${baseUrl}/en` };
  }

  const suffix = slug ? `/${slug}` : "";
  const languages: Record<string, string> = {};
  for (const l of locales) {
    if (!isIndexable(l, slug)) continue;
    languages[hreflangCode(l)] = `${baseUrl}/${l}${suffix}`;
  }
  if (!languages[hreflangCode("en")]) return undefined;
  return { ...languages, "x-default": `${baseUrl}/en${suffix}` };
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
