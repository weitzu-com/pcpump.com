/**
 * Sanity check: count locale+URL pairs that would enter the sitemap under
 * current isIndexable / humanAccepted rules (mirrors src/app/sitemap.ts).
 *
 * Usage: node scripts/count-sitemap-locales.mjs
 *
 * Before fix (production): ~38 en + ~32 es + ~32 ru ≈ 102
 * After fix (empty humanAccepted): en only; es=0 ru=0
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seo = readFileSync(join(root, "src/lib/seo.ts"), "utf8");
const localesSrc = readFileSync(join(root, "src/lib/locales.ts"), "utf8");
const siteContent = readFileSync(join(root, "src/lib/site-content.ts"), "utf8");
const pcpNav = readFileSync(join(root, "src/lib/pcp-navigation.ts"), "utf8");

const locales = [...localesSrc.matchAll(/path:\s*"([^"]+)"/g)].map((m) => m[1]);
const pageSlugs = [...siteContent.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
const pcpMatch = pcpNav.match(/export const pcpSlugs[^=]*=\s*\[([\s\S]*?)\]/);
const pcpSlugs = pcpMatch ? [...pcpMatch[1].matchAll(/["']([^"']+)["']/g)].map((m) => m[1]) : [];
const slugs = [...new Set([...pageSlugs, ...pcpSlugs, "technical-resources"])];

const haBlock = seo.match(/export const humanAccepted\s*=\s*new Set<string>\(\[([\s\S]*?)\]\)/);
const humanAccepted = new Set(
  haBlock ? [...haBlock[1].matchAll(/["']([^"']+)["']/g)].map((x) => x[1]) : [],
);
const rdBlock = seo.match(/export const redirectedRoutes[^=]*=\s*\{([\s\S]*?)\n\};/);
const redirected = new Set(
  rdBlock ? [...rdBlock[1].matchAll(/["'](\/[^"']+)["']/g)].map((x) => x[1]) : [],
);

function isHumanAccepted(locale, slug = "") {
  if (locale === "en") return true;
  return humanAccepted.has(`${locale}:${slug}`);
}
function isRedirected(locale, slug = "") {
  return redirected.has(`/${locale}${slug ? `/${slug}` : ""}`);
}
function isIndexable(locale, slug = "") {
  if (isRedirected(locale, slug)) return false;
  return isHumanAccepted(locale, slug);
}

const counts = Object.create(null);
let total = 0;
for (const locale of locales) {
  if (isIndexable(locale)) {
    counts[locale] = (counts[locale] ?? 0) + 1;
    total++;
  }
  for (const slug of slugs) {
    if (!isIndexable(locale, slug) || isRedirected(locale, slug)) continue;
    counts[locale] = (counts[locale] ?? 0) + 1;
    total++;
  }
}

console.log("humanAccepted size:", humanAccepted.size);
console.log("sitemap-equivalent counts by locale:", counts);
console.log("total:", total);
console.log("en:", counts.en ?? 0, "es:", counts.es ?? 0, "ru:", counts.ru ?? 0);

if (humanAccepted.size === 0 && ((counts.es ?? 0) !== 0 || (counts.ru ?? 0) !== 0)) {
  console.error("FAIL: empty humanAccepted but es/ru still indexable");
  process.exit(1);
}
if ((counts.en ?? 0) < 1) {
  console.error("FAIL: no English URLs");
  process.exit(1);
}
console.log("OK");
