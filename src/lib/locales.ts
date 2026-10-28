/**
 * Batch0 frozen locale registry (JEV 2026-10-28).
 * `Locale` = URL path segment. BCP-47 for hreflang/lang may differ (e.g. zh → zh-Hans).
 * Do not machine-translate body content into content files for new locales.
 */

export const localeTiers = ["P0", "P1", "P2"] as const;
export type LocaleTier = (typeof localeTiers)[number];

export type LocaleDefinition = {
  /** URL path segment under /[locale] */
  path: string;
  /** BCP-47 tag for hreflang / html lang */
  bcp47: string;
  /** Native endonym for the language switcher (no flags) */
  name: string;
  dir: "ltr" | "rtl";
  tier: LocaleTier;
  /** Default robots for shell/pending locales; fa stays noindex until compliance gate */
  defaultIndexable: boolean;
};

/**
 * Frozen ~20 locales. Spanish stays `es` (not es-419). zh-Hans uses path `/zh`.
 */
export const localeDefinitions = [
  // P0
  { path: "en", bcp47: "en", name: "English", dir: "ltr", tier: "P0", defaultIndexable: true },
  { path: "es", bcp47: "es", name: "Español", dir: "ltr", tier: "P0", defaultIndexable: false },
  { path: "ru", bcp47: "ru", name: "Русский", dir: "ltr", tier: "P0", defaultIndexable: false },
  { path: "ar", bcp47: "ar", name: "العربية", dir: "rtl", tier: "P0", defaultIndexable: false },
  { path: "pt-BR", bcp47: "pt-BR", name: "Português (Brasil)", dir: "ltr", tier: "P0", defaultIndexable: false },
  { path: "fr", bcp47: "fr", name: "Français", dir: "ltr", tier: "P0", defaultIndexable: false },
  // P1
  { path: "zh", bcp47: "zh-Hans", name: "简体中文", dir: "ltr", tier: "P1", defaultIndexable: false },
  { path: "id", bcp47: "id", name: "Bahasa Indonesia", dir: "ltr", tier: "P1", defaultIndexable: false },
  { path: "tr", bcp47: "tr", name: "Türkçe", dir: "ltr", tier: "P1", defaultIndexable: false },
  { path: "fa", bcp47: "fa", name: "فارسی", dir: "rtl", tier: "P1", defaultIndexable: false },
  { path: "kk", bcp47: "kk", name: "Қазақша", dir: "ltr", tier: "P1", defaultIndexable: false },
  { path: "vi", bcp47: "vi", name: "Tiếng Việt", dir: "ltr", tier: "P1", defaultIndexable: false },
  // P2
  { path: "th", bcp47: "th", name: "ไทย", dir: "ltr", tier: "P2", defaultIndexable: false },
  { path: "az", bcp47: "az", name: "Azərbaycan", dir: "ltr", tier: "P2", defaultIndexable: false },
  { path: "uz", bcp47: "uz", name: "Oʻzbekcha", dir: "ltr", tier: "P2", defaultIndexable: false },
  { path: "de", bcp47: "de", name: "Deutsch", dir: "ltr", tier: "P2", defaultIndexable: false },
  { path: "it", bcp47: "it", name: "Italiano", dir: "ltr", tier: "P2", defaultIndexable: false },
  { path: "ms", bcp47: "ms", name: "Bahasa Melayu", dir: "ltr", tier: "P2", defaultIndexable: false },
  { path: "hi", bcp47: "hi", name: "हिन्दी", dir: "ltr", tier: "P2", defaultIndexable: false },
  { path: "uk", bcp47: "uk", name: "Українська", dir: "ltr", tier: "P2", defaultIndexable: false },
] as const satisfies readonly LocaleDefinition[];

export type Locale = (typeof localeDefinitions)[number]["path"];
export const locales: readonly Locale[] = localeDefinitions.map((d) => d.path);

const byPath = Object.fromEntries(localeDefinitions.map((d) => [d.path, d])) as Record<
  Locale,
  (typeof localeDefinitions)[number]
>;

export function isLocale(value: string): value is Locale {
  return value in byPath;
}

export function localeDef(locale: Locale) {
  return byPath[locale];
}

export function hreflangCode(locale: Locale): string {
  return byPath[locale].bcp47;
}

export function localeDir(locale: Locale): "ltr" | "rtl" {
  return byPath[locale].dir;
}

export function htmlLang(locale: Locale): string {
  return byPath[locale].bcp47;
}

export const localeNames = Object.fromEntries(localeDefinitions.map((d) => [d.path, d.name])) as Record<
  Locale,
  string
>;

/** Locales shown in the language switcher list (all frozen codes). */
export const switcherLocales: readonly Locale[] = locales;

/** Locales that already carry human-authored chrome/copy in site-content (en/es/ru). */
export const contentLocales = ["en", "es", "ru"] as const;
export type ContentLocale = (typeof contentLocales)[number];

export function isContentLocale(locale: Locale): locale is ContentLocale {
  return (contentLocales as readonly string[]).includes(locale);
}
