import assert from "node:assert/strict";

const base = process.env.AUDIT_BASE_URL ?? "http://127.0.0.1:3000";
const canonicalBase = "https://www.pcpump.com";
const locales = ["en", "es", "ru"];
const forbidden = ["highland", "shandong", "weatherford", "sinopec", "cnpc", "shengli", "高原", "山东", "胜利"];

const root = await fetch(base, { redirect: "manual" });
assert.equal(root.status, 307, "Root must redirect with HTTP 307");
assert.equal(root.headers.get("location"), "/en", "Root must redirect to /en");
assert.equal(root.headers.get("x-content-type-options"), "nosniff");

const sitemapResponse = await fetch(`${base}/sitemap.xml`);
assert.equal(sitemapResponse.status, 200, "Sitemap must return 200");
const sitemap = await sitemapResponse.text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const byLocale = Object.create(null);
for (const url of urls) {
  const locale = url.replace(canonicalBase, "").split("/")[1];
  byLocale[locale] = (byLocale[locale] ?? 0) + 1;
}
// Batch0+: sitemap mirrors isIndexable — empty humanAccepted ⇒ English only (no /es/* or /ru/*).
assert.equal(byLocale.es ?? 0, 0, "Sitemap must not list /es/* until humanAccepted");
assert.equal(byLocale.ru ?? 0, 0, "Sitemap must not list /ru/* until humanAccepted");
assert.ok((byLocale.en ?? 0) > 0, "Sitemap must retain English URLs");
assert.equal(urls.length, byLocale.en, "Sitemap must be English-only while humanAccepted is empty");
assert.equal(new Set(urls).size, urls.length, "Sitemap URLs must be unique");

const failures = [];
for (const canonicalUrl of urls) {
  const path = canonicalUrl.replace(canonicalBase, "");
  const locale = path.split("/")[1];
  const response = await fetch(`${base}${path}`);
  const html = await response.text();
  const lower = html.toLowerCase();

  if (response.status !== 200) failures.push(`${path}: HTTP ${response.status}`);
  if (!locales.includes(locale)) failures.push(`${path}: invalid locale`);
  if (!html.includes(`<html lang="${locale}">`)) failures.push(`${path}: wrong html lang`);
  if ((html.match(/<h1[ >]/g) ?? []).length !== 1) failures.push(`${path}: must have exactly one H1`);
  if (!html.includes(`<link rel="canonical" href="${canonicalUrl}"`)) failures.push(`${path}: canonical mismatch`);
  if (!lower.includes('hreflang="x-default"')) failures.push(`${path}: missing x-default hreflang`);
  if (!html.includes('type="application/ld+json"')) failures.push(`${path}: missing JSON-LD`);
  if (!lower.includes("sales@pcpump.com")) failures.push(`${path}: missing sales email`);
  if (lower.includes("localhost:3000")) failures.push(`${path}: localhost leaked into metadata`);
  for (const term of forbidden) {
    if (lower.includes(term)) failures.push(`${path}: forbidden source identity ${term}`);
  }
}

const robots = await fetch(`${base}/robots.txt`);
const robotsText = await robots.text();
assert.equal(robots.status, 200);
assert.match(robotsText, /Sitemap: https:\/\/www\.pcpump\.com\/sitemap\.xml/);

const llms = await fetch(`${base}/llms.txt`);
assert.equal(llms.status, 200);
assert.match(await llms.text(), /sales@pcpump\.com/);

if (failures.length) {
  throw new Error(`Site audit failed:\n${failures.join("\n")}`);
}

console.log(`Site audit passed: ${urls.length} localized pages, redirects, metadata, JSON-LD, identity and contact checks.`);
